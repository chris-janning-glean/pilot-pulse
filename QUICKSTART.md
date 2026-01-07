# Quick Start Guide

Get Pilot Command up and running in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Glean API credentials

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env.local
   ```

3. **Edit `.env.local`** with your Glean credentials:
   ```env
   NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://your-instance-be.glean.com
   NEXT_PUBLIC_GLEAN_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

### View the Sentiment Dashboard

1. Click "View Dashboard" on the User Sentiment card
2. The dashboard will load feedback tickets from your Glean instance
3. Explore the metrics, charts, and ticket table

### Understanding the Data

The sentiment dashboard shows:
- **Total Feedback**: All thumbs up/down from users
- **Positive Rate**: Percentage of positive feedback
- **Negative Rate**: Percentage of negative feedback
- **Trend Chart**: Daily sentiment over the last 7 days
- **Feedback Table**: Detailed ticket information

### Customizing the Query

To filter by customer label, modify `src/app/dashboard/sentiment/page.tsx`:

```typescript
// Change this line:
const thumbsDownTickets = await gleanApi.getThumbsDownTickets(undefined, '30d');

// To this:
const thumbsDownTickets = await gleanApi.getThumbsDownTickets('your-customer-label', '30d');
```

## Common Issues

### "API request failed"

**Solution**: Check your `.env.local` file has the correct endpoint and API key.

### No data showing

**Solution**: Ensure you have Jira tickets with the "GleanChat Bad Queries" or "GleanChat Good Queries" component.

### Port 3000 already in use

**Solution**: Kill the process using port 3000 or change the port:
```bash
npm run dev -- -p 3001
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase
- Customize the dashboard to fit your needs
- Add new dashboards following the patterns

## Need Help?

- Check the README for troubleshooting
- Review the code comments
- Contact the development team

