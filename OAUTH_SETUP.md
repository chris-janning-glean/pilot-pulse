# OAuth Setup Guide for Pilot Command

This guide explains how to configure OAuth authentication for the Glean API.

## Quick Setup

### 1. Get Your OAuth Token

You'll need an OAuth access token from Glean. There are several ways to obtain this:

#### Option A: From Glean Admin Panel
1. Log into your Glean instance as an admin
2. Navigate to Admin Console → API Settings
3. Create or copy an OAuth token
4. Copy the token value

#### Option B: OAuth Flow (Production)
For a production setup, you would implement a full OAuth 2.0 flow:
1. Register your application with Glean
2. Implement the OAuth authorization flow
3. Exchange authorization code for access token
4. Store and refresh tokens as needed

**For this first version**, we're using a simpler approach with a pre-generated token.

### 2. Configure Environment Variables

Copy the example environment file:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your configuration:
```env
# Using scio-prod instance
NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://scio-prod-be.glean.com

# Add your OAuth access token
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Restart the Server

```bash
npm run dev
```

## API Configuration

The application is configured to use OAuth authentication:

```typescript
// src/lib/config.ts
{
  name: 'glean',
  endpoint: 'https://scio-prod-be.glean.com',
  authType: 'oauth',
  oauthToken: process.env.NEXT_PUBLIC_GLEAN_OAUTH_TOKEN,
}
```

## How It Works

### Request Headers

When making API calls, the application sends these headers:

```
Authorization: Bearer <OAUTH_ACCESS_TOKEN>
X-Glean-Auth-Type: OAUTH
Content-Type: application/json
```

### Example Request

```bash
curl -X POST "https://scio-prod-be.glean.com/rest/api/v1/search" \
  -H "Authorization: Bearer <OAUTH_ACCESS_TOKEN>" \
  -H "X-Glean-Auth-Type: OAUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "app:jira component:\"GleanChat Bad Queries\"",
    "pageSize": 10
  }'
```

### API Manager

The `ApiManager` class handles OAuth authentication automatically:

```typescript
// src/lib/api-manager.ts
if (config.authType === 'oauth' && config.oauthToken) {
  headers['Authorization'] = `Bearer ${config.oauthToken}`;
  headers['X-Glean-Auth-Type'] = 'OAUTH';
}
```

## Testing Your Setup

### 1. Test API Connection

Navigate to the Sentiment Dashboard at http://localhost:3000/dashboard/sentiment

If configured correctly, you should see:
- ✅ Dashboard loads without errors
- ✅ Metrics display (may show 0 if no data)
- ✅ No "API request failed" errors

### 2. Test with curl

Test your OAuth token directly:

```bash
curl -X POST "https://scio-prod-be.glean.com/rest/api/v1/search" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-Glean-Auth-Type: OAUTH" \
  -H "Content-Type: application/json" \
  -d '{"query": "app:jira component:\"GleanChat Bad Queries\"", "pageSize": 10}'
```

Expected response:
```json
{
  "results": [
    {
      "title": "...",
      "url": "...",
      ...
    }
  ]
}
```

### 3. Check Browser Console

Open browser DevTools (F12) and check the Console and Network tabs:
- **Console**: Should show no errors
- **Network**: Look for `/rest/api/v1/search` requests
  - Status should be 200
  - Response should contain results

## Troubleshooting

### "API request failed: 401 Unauthorized"

**Cause**: Invalid or expired OAuth token

**Solution**:
1. Verify your token is correct in `.env.local`
2. Check if the token has expired
3. Generate a new token from Glean admin panel
4. Restart the dev server after updating `.env.local`

### "API request failed: 403 Forbidden"

**Cause**: Token doesn't have required permissions

**Solution**:
1. Ensure your OAuth token has search permissions
2. Check that your user account has access to Jira data
3. Verify the token scope includes necessary API access

### "Module not found: Can't resolve '@/...'"

**Cause**: Server needs restart after environment changes

**Solution**:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### No Data Showing

**Cause**: Query returns no results

**Solution**:
1. Verify Jira tickets exist with "GleanChat Bad Queries" component
2. Try a broader query in the dashboard code
3. Check the browser Network tab for the actual API response

## Security Best Practices

### DO:
- ✅ Store tokens in `.env.local` (git-ignored)
- ✅ Use environment variables for sensitive data
- ✅ Keep tokens secure and private
- ✅ Rotate tokens periodically

### DON'T:
- ❌ Commit tokens to git
- ❌ Share tokens in Slack/email
- ❌ Use production tokens in development
- ❌ Hard-code tokens in source files

## Token Management

### Token Expiration

OAuth tokens typically expire after a period (e.g., 1 hour, 1 day, 30 days).

**For this version**: Manually refresh the token when it expires.

**For production**: Implement token refresh logic:
```typescript
async function refreshToken(refreshToken: string) {
  // Exchange refresh token for new access token
  const response = await fetch('https://your-instance-be.glean.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  return response.json();
}
```

### Multiple Environments

Use different tokens for different environments:

```env
# .env.local (development)
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=dev_token_here

# .env.production (production)
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=prod_token_here
```

## Advanced: Full OAuth Flow

For a production application, implement the full OAuth 2.0 flow:

### 1. Register OAuth Application

Contact Glean support to register your application and get:
- Client ID
- Client Secret
- Redirect URI

### 2. Authorization Flow

```typescript
// Redirect user to Glean for authorization
const authUrl = `https://your-instance.glean.com/oauth/authorize?` +
  `client_id=${clientId}&` +
  `redirect_uri=${redirectUri}&` +
  `response_type=code&` +
  `scope=search`;

window.location.href = authUrl;
```

### 3. Token Exchange

```typescript
// Exchange authorization code for tokens
const tokenResponse = await fetch('https://your-instance-be.glean.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  }),
});

const { access_token, refresh_token, expires_in } = await tokenResponse.json();
```

### 4. Token Storage

Store tokens securely:
- Access token: Session storage or encrypted cookie
- Refresh token: Secure HTTP-only cookie
- Expiration: Track and refresh before expiry

## Support

For issues with OAuth setup:
1. Check Glean API documentation
2. Contact Glean support for token issues
3. Review browser console for specific errors
4. Check the Network tab for API request details

## Next Steps

Once OAuth is working:
1. ✅ View the Sentiment Dashboard
2. ✅ Verify data is loading correctly
3. ✅ Test with different queries
4. ✅ Add customer labels for filtering
5. ✅ Monitor token expiration and refresh as needed

