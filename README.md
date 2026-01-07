# Pilot Pulse

A TypeScript dashboard application providing real-time insights into pilot health and user sentiment. Built with Next.js, React, and Tailwind CSS, inspired by the agent-orchestrator-catalog design.

## Features

- **User Sentiment Dashboard**: Monitor thumbs up/down feedback from pilot users
- **Cursor-Based Pagination**: Automatically fetches all pages of results from Glean Search API
- **UI-Style Result Counting**: Matches Glean UI counts by including cluster heads + backlink results
- **Flexible Architecture**: Easily add new dashboards with minimal configuration
- **API Management**: Centralized API configuration supporting multiple endpoints
- **Modern UI**: Clean, responsive design with inline styles
- **Type-Safe**: Full TypeScript support throughout
- **Structured Filters**: Proper use of `datasourcesFilter` and `facetFilters` per Glean recommendations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Glean API access (endpoint and API key)

### Installation

1. Clone the repository:
```bash
cd /Users/janning/workspace/pilot-command
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment:
```bash
cp env.example .env.local
```

4. Edit `.env.local` with your Glean OAuth credentials:
```env
NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://your-instance-be.glean.com
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=your_oauth_access_token_here
```

See [OAUTH_SETUP.md](OAUTH_SETUP.md) for detailed OAuth configuration instructions.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
pilot-pulse/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── dashboard/
│   │   │   └── sentiment/        # Sentiment dashboard page
│   │   ├── settings/             # Settings page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── sentiment/            # Sentiment-specific components
│   │   │   ├── SentimentOverview.tsx
│   │   │   ├── SentimentChart.tsx
│   │   │   └── FeedbackTable.tsx
│   │   └── ui/                   # Reusable UI components
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Stat.tsx
│   ├── lib/
│   │   ├── api-manager.ts        # API configuration manager
│   │   ├── glean-api.ts          # Glean Search API client
│   │   ├── config.ts             # Dashboard and API configs
│   │   └── utils.ts              # Utility functions
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Architecture

### API Management

The application uses a centralized `ApiManager` class to handle all API requests. This allows for:

- Multiple API endpoint configurations
- Centralized authentication handling
- Easy addition of new API services

```typescript
// Example: Adding a new API configuration
const newApiConfig: ApiConfig = {
  name: 'custom-api',
  endpoint: 'https://api.example.com',
  apiKey: process.env.NEXT_PUBLIC_CUSTOM_API_KEY,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Dashboard Framework

New dashboards can be added by:

1. Creating a new page in `src/app/dashboard/[dashboard-name]/page.tsx`
2. Adding configuration to `DASHBOARD_CONFIGS` in `src/lib/config.ts`
3. Creating dashboard-specific components in `src/components/[dashboard-name]/`

Example dashboard configuration:

```typescript
{
  id: 'adoption',
  name: 'Adoption Metrics',
  description: 'Track user adoption and engagement',
  icon: 'TrendingUp',
  path: '/dashboard/adoption',
  apiConfigs: ['glean'],
}
```

## Sentiment Dashboard

The sentiment dashboard monitors user feedback by:

1. Querying Jira tickets with "GleanChat Bad Queries" and "GleanChat Good Queries" components
2. Extracting user emails and sentiment from ticket summaries
3. Visualizing trends over time with charts
4. Displaying detailed ticket information in a table

### Key Metrics

- **Total Feedback**: All thumbs up/down interactions
- **Positive Rate**: Percentage of thumbs up
- **Negative Rate**: Percentage of thumbs down
- **Trend Data**: Daily sentiment breakdown over the last 7 days

### Glean Search API Integration

The dashboard uses proper structured filters (per Glean recommendations) instead of text-based operators:

```typescript
{
  query: 'generalmotors',  // Free-text search
  pageSize: 100,
  requestOptions: {
    datasourcesFilter: ['jira'],  // Instead of app:jira
    facetFilters: [
      {
        fieldName: 'component',
        values: [
          {
            value: 'GleanChat Bad Queries',
            relationType: 'EQUALS'
          }
        ]
      }
    ]
  }
}
```

See [GLEAN_SEARCH_API.md](GLEAN_SEARCH_API.md) for detailed API usage documentation.

#### Pagination Support

The application uses cursor-based pagination to fetch all results:

- Automatically handles multiple pages of results
- Follows Glean's pagination logic: continues while `cursor` exists AND `hasMoreResults` is true/missing
- Shows page count and total results

#### Result Counting

The dashboard displays two counts to match the Glean UI:

1. **Cluster Heads**: Top-level results (what appears as rows in search)
2. **Total Issues**: Cluster heads + all "Similar results" backlinks (matches UI count)

This explains why the Glean UI might show "149+ Jira tickets" while the API returns 36 cluster heads - the UI includes all clustered/similar tickets.

## Adding New Dashboards

### Step 1: Create the Page

Create a new page at `src/app/dashboard/[name]/page.tsx`:

```typescript
'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MyDashboard() {
  return (
    <DashboardLayout>
      <h1>My New Dashboard</h1>
      {/* Dashboard content */}
    </DashboardLayout>
  );
}
```

### Step 2: Register the Dashboard

Add to `DASHBOARD_CONFIGS` in `src/lib/config.ts`:

```typescript
{
  id: 'my-dashboard',
  name: 'My Dashboard',
  description: 'Description of what this dashboard does',
  icon: 'BarChart',
  path: '/dashboard/my-dashboard',
  apiConfigs: ['glean'], // APIs this dashboard uses
}
```

### Step 3: Create Components

Add dashboard-specific components in `src/components/my-dashboard/`:

```typescript
// src/components/my-dashboard/MyComponent.tsx
export function MyComponent() {
  // Component implementation
}
```

### Step 4: Add to Home Page

Update `src/app/page.tsx` to include a card for your new dashboard.

## API Integration

### Glean Search API

The `GleanApi` class provides methods for searching and retrieving feedback:

```typescript
import { gleanApi } from '@/lib/glean-api';

// Search for content
const results = await gleanApi.search({
  query: 'app:jira component:"GleanChat Bad Queries"',
  datasources: ['jira'],
  maxResults: 100,
});

// Get feedback tickets
const tickets = await gleanApi.getThumbsDownTickets('customer-label', '30d');
```

### Adding New API Endpoints

1. Add configuration to `DEFAULT_API_CONFIGS` in `src/lib/config.ts`
2. Create a new API client class (similar to `GleanApi`)
3. Use `ApiManager` to make requests

```typescript
import { getApiManager } from '@/lib/api-manager';

const apiManager = getApiManager();
const response = await apiManager.makeRequest(
  'api-name',
  '/endpoint/path',
  { method: 'POST', body: JSON.stringify(data) }
);
```

## Styling

The application uses Tailwind CSS with a custom theme:

- **Primary Colors**: Blue tones for main actions
- **Success**: Green for positive sentiment
- **Warning**: Yellow for warnings
- **Danger**: Red for negative sentiment

Customize colors in `tailwind.config.ts`.

## Type Definitions

All types are defined in `src/types/index.ts`:

- `ApiConfig`: API endpoint configuration
- `DashboardConfig`: Dashboard metadata
- `FeedbackTicket`: User feedback ticket data
- `SentimentMetrics`: Aggregated sentiment statistics
- `GleanSearchParams`: Search query parameters
- `GleanSearchResult`: Search result data

## Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run type-check # Run TypeScript compiler check
```

### Best Practices

- Use TypeScript for all new code
- Follow the existing component structure
- Add types for all props and API responses
- Use the centralized API manager for all API calls
- Keep components small and focused
- Use Tailwind CSS utility classes for styling

## Deployment

### Vercel (Recommended)

This project is configured for seamless Vercel deployment:

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import: `https://github.com/chris-janning-glean/pilot-pulse`

2. **Configure Environment Variables**:
   In Vercel Project Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://scio-prod-be.glean.com
   NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=your_oauth_token_here
   ```

3. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically detect Next.js and configure build settings
   - Your app will be live at: `https://pilot-pulse.vercel.app`

4. **Custom Domain (Optional)**:
   - Go to Project Settings → Domains
   - Add your custom domain

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

Make sure to set the environment variables in your deployment platform.

## Troubleshooting

### API Connection Issues

If you see "API request failed" errors:

1. Verify your `.env.local` file has correct values
2. Check that your Glean API endpoint is accessible
3. Ensure your API key has the necessary permissions
4. Check browser console for detailed error messages

### No Data Showing

If dashboards show no data:

1. Verify Jira tickets exist with the correct components
2. Check that tickets have the expected labels
3. Ensure the date range includes recent tickets
4. Review the Glean Search query syntax

### Build Errors

If you encounter build errors:

1. Delete `node_modules` and `.next` directories
2. Run `npm install` again
3. Check that all dependencies are installed
4. Ensure Node.js version is 18 or higher

## Contributing

When adding new features:

1. Follow the existing code structure
2. Add TypeScript types for all new code
3. Update this README with any new functionality
4. Test thoroughly before committing

## License

This project is proprietary and confidential.

## Support

For questions or issues, contact the development team.

