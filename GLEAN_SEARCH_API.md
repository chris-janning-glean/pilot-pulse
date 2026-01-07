# Glean Search API Usage – Cursor Project Instructions

## 1. Base configuration

- API endpoint (scio-prod):

  - `POST https://scio-prod-be.glean.com/rest/api/v1/search`

- Auth:

  - Environment variable: `GLEAN_CLIENT_API_TOKEN`
  - Headers on every request:
    - `Authorization: Bearer ${GLEAN_CLIENT_API_TOKEN}`
    - `Content-Type: application/json`

- Use Node 18+ `fetch`.

---

## 2. How to build search requests

### 2.1 Don't rely only on `app:` / `component:` text operators

When reproducing a UI query like:

```text
app:jira component:"GleanChat Bad Queries" generalmotors
```

you MUST convert the operators to **structured filters**:

- `app:jira` → `requestOptions.datasourcesFilter = ["jira"]`
- `component:"GleanChat Bad Queries"` → `requestOptions.facetFilters` on `fieldName: "component"`
- `generalmotors` stays in `query` (or set `query: ""` if you want all issues for that component)

### 2.2 Recommended request body for the GM / GleanChat Bad Queries use case

```jsonc
{
  "query": "generalmotors",  // or "" to ignore text and return all issues for the component
  "pageSize": 100,
  "requestOptions": {
    "datasourcesFilter": ["jira"],
    "facetFilters": [
      {
        "fieldName": "component",
        "values": [
          {
            "value": "GleanChat Bad Queries",
            "relationType": "EQUALS"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Cursor / pagination rules

For `/rest/api/v1/search`:

1. First page: **omit `cursor`**.
2. Subsequent pages: **include `cursor`** from the previous response.
3. Keep paginating **while**:
   - `cursor` is present, **and**
   - `hasMoreResults` is `true` or missing.
4. Stop only when:
   - `cursor` is missing / empty, **or**
   - `hasMoreResults === false`.

Do **not** stop just because `results.length < pageSize`.

---

## 4. Counting results like the UI (36 vs 149 issue)

The Search API clusters results:

- `results[]` = cluster heads (what you see as rows).
- Each `results[i].backlinkResults[]` = the "Similar results" / "See N more" tickets.

The Jira tab count (e.g. `Jira (Cloud) 149+`) is effectively:

> all Jira docs in `results[]` **plus** all Jira docs in each `backlinkResults[]`.

So to match the UI, count both.

---

## 5. Ready‑to‑use TypeScript helper

Create a file like `gleanSearch.ts` with the following content:

```ts
import 'dotenv/config';

// ---------- CONFIG ----------
const INSTANCE = 'scio-prod';
const API_URL = `https://${INSTANCE}-be.glean.com/rest/api/v1/search`;
const TOKEN = process.env.GLEAN_CLIENT_API_TOKEN;

if (!TOKEN) {
  throw new Error('Set GLEAN_CLIENT_API_TOKEN in your environment.');
}

// ---------- TYPES ----------
interface Doc {
  datasource?: string;
  id?: string;
  title?: string;
  url?: string;
  metadata?: {
    documentId?: string;
    [k: string]: unknown;
  };
}

interface BacklinkResult {
  document?: Doc;
}

interface SearchResult {
  document?: Doc;
  backlinkResults?: BacklinkResult[];
  [key: string]: unknown;
}

interface SearchResponse {
  results?: SearchResult[];
  cursor?: string;
  hasMoreResults?: boolean;
  [key: string]: unknown;
}

// ---------- GENERIC PAGINATION HELPER ----------
export async function searchAllPages(
  baseBody: Record<string, unknown>,
  pageSize = 100
): Promise<SearchResult[]> {
  const all: SearchResult[] = [];
  let cursor: string | undefined;
  let page = 0;

  while (true) {
    const body: Record<string, unknown> = {
      ...baseBody,
      pageSize,
    };
    if (cursor) {
      body.cursor = cursor;
    }

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${text}`);
    }

    const data = (await resp.json()) as SearchResponse;
    const pageResults = data.results ?? [];
    all.push(...pageResults);
    page += 1;

    console.log(
      `Fetched page ${page}: ${pageResults.length} results (total so far: ${all.length})`
    );

    // UPDATED CURSOR LOGIC
    cursor = data.cursor;
    const hasMore = data.hasMoreResults;

    if (!cursor || hasMore === false) {
      break;
    }
  }

  return all;
}

// ---------- COUNT LIKE THE UI ----------
export function countJiraIssuesLikeUI(results: SearchResult[]): number {
  let total = 0;

  for (const r of results) {
    // top-level Jira hit
    if (r.document?.datasource === 'jira') {
      total += 1;
    }

    // clustered / similar Jira hits
    const backlinks = r.backlinkResults ?? [];
    total += backlinks.filter(
      (b) => b.document?.datasource === 'jira'
    ).length;
  }

  return total;
}

// ---------- SPECIFIC GM / GLEANCHAT BAD QUERIES QUERY ----------
export async function fetchGmGleanChatIssues(
  includeTextFilter = true
): Promise<SearchResult[]> {
  // If includeTextFilter=false, we ignore "generalmotors" and return
  // all Jira issues for that component (closer to 149+).
  const query = includeTextFilter ? 'generalmotors' : '';

  const baseBody: Record<string, unknown> = {
    query,
    requestOptions: {
      datasourcesFilter: ['jira'],
      facetFilters: [
        {
          fieldName: 'component',
          values: [
            {
              value: 'GleanChat Bad Queries',
              relationType: 'EQUALS',
            },
          ],
        },
      ],
    },
  };

  return searchAllPages(baseBody, 100);
}

// ---------- SIMPLE CLI ENTRYPOINT ----------
if (require.main === module) {
  (async () => {
    // Set to false if you want ALL issues for the component (UI ~149),
    // true if you only want ones that also match "generalmotors".
    const includeTextFilter = false;

    const results = await fetchGmGleanChatIssues(includeTextFilter);
    const totalJira = countJiraIssuesLikeUI(results);

    const topLevelJira = results.filter(
      (r) => r.document?.datasource === 'jira'
    ).length;

    console.log(`\nTop-level Jira hits: ${topLevelJira}`);
    console.log(
      `Total Jira issues including clustered/backlink results (UI-style): ${totalJira}`
    );

    // Example: print Jira key + title + URL for debugging
    for (const r of results) {
      const doc = r.document ?? {};
      const meta = doc.metadata ?? {};
      const jiraKey =
        (meta as any).documentId ?? doc.id ?? '';
      const title = doc.title ?? '';
      const url = doc.url ?? '';
      console.log(`${jiraKey}\t${title}\t${url}`);
    }
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

---

## 6. How to run

```bash
# in your project
export GLEAN_CLIENT_API_TOKEN="YOUR_CLIENT_API_TOKEN"

# using ts-node
ts-node gleanSearch.ts
```

- Set `includeTextFilter = false` in the CLI section to approximate the **UI's 149+ Jira count** for:
  - `component:"GleanChat Bad Queries"`
  - deployment = GM (glean-general-motors)

This gives Cursor everything it needs: correct **cursor usage**, correct **filtering**, and a **UI‑style count**.


