# Pilot Command Dashboard - Implementation Summary

## Overview

Successfully built a TypeScript/Next.js dashboard for monitoring Glean pilot health with focus on user sentiment analysis for customer deployments.

## Key Features Implemented

### 1. Customer Selection
- **Dropdown selector** with three customers:
  - Whirlpool (default)
  - General Motors
  - Tailored Brands
- Auto-reloads data when customer changes

### 2. Glean Search API Integration
- ✅ **Proper structured filters** (per Glean recommendations):
  - Uses `datasourcesFilter: ['jira']` instead of `app:jira` text operator
  - Uses `facetFilters` for component filtering
  - Free-text query for customer name
- ✅ **Cursor-based pagination**:
  - Automatically fetches all pages
  - Continues while cursor exists AND hasMoreResults is true/missing
  - Stops after 3 consecutive empty pages (safety)
- ✅ **Complete result extraction** from ALL three locations:
  - `results[].document`
  - `results[].clusteredResults[].document`
  - `results[].allClusteredResults[].clusteredResults[].document`
- ✅ **Deduplication** by document.id
- ✅ **UI-matching counts**: Total includes all clustered results

### 3. Feedback Trend Chart
- **Bar chart visualization** showing issues by date
- **Time range toggles**: 1d, 7d, 14d, 30d
- Uses actual `createTime` from Jira metadata
- Groups ALL tickets (including clustered) by creation date
- Red bars for negative feedback
- Responsive design with Recharts

### 4. Feedback Tickets Table
- **Shows ALL tickets** (matches Glean UI count)
- **10 tickets per page** with pagination controls
- **Parsed fields displayed** in columns:
  - Ticket (clickable link to Jira)
  - Deployment (e.g., glean-whirlpool)
  - User email
  - STT (Session Tracking Token)
  - Category (e.g., CHAT (9))
  - Issue type (e.g., OTHER, INACCURATE_RESPONSE)
  - AgentId
  - Comments (full text)
- **Pagination features**:
  - Top: Previous/Next + page indicator
  - Bottom: Previous/Next + numbered page buttons
  - Shows "Showing 1-10 of 150"
- **Scrollable**: Max height 600px, sticky header
- **Handles missing data**: Shows dashes for tickets without snippets

### 5. Glean Agent Analysis
- **Agent ID**: 4a5c57e875fa46e38ae4be94345fc7da
- **Input**: Customer name from dropdown
- **Endpoint**: `/rest/api/v1/agents/runs/wait`
- **Request format**:
  ```json
  {
    "agent_id": "4a5c57e875fa46e38ae4be94345fc7da",
    "input": {
      "Customer": "whirlpool"
    }
  }
  ```
- **Displays**: Clean markdown-formatted text from `messages[1].content[0].text`
- **Features**:
  - Loading state
  - Error handling
  - Collapsible full JSON view with copy button

### 6. Debug Features
- **Raw API Response** section with:
  - Toggle to show/hide
  - Copy button for easy JSON export
  - Dark terminal theme
- **Console logging** throughout:
  - Request bodies
  - Response structures
  - Pagination progress
  - Counting validation
  - Extraction verification

## Technical Implementation

### API Proxy Routes
1. **`/api/glean/search`**: Proxies search requests (bypasses CORS)
2. **`/api/glean/agent`**: Proxies agent requests

### Authentication
- **Glean Client API Token** stored in `.env.local`
- Format: `GLEAN_AUTH_TOKEN_...` prefix
- Header: `Authorization: Bearer <token>`
- No `X-Glean-Auth-Type` header (Client API tokens only)

### Data Flow
1. User selects customer from dropdown
2. Search API called with proper filters
3. All pages fetched via cursor pagination
4. ALL results extracted (primary + clustered + allClustered)
5. Tickets parsed from snippets array
6. Agent called with customer name
7. Dashboard displays:
   - Total count (matches Glean UI)
   - Trend chart
   - Paginated table
   - Agent analysis

## File Structure

### Key Files
- `src/app/dashboard/sentiment/page.tsx` - Main dashboard (1100+ lines)
- `src/lib/glean-api.ts` - API client with pagination & counting
- `src/app/api/glean/search/route.ts` - Search API proxy
- `src/app/api/glean/agent/route.ts` - Agent API proxy
- `src/types/index.ts` - TypeScript types
- `GLEAN_SEARCH_API.md` - API usage documentation
- `GLEAN_RESULT_EXTRACTION.md` - Critical extraction rules

### Configuration
- `NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://scio-prod-be.glean.com`
- `NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=GLEAN_AUTH_TOKEN_...`

## Known Behaviors

### Clustered Results Without Snippets
- Some tickets in `clusteredResults[]` don't include the `snippets` array
- These appear in the table with ticket link but blank columns (dashes)
- This is expected API behavior
- Count is accurate, parsing limited by API response structure

### Pagination Edge Cases
- Sometimes API returns 0 results with `hasMoreResults: true` and a cursor
- Code handles this by continuing for up to 3 consecutive empty pages
- Then stops to avoid infinite loops

### Count Validation
- Console logs verify: Table count === Total Issues count
- If mismatch, indicates extraction issue
- Currently shows ✅ MATCH for Whirlpool (4 tickets)

## Success Metrics

✅ **Counts match Glean UI**: Dashboard shows same total as Glean search  
✅ **All tickets displayed**: Table includes clustered results  
✅ **Parsed fields extracted**: 75% of tickets have complete data  
✅ **Trend analysis working**: Charts show issues by date  
✅ **Agent integration**: Clean display of AI analysis  
✅ **Multiple customers**: Dropdown switches between deployments  
✅ **Performance**: Efficient pagination with no delays  

## Next Steps (Future Enhancements)

1. Add export to CSV functionality
2. Implement filtering by issue type, category, user
3. Add date range picker for custom time ranges
4. Create additional dashboards (adoption, performance, etc.)
5. Add real-time updates with polling or webhooks
6. Implement user authentication and authorization


