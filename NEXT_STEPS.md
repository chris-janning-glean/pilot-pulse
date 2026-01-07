# Next Steps for Pilot Command

## Immediate Setup (Do This First!)

### 1. Install Dependencies

```bash
cd /Users/janning/workspace/pilot-command
npm install
```

This will install all required packages including Next.js, React, Tailwind CSS, and more.

### 2. Configure Environment

```bash
cp env.example .env.local
```

Then edit `.env.local` and add your Glean credentials:

```env
NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://scio-prod-be.glean.com
NEXT_PUBLIC_GLEAN_API_KEY=your_api_key_here
```

**Important**: Replace `your_api_key_here` with your actual Glean API key.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Verify Everything Works

### Test the Sentiment Dashboard

1. Navigate to the Sentiment Dashboard from the home page
2. You should see:
   - Overview cards with feedback metrics
   - A trend chart showing sentiment over time
   - A table of feedback tickets

### Expected Behavior

If configured correctly:
- ✅ Dashboard loads without errors
- ✅ Metrics show real data from your Glean instance
- ✅ Chart displays sentiment trends
- ✅ Table shows feedback tickets with links to Jira

### Troubleshooting

**If you see "API request failed":**
- Check your `.env.local` file
- Verify the Glean endpoint is correct
- Ensure your API key has proper permissions

**If no data shows:**
- Confirm you have Jira tickets with "GleanChat Bad Queries" or "GleanChat Good Queries" components
- Check the date range (default is last 30 days)
- Try the refresh button

## Customization Options

### 1. Filter by Customer

To show feedback for a specific pilot customer, edit `src/app/dashboard/sentiment/page.tsx`:

```typescript
// Line ~40, change:
const [thumbsDownTickets, thumbsUpTickets] = await Promise.all([
  gleanApi.getThumbsDownTickets(undefined, '30d'),  // Change undefined to 'customer-label'
  gleanApi.getThumbsUpTickets(undefined, '30d'),    // Change undefined to 'customer-label'
]);

// To:
const [thumbsDownTickets, thumbsUpTickets] = await Promise.all([
  gleanApi.getThumbsDownTickets('tailoredbrands', '30d'),
  gleanApi.getThumbsUpTickets('tailoredbrands', '30d'),
]);
```

### 2. Change Date Range

Modify the duration parameter:
- `'7d'` - Last 7 days
- `'30d'` - Last 30 days (default)
- `'90d'` - Last 90 days

### 3. Customize Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
colors: {
  primary: {
    // Change these values
    500: '#0ea5e9',  // Main primary color
    600: '#0284c7',  // Hover state
  },
}
```

## Adding Your First Dashboard

Let's add an "Adoption Metrics" dashboard as an example.

### Step 1: Create the Page

Create `src/app/dashboard/adoption/page.tsx`:

```typescript
'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AdoptionDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Adoption Metrics</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Sign-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

### Step 2: Register the Dashboard

Edit `src/lib/config.ts` and add to `DASHBOARD_CONFIGS`:

```typescript
{
  id: 'adoption',
  name: 'Adoption Metrics',
  description: 'Track user adoption and engagement',
  icon: 'TrendingUp',
  path: '/dashboard/adoption',
  apiConfigs: ['glean'],
},
```

### Step 3: Update Home Page

Edit `src/app/page.tsx` and change the "Adoption Metrics" card from disabled to active:

```typescript
// Find this card and update:
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <TrendingUp className="h-8 w-8 text-primary-600" /> {/* Remove text-gray-400 */}
    </div>
    <CardTitle className="mt-4">Adoption Metrics</CardTitle>
    <CardDescription>
      Monitor user adoption and engagement trends
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Link href="/dashboard/adoption">
      <Button variant="outline" className="w-full">
        View Dashboard
      </Button>
    </Link>
  </CardContent>
</Card>
```

### Step 4: Test It

Navigate to [http://localhost:3000/dashboard/adoption](http://localhost:3000/dashboard/adoption)

## Recommended Enhancements

### 1. Add User Filtering

Allow filtering the sentiment dashboard by user email:

```typescript
// Add to src/app/dashboard/sentiment/page.tsx
const [userFilter, setUserFilter] = useState('');

// Add input field:
<input
  type="text"
  placeholder="Filter by user email..."
  value={userFilter}
  onChange={(e) => setUserFilter(e.target.value)}
  className="border rounded px-3 py-2"
/>

// Filter tickets:
const filteredTickets = tickets.filter(t => 
  !userFilter || t.userEmail.includes(userFilter)
);
```

### 2. Add Date Range Picker

Install a date picker library:

```bash
npm install react-datepicker
npm install --save-dev @types/react-datepicker
```

Then add date range selection to the dashboard.

### 3. Add Export Functionality

Add a button to export data as CSV:

```typescript
const exportToCSV = () => {
  const csv = tickets.map(t => 
    `${t.ticketKey},${t.userEmail},${t.sentiment},${t.created}`
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sentiment-data.csv';
  a.click();
};
```

### 4. Add Real-time Updates

Use polling to refresh data automatically:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    loadData();
  }, 60000); // Refresh every minute
  
  return () => clearInterval(interval);
}, []);
```

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_GLEAN_API_ENDPOINT`
   - `NEXT_PUBLIC_GLEAN_API_KEY`
6. Click "Deploy"

Your app will be live at `https://your-app.vercel.app`

### Deploy to Other Platforms

The app works on any platform that supports Next.js:
- **Netlify**: Similar to Vercel
- **AWS Amplify**: Good for AWS users
- **Railway**: Simple deployment
- **Render**: Easy setup

## Learning Resources

### Understanding the Codebase

1. **Start with**: `src/app/page.tsx` - The home page
2. **Then read**: `src/app/dashboard/sentiment/page.tsx` - Main dashboard
3. **Explore**: `src/lib/glean-api.ts` - API integration
4. **Review**: `src/components/` - UI components

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### TypeScript Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)

## Getting Help

### Documentation

- **README.md**: Complete user guide
- **ARCHITECTURE.md**: Technical details
- **QUICKSTART.md**: Fast setup
- **PROJECT_SUMMARY.md**: Overview

### Common Issues

See the "Troubleshooting" section in README.md for solutions to common problems.

### Support

Contact the development team for assistance.

## What's Next?

Now that you have Pilot Command set up, you can:

1. ✅ Monitor user sentiment in real-time
2. ✅ Track feedback trends over time
3. ✅ Identify problematic areas quickly
4. ✅ Build custom dashboards for your needs

**Happy monitoring!** 🚀

