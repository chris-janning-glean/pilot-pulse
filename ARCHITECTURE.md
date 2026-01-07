# Pilot Command Architecture

This document describes the technical architecture and design decisions for Pilot Command.

## Overview

Pilot Command is a Next.js application that provides dashboards for monitoring Glean pilot health. It's designed to be modular and extensible, allowing new dashboards to be added with minimal effort.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Core Principles

### 1. Modularity

Each dashboard is self-contained with its own:
- Page component
- Dashboard-specific components
- Data fetching logic
- Configuration

This allows dashboards to be developed, tested, and deployed independently.

### 2. Type Safety

Full TypeScript coverage ensures:
- Compile-time error detection
- Better IDE support
- Self-documenting code
- Safer refactoring

### 3. Centralized Configuration

All API endpoints and dashboard metadata are configured in one place (`src/lib/config.ts`), making it easy to:
- Add new APIs
- Update endpoints
- Register new dashboards
- Manage API keys

### 4. Reusable Components

UI components are built to be generic and reusable across all dashboards:
- Card layouts
- Badges and buttons
- Statistics displays
- Charts and visualizations

## Architecture Layers

### 1. Presentation Layer (`src/app/` and `src/components/`)

**Responsibilities:**
- Rendering UI
- User interactions
- Client-side state management
- Data visualization

**Key Components:**
- `DashboardLayout`: Consistent layout wrapper
- `Header`: Navigation and branding
- Dashboard-specific components (e.g., `SentimentOverview`)
- Reusable UI components (e.g., `Card`, `Badge`)

### 2. Business Logic Layer (`src/lib/`)

**Responsibilities:**
- API communication
- Data transformation
- Business rules
- Utility functions

**Key Modules:**
- `api-manager.ts`: Generic API request handler
- `glean-api.ts`: Glean-specific API client
- `config.ts`: Configuration management
- `utils.ts`: Helper functions

### 3. Type Layer (`src/types/`)

**Responsibilities:**
- Type definitions
- Interface contracts
- Data models

**Key Types:**
- `ApiConfig`: API endpoint configuration
- `DashboardConfig`: Dashboard metadata
- `FeedbackTicket`: Domain models
- `SentimentMetrics`: Aggregated data

## API Management

### ApiManager Class

The `ApiManager` is a singleton that manages all API configurations and requests:

```typescript
class ApiManager {
  private configs: Map<string, ApiConfig>;
  
  addConfig(config: ApiConfig): void
  getConfig(name: string): ApiConfig | undefined
  makeRequest<T>(configName: string, path: string, options?: RequestInit): Promise<T>
}
```

**Benefits:**
- Single source of truth for API configs
- Consistent error handling
- Easy to mock for testing
- Supports multiple APIs

### GleanApi Client

Specialized client for Glean Search API:

```typescript
class GleanApi {
  search(params: GleanSearchParams): Promise<GleanSearchResult[]>
  getFeedbackTickets(customerLabel?: string, duration?: string): Promise<FeedbackTicket[]>
  getThumbsDownTickets(customerLabel?: string, duration?: string): Promise<FeedbackTicket[]>
  getThumbsUpTickets(customerLabel?: string, duration?: string): Promise<FeedbackTicket[]>
  getUserFeedback(userEmail: string): Promise<FeedbackTicket[]>
}
```

**Design Decisions:**
- Uses `ApiManager` for all requests
- Transforms raw API responses into typed domain models
- Provides high-level methods for common queries
- Encapsulates Glean-specific query syntax

## Data Flow

### Sentiment Dashboard Example

```
User loads /dashboard/sentiment
    ↓
SentimentDashboard component mounts
    ↓
Initialize ApiManager with configs
    ↓
Fetch data via GleanApi
    ↓
Transform API responses to domain models
    ↓
Calculate metrics (rates, trends)
    ↓
Render components with data
    ↓
User interacts (refresh, filter)
    ↓
Re-fetch and update
```

## Component Hierarchy

```
App (layout.tsx)
└── DashboardLayout
    ├── Header
    │   └── Navigation
    └── Main Content
        └── Dashboard Page
            ├── Overview Cards
            ├── Charts
            └── Data Tables
```

## State Management

### Client-Side State

Currently using React's built-in state management:
- `useState` for component state
- `useEffect` for data fetching
- Props for data passing

**Future Considerations:**
- If state becomes complex, consider React Context
- For global state, consider Zustand or Redux
- For server state, consider React Query

### Server-Side State

Next.js App Router provides:
- Server Components for initial data
- Client Components for interactivity
- API Routes for backend logic (if needed)

## Styling Strategy

### Tailwind CSS

Using utility-first approach with:
- Custom theme in `tailwind.config.ts`
- Consistent color palette
- Responsive breakpoints
- Dark mode support (future)

### Component Styling

```typescript
// Use cn() utility for conditional classes
<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className // Allow override
)}>
```

## Error Handling

### API Errors

```typescript
try {
  const data = await gleanApi.search(params);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error');
  console.error('API error:', err);
}
```

### UI Error States

- Loading states with spinners
- Error messages with retry buttons
- Empty states with helpful messages
- Fallback UI for missing data

## Performance Considerations

### Current Optimizations

- Server-side rendering where possible
- Code splitting via Next.js
- Optimized images (when added)
- Minimal re-renders

### Future Optimizations

- Data caching with React Query
- Virtualized lists for large datasets
- Debounced search inputs
- Progressive loading

## Security

### API Keys

- Stored in environment variables
- Never committed to git
- Prefixed with `NEXT_PUBLIC_` for client-side access
- Server-side keys use different prefix (future)

### Data Access

- API requests include authentication headers
- Respect Glean's permission model
- No sensitive data in URLs
- HTTPS only in production

## Testing Strategy

### Unit Tests (Future)

- Test utility functions
- Test data transformations
- Test business logic

### Integration Tests (Future)

- Test API clients with mocked responses
- Test component interactions
- Test data flow

### E2E Tests (Future)

- Test critical user flows
- Test dashboard functionality
- Test error scenarios

## Deployment

### Build Process

```bash
npm run build
```

Produces:
- Optimized JavaScript bundles
- Static HTML pages
- Server-side code
- Public assets

### Environment Variables

Required for production:
- `NEXT_PUBLIC_GLEAN_API_ENDPOINT`
- `NEXT_PUBLIC_GLEAN_API_KEY`

### Hosting

Recommended platforms:
- **Vercel**: Best Next.js support
- **Netlify**: Good alternative
- **AWS**: For enterprise needs

## Extensibility

### Adding New Dashboards

1. Create page: `src/app/dashboard/[name]/page.tsx`
2. Add config: `src/lib/config.ts`
3. Create components: `src/components/[name]/`
4. Update home page: `src/app/page.tsx`

### Adding New APIs

1. Add config: `src/lib/config.ts`
2. Create client: `src/lib/[api-name]-api.ts`
3. Add types: `src/types/index.ts`
4. Use in dashboards

### Adding New Features

1. Define types in `src/types/`
2. Implement logic in `src/lib/`
3. Create UI in `src/components/`
4. Integrate in pages

## Design Patterns

### Singleton Pattern

Used for `ApiManager` to ensure single instance:

```typescript
let apiManagerInstance: ApiManager | null = null;

export function getApiManager(): ApiManager {
  if (!apiManagerInstance) {
    apiManagerInstance = new ApiManager();
  }
  return apiManagerInstance;
}
```

### Factory Pattern

Used for creating API clients:

```typescript
export function createApiClient(config: ApiConfig) {
  return new ApiClient(config);
}
```

### Composition Pattern

UI components are composed from smaller pieces:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Future Enhancements

### Planned Features

1. **Real-time Updates**: WebSocket support for live data
2. **Advanced Filtering**: Filter dashboards by date, user, etc.
3. **Export Functionality**: Download data as CSV/PDF
4. **User Preferences**: Save dashboard configurations
5. **Notifications**: Alert on critical metrics
6. **Mobile App**: React Native version

### Technical Improvements

1. **Caching**: Implement React Query for data caching
2. **Testing**: Add comprehensive test suite
3. **Monitoring**: Add error tracking (Sentry)
4. **Analytics**: Track dashboard usage
5. **Documentation**: Generate API docs from types
6. **CI/CD**: Automated testing and deployment

## Maintenance

### Code Organization

- Keep files small and focused
- Use meaningful names
- Add comments for complex logic
- Update types when APIs change

### Dependencies

- Regular updates via `npm update`
- Security audits via `npm audit`
- Lock file committed to git
- Document breaking changes

### Documentation

- Update README for user-facing changes
- Update ARCHITECTURE for technical changes
- Add inline comments for complex code
- Keep examples up to date

## Conclusion

Pilot Command is designed to be:
- **Modular**: Easy to add new dashboards
- **Type-safe**: Catch errors at compile time
- **Maintainable**: Clear structure and patterns
- **Extensible**: Support for multiple APIs
- **User-friendly**: Clean, responsive UI

The architecture supports the current sentiment dashboard while providing a solid foundation for future enhancements.

