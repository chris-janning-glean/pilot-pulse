# Pilot Command - Project Summary

## Overview

**Pilot Command** is a TypeScript dashboard application built to monitor the health of Glean pilots by tracking user sentiment through thumbs up/down feedback. The application is designed with a flexible, modular architecture that makes it easy to add new dashboards and integrate with multiple APIs.

## What's Been Built

### 1. Core Infrastructure ✅

- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for styling with custom theme
- **Modular architecture** supporting multiple dashboards
- **Centralized API management** for easy integration

### 2. Sentiment Dashboard ✅

The first dashboard monitors user sentiment by:
- Querying Jira tickets with "GleanChat Bad Queries" and "GleanChat Good Queries" components
- Extracting user feedback from ticket summaries
- Calculating sentiment metrics (positive/negative/neutral rates)
- Visualizing trends over time with interactive charts
- Displaying detailed ticket information in a searchable table

**Key Features:**
- Real-time sentiment overview cards
- 7-day trend chart with positive/negative/neutral lines
- Comprehensive feedback table with ticket links
- Refresh functionality to update data
- Error handling with retry capability

### 3. API Integration Layer ✅

**ApiManager Class:**
- Singleton pattern for centralized API configuration
- Support for multiple API endpoints
- Automatic authentication header injection
- Type-safe request/response handling

**GleanApi Client:**
- Specialized client for Glean Search API
- Methods for fetching feedback tickets
- Query building for thumbs up/down tickets
- User-specific feedback queries
- Data transformation to domain models

### 4. Reusable UI Components ✅

Built a comprehensive component library:
- **Card**: Flexible container with header/content/footer
- **Badge**: Status indicators with color variants
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Stat**: Metric display with optional trends
- **Header**: Navigation and branding
- **DashboardLayout**: Consistent page wrapper

### 5. Type System ✅

Full TypeScript coverage with types for:
- API configurations and responses
- Dashboard metadata
- Feedback tickets and sentiment metrics
- Search parameters and results
- UI component props

### 6. Documentation ✅

Comprehensive documentation including:
- **README.md**: Full user guide with examples
- **ARCHITECTURE.md**: Technical design decisions
- **QUICKSTART.md**: 5-minute setup guide
- **PROJECT_SUMMARY.md**: This file

## Project Structure

```
pilot-command/
├── src/
│   ├── app/                          # Next.js pages
│   │   ├── dashboard/sentiment/      # Sentiment dashboard
│   │   ├── settings/                 # Configuration page
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/
│   │   ├── layout/                   # Layout components
│   │   ├── sentiment/                # Sentiment dashboard components
│   │   └── ui/                       # Reusable UI components
│   ├── lib/
│   │   ├── api-manager.ts            # API configuration manager
│   │   ├── glean-api.ts              # Glean API client
│   │   ├── config.ts                 # App configuration
│   │   └── utils.ts                  # Utility functions
│   └── types/
│       └── index.ts                  # TypeScript types
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.js                    # Next.js config
├── env.example                       # Environment template
├── README.md                         # User documentation
├── ARCHITECTURE.md                   # Technical documentation
├── QUICKSTART.md                     # Quick setup guide
└── PROJECT_SUMMARY.md                # This file
```

## Key Design Decisions

### 1. Modular Dashboard Framework

Each dashboard is self-contained with:
- Its own page component
- Dashboard-specific components
- Independent data fetching
- Configuration entry

**Benefits:**
- Easy to add new dashboards
- Independent development and testing
- Clear separation of concerns
- Minimal coupling between dashboards

### 2. Centralized API Management

The `ApiManager` singleton provides:
- Single source of truth for API configs
- Consistent authentication handling
- Easy mocking for tests
- Support for multiple APIs

**Benefits:**
- Easy to add new APIs
- Consistent error handling
- Type-safe requests
- Simplified testing

### 3. Type-First Development

Full TypeScript coverage ensures:
- Compile-time error detection
- Better IDE support
- Self-documenting code
- Safer refactoring

**Benefits:**
- Fewer runtime errors
- Better developer experience
- Easier maintenance
- Clear contracts

### 4. Component Composition

UI components are built to be:
- Small and focused
- Reusable across dashboards
- Composable into larger structures
- Styled with Tailwind CSS

**Benefits:**
- Consistent UI
- Faster development
- Easier testing
- Better maintainability

## How to Add New Dashboards

### Step 1: Create the Page

```typescript
// src/app/dashboard/[name]/page.tsx
'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MyDashboard() {
  return (
    <DashboardLayout>
      <h1>My Dashboard</h1>
      {/* Your dashboard content */}
    </DashboardLayout>
  );
}
```

### Step 2: Register the Dashboard

```typescript
// src/lib/config.ts
export const DASHBOARD_CONFIGS: DashboardConfig[] = [
  // ... existing dashboards
  {
    id: 'my-dashboard',
    name: 'My Dashboard',
    description: 'What this dashboard does',
    icon: 'BarChart',
    path: '/dashboard/my-dashboard',
    apiConfigs: ['glean'], // APIs used
  },
];
```

### Step 3: Create Components

```typescript
// src/components/my-dashboard/MyComponent.tsx
export function MyComponent() {
  // Component implementation
}
```

### Step 4: Update Home Page

Add a card for your dashboard in `src/app/page.tsx`.

## How to Add New APIs

### Step 1: Add Configuration

```typescript
// src/lib/config.ts
export const DEFAULT_API_CONFIGS: ApiConfig[] = [
  // ... existing configs
  {
    name: 'my-api',
    endpoint: process.env.NEXT_PUBLIC_MY_API_ENDPOINT || '',
    apiKey: process.env.NEXT_PUBLIC_MY_API_KEY,
    headers: {
      'Content-Type': 'application/json',
    },
  },
];
```

### Step 2: Create API Client

```typescript
// src/lib/my-api.ts
import { getApiManager } from './api-manager';

export class MyApi {
  async getData() {
    const apiManager = getApiManager();
    return apiManager.makeRequest('my-api', '/endpoint');
  }
}

export const myApi = new MyApi();
```

### Step 3: Add Types

```typescript
// src/types/index.ts
export interface MyApiResponse {
  // Response structure
}
```

### Step 4: Use in Dashboard

```typescript
import { myApi } from '@/lib/my-api';

const data = await myApi.getData();
```

## Glean Search Integration

The sentiment dashboard uses Glean Search API to find feedback tickets:

### Query Examples

```typescript
// Thumbs down tickets (last 30 days)
app:jira component:"GleanChat Bad Queries" created:30d

// Thumbs up tickets (last 30 days)
app:jira component:"GleanChat Good Queries" created:30d

// Customer-specific feedback
app:jira component:"GleanChat Bad Queries" labels:customer-label created:30d

// User-specific feedback
app:jira component:"GleanChat Bad Queries" user@example.com
```

### Data Extraction

The system extracts:
- **User Email**: From ticket summary
- **Sentiment**: From component name and content
- **Category**: From ticket description
- **Ticket Key**: From URL
- **Timestamps**: Created and updated dates

## Styling System

### Tailwind Theme

Custom colors for different states:
- **Primary**: Blue tones for main actions
- **Success**: Green for positive sentiment (thumbs up)
- **Warning**: Yellow for warnings
- **Danger**: Red for negative sentiment (thumbs down)
- **Secondary**: Gray for neutral states

### Responsive Design

All components are responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Future Enhancements

### Planned Dashboards

1. **Adoption Metrics**
   - User sign-ups over time
   - Feature usage statistics
   - Active user trends

2. **User Activity**
   - Query patterns
   - Search vs. chat usage
   - Peak usage times

3. **Content Health**
   - Document coverage
   - Indexing status
   - Data source health

### Planned Features

1. **Real-time Updates**: WebSocket for live data
2. **Advanced Filtering**: Date ranges, user filters
3. **Export**: CSV/PDF downloads
4. **Notifications**: Alerts for critical metrics
5. **User Preferences**: Save dashboard configs
6. **Mobile App**: React Native version

### Technical Improvements

1. **Caching**: React Query for data caching
2. **Testing**: Comprehensive test suite
3. **Monitoring**: Error tracking (Sentry)
4. **Analytics**: Usage tracking
5. **CI/CD**: Automated deployment

## Getting Started

### Quick Setup (5 minutes)

1. Install dependencies: `npm install`
2. Copy env file: `cp env.example .env.local`
3. Add your Glean credentials to `.env.local`
4. Start dev server: `npm run dev`
5. Open http://localhost:3000

See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Test locally
4. Run type check: `npm run type-check`
5. Run linter: `npm run lint`
6. Commit and push
7. Create pull request

## Dependencies

### Core

- **next**: React framework with SSR
- **react**: UI library
- **typescript**: Type safety

### UI

- **tailwindcss**: Utility-first CSS
- **lucide-react**: Icon library
- **recharts**: Chart library

### Utilities

- **date-fns**: Date manipulation
- **clsx**: Conditional classes
- **tailwind-merge**: Class merging

## Configuration

### Environment Variables

Required:
- `NEXT_PUBLIC_GLEAN_API_ENDPOINT`: Your Glean instance URL
- `NEXT_PUBLIC_GLEAN_API_KEY`: Your API key

Optional:
- Add more as needed for additional APIs

### Dashboard Configuration

Edit `src/lib/config.ts` to:
- Add new API endpoints
- Register new dashboards
- Update API keys (use env vars)

## Deployment

### Recommended: Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Alternative Platforms

- Netlify
- AWS Amplify
- Railway
- Render

All support Next.js out of the box.

## Support

### Documentation

- **README.md**: User guide and API reference
- **ARCHITECTURE.md**: Technical design details
- **QUICKSTART.md**: Fast setup instructions

### Troubleshooting

Common issues and solutions are documented in README.md.

### Contact

For questions or issues, contact the development team.

## Summary

Pilot Command provides a solid foundation for monitoring Glean pilot health through:

✅ **Modular Architecture**: Easy to extend with new dashboards
✅ **Type Safety**: Full TypeScript coverage
✅ **API Flexibility**: Support for multiple APIs
✅ **Modern UI**: Clean, responsive design
✅ **Comprehensive Docs**: Complete documentation

The sentiment dashboard is fully functional and ready to use. The framework is designed to make adding new dashboards straightforward, following the same patterns and conventions.

**Next Steps:**
1. Configure your Glean API credentials
2. Run the application and explore the sentiment dashboard
3. Add new dashboards as needed
4. Customize to fit your specific requirements

Happy monitoring! 🚀

