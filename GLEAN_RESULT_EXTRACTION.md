# Glean Search API Result Extraction - CRITICAL RULES

## ⚠️ MUST READ: Complete Result Extraction

When collecting and processing Glean Search API results, you **MUST** extract documents from ALL three locations:

### 1. Primary Results
```typescript
results[].document
```

### 2. Clustered Results
```typescript
results[].clusteredResults[].document
```

### 3. All Clustered Results (nested)
```typescript
results[].allClusteredResults[].clusteredResults[].document
```

## Why This Matters

**Many "real" Jira issues appear ONLY inside `clusteredResults` or `allClusteredResults`.**

If you only extract from `results[].document`, you will:
- ❌ Miss a significant portion of tickets (often 50%+ of total)
- ❌ Get incorrect counts that don't match the Glean UI
- ❌ Have incomplete data for analytics and reports

## Correct Implementation Pattern

```typescript
const allTickets: any[] = [];
const seenIds = new Set<string>();  // Deduplicate

for (const result of response.results) {
  // 1. Extract primary result
  if (result.document?.datasource === 'jira') {
    const id = result.document.id;
    if (!seenIds.has(id)) {
      allTickets.push(result.document);
      seenIds.add(id);
    }
  }

  // 2. Extract clusteredResults
  const clustered = result.clusteredResults || [];
  for (const cluster of clustered) {
    if (cluster.document?.datasource === 'jira') {
      const id = cluster.document.id;
      if (!seenIds.has(id)) {
        allTickets.push(cluster.document);
        seenIds.add(id);
      }
    }
  }

  // 3. Extract allClusteredResults
  const allClustered = result.allClusteredResults || [];
  for (const clusterGroup of allClustered) {
    const groupClustered = clusterGroup.clusteredResults || [];
    for (const cluster of groupClustered) {
      if (cluster.document?.datasource === 'jira') {
        const id = cluster.document.id;
        if (!seenIds.has(id)) {
          allTickets.push(cluster.document);
          seenIds.add(id);
        }
      }
    }
  }
}

// allTickets now contains ALL unique tickets
// This count will match the Glean UI "Found N results"
```

## Application to Business Logic

**ALL** downstream operations must use this complete set:

- ✅ **Counts**: Total issues matching Glean UI
- ✅ **Analytics**: Trend analysis by date
- ✅ **Exports**: CSV/Excel exports with all tickets
- ✅ **Sentiment Analysis**: Accurate positive/negative rates
- ✅ **Dashboards**: Complete data visualization

## Current Implementation

Our `page.tsx` implements this pattern in:
- `loadData()` function: Extracts all tickets from all three locations
- `calculateSearchStats()`: Counts all tickets with deduplication
- `generateTrendData()`: Groups all tickets by date
- Table display: Shows all unique tickets

## Validation

To verify your extraction is complete:
1. Count your extracted tickets
2. Compare to the Glean UI "Found N results" count
3. If they don't match, you're missing tickets from clustered results

**Remember**: If you want accurate counts and complete data, you MUST extract from all three locations!


