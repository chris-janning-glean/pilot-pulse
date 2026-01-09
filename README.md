# Glean Pilot Pulse

Real-time dashboard for monitoring Glean pilot health and user sentiment. Built with Next.js 14, React, and inline styles.

## Features

- **User Sentiment Tracking**: Monitor thumbs up/down feedback from pilot users
- **Dual Agent Analysis**: Separate AI analysis for positive and negative feedback
- **Tag Clouds**: Visual frequency-based phrase clouds showing common themes
- **Real-time Filtering**: Filter by customer and time range (1d, 7d, 14d, 30d)
- **Feedback Table**: Detailed view of all feedback tickets with issue types and comments
- **Trend Visualization**: Bar charts showing sentiment over time
- **Issue Distribution**: Pie chart showing breakdown by issue category
- **Vercel Analytics**: Built-in usage tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Inline React styles (no CSS framework)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics
- **API**: Glean REST API (Search + Agents)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Glean API access (OAuth token)
- Glean Agent IDs (for feedback analysis)

### Installation

1. Clone and install:
```bash
git clone <repo-url>
cd pilot-command
npm install
```

2. Configure environment variables in `.env.local`:
```env
# Glean API Configuration
NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://your-instance-be.glean.com
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=your_oauth_access_token

# Agent IDs for feedback analysis
NEXT_PUBLIC_NEGATIVE_AGENT_ID=your_negative_agent_id
NEXT_PUBLIC_POSITIVE_AGENT_ID=your_positive_agent_id
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:3000/sentiment?customer=whirlpool

### Configuration

#### Customers

Available customers are configured in the sentiment dashboard. To add a new customer, update the validation message in:
- `src/app/sentiment/page.tsx`

Current customers: `whirlpool`, `generalmotors`, `tailoredbrands`, `insurity`

#### Agent IDs

The dashboard uses two separate Glean agents:
- **Negative Agent**: Analyzes negative/critical feedback
- **Positive Agent**: Analyzes positive feedback

Both agents receive:
- `Customer`: Customer identifier (e.g., "whirlpool")
- `Timeframe`: Date range ("past_day", "past_week", "past_2_weeks", "past_month")

## Project Structure

```
pilot-command/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   └── glean/          # Glean API proxies
│   │   │       ├── agent/      # Agent API proxy
│   │   │       └── search/     # Search API proxy
│   │   ├── sentiment/          # Main dashboard page
│   │   ├── settings/           # Settings page
│   │   ├── layout.tsx          # Root layout with header/footer
│   │   ├── page.tsx            # Root redirect
│   │   └── globals.css         # Global styles
│   ├── components/             # Reusable components
│   │   ├── layout/             # Layout components
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   └── ui/                 # UI components
│   │       └── Card.tsx
│   ├── lib/                    # Business logic & utilities
│   │   ├── api-manager.ts      # API configuration manager
│   │   ├── glean-api.ts        # Glean API client
│   │   ├── config.ts           # Dashboard configs
│   │   ├── commonStyles.ts     # Shared button styles
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript type definitions
│       └── index.ts
├── public/                     # Static assets
│   └── logos/
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Usage

### URL Structure

```
/sentiment?customer={customer}&timeRange={days}
```

**Parameters:**
- `customer` (required): `whirlpool`, `generalmotors`, `tailoredbrands`, or `insurity`
- `timeRange` (optional): Defaults to 7 days, changed via UI buttons

**Examples:**
- `/sentiment?customer=whirlpool`
- `/sentiment?customer=generalmotors`

### Agent Response Format

Agents return JSON with two sections:

```json
{
  "sections": [
    {"type": "heading", "text": "Summary", "style": "h1"},
    {"type": "paragraph", "text": "Analysis content..."}
  ],
  "tag_cloud": [
    {"phrase": "wrong answer", "frequency": 8, "example": "User said..."}
  ]
}
```

**Sections**: Rendered as formatted text with heading hierarchy
**Tag Cloud**: Visual word cloud with frequency-based sizing

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## Deployment

Deploys automatically to Vercel when pushing to `main` branch.

**Live URL**: https://pilot-pulse-chi.vercel.app (or your custom domain)

## Environment Variables for Production

Set these in your Vercel project settings or `.env.local`:

- `NEXT_PUBLIC_GLEAN_API_ENDPOINT`
- `NEXT_PUBLIC_GLEAN_OAUTH_TOKEN`
- `NEXT_PUBLIC_NEGATIVE_AGENT_ID`
- `NEXT_PUBLIC_POSITIVE_AGENT_ID`

## Architecture Notes

- **All-in-one page**: Main dashboard (`sentiment/page.tsx`) contains all logic inline
- **No CSS framework**: Uses inline React styles for simplicity
- **Client-side state**: React useState for all dashboard state
- **API Routes**: Next.js API routes proxy Glean API calls
- **Type-safe**: Full TypeScript coverage

## License

Built for monitoring Glean pilot health.
© 2026 Pilot Command
