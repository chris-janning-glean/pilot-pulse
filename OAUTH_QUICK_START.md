# Client API Token Quick Start

Get Pilot Command running with a Glean Client API Token in 3 minutes.

## Step 1: Get Your Client API Token

You need a **Client API Token** from your Glean instance:

1. Log into Glean as an admin
2. Go to **Admin Console** → **API** → **Client API Tokens**
3. Click **Create Token**
4. Select **Full Client API** or at minimum **Search** permissions
5. Copy the token (it will start with `GLEAN_AUTH_TOKEN_...`)

**Important**: This is a Client API token, NOT an OAuth token from your Identity Provider.

## Step 2: Configure Environment

Create `.env.local` file:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
# Using scio-prod instance
NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://scio-prod-be.glean.com

# Paste your OAuth token here
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Test the Connection

The dev server should already be running. Open:

**http://localhost:3000/dashboard/sentiment**

### What You Should See:

✅ **Success**: Dashboard loads with metrics and charts
- Overview cards showing feedback counts
- Trend chart with sentiment data
- Table of feedback tickets

❌ **Error**: "API request failed: 401"
- Check your OAuth token is correct
- Verify the token hasn't expired
- Ensure you copied the entire token

## Test with curl

Verify your token works directly:

```bash
curl -X POST "https://scio-prod-be.glean.com/rest/api/v1/search" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Glean-Auth-Type: OAUTH" \
  -H "Content-Type: application/json" \
  -d '{"query": "app:jira component:\"GleanChat Bad Queries\"", "pageSize": 10}'
```

## How Client API Tokens Work

### Request Format

Every API call uses these headers:

```javascript
{
  "Authorization": "Bearer GLEAN_AUTH_TOKEN_...",
  "Content-Type": "application/json"
}
```

**Note**: Do NOT include `X-Glean-Auth-Type: OAUTH` header. That's only for real OAuth tokens from your IdP, not Client API tokens.

### API Endpoint

All searches go to:
```
POST https://your-instance-be.glean.com/rest/api/v1/search
```

### Request Body

```json
{
  "query": "app:jira component:\"GleanChat Bad Queries\"",
  "pageSize": 10
}
```

## Example Queries

### All Thumbs Down
```json
{
  "query": "app:jira component:\"GleanChat Bad Queries\"",
  "pageSize": 100
}
```

### All Thumbs Up
```json
{
  "query": "app:jira component:\"GleanChat Good Queries\"",
  "pageSize": 100
}
```

### Filter by Customer (e.g., "tailoredbrands")
```json
{
  "query": "app:jira component:\"GleanChat Bad Queries\" \"tailoredbrands\"",
  "pageSize": 100
}
```

### Specific User Feedback
```json
{
  "query": "app:jira component:\"GleanChat Bad Queries\" user@example.com",
  "pageSize": 50
}
```

## Troubleshooting

### Token Not Working?

1. **Check the format**: Token should start with `eyJ`
2. **Verify endpoint**: Make sure the instance name is correct
3. **Test in browser**: Open DevTools → Network tab, look for `/rest/api/v1/search` requests
4. **Check expiration**: OAuth tokens expire - you may need a new one

### No Data Showing?

This is normal if:
- No feedback tickets exist yet in Jira
- Your query filters are too restrictive
- The customer label doesn't match

Try a broader query or check the browser console for the actual API response.

## Next Steps

1. ✅ Verify OAuth is working
2. 📊 View the Sentiment Dashboard
3. 🔍 Customize queries for your pilots
4. 📈 Add customer labels for filtering

See [OAUTH_SETUP.md](OAUTH_SETUP.md) for more details.

