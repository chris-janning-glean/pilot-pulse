# Token Troubleshooting Guide

Getting 401 errors? Here's how to fix your Glean Client API Token.

## ✅ Correct Token Setup

Your token should:
- Start with `GLEAN_AUTH_TOKEN_`
- Be a **Client API Token** from Glean Admin Console (not OAuth from IdP)
- Have **Search** permissions or **Full Client API** access
- Not be expired

## 🔍 Common Issues

### Issue 1: "Invalid Secret" or "Not allowed"

**Problem**: Your token is invalid, expired, or doesn't have permissions.

**Solution**:
1. Go to Glean Admin Console → API → Client API Tokens
2. Check if your token is still active
3. Verify it has **Search** permissions
4. If expired or missing permissions, create a new token
5. Copy the entire token including `GLEAN_AUTH_TOKEN_` prefix

### Issue 2: "401 Unauthorized"

**Problem**: Token format is wrong or using wrong headers.

**Solution**:
- ✅ DO include the `GLEAN_AUTH_TOKEN_` prefix
- ❌ DON'T remove the prefix
- ❌ DON'T use `X-Glean-Auth-Type: OAUTH` header (that's for real OAuth, not Client API tokens)

### Issue 3: Token Works in curl but not in the app

**Problem**: Environment variable not loaded.

**Solution**:
1. Ensure `.env.local` is in the project root (not in src/)
2. Restart the dev server: `npm run dev`
3. Check browser console for environment variable issues

## 📋 How to Create a Valid Token

### Step 1: Access Admin Console
1. Log into your Glean instance
2. Go to **Admin Console**
3. Navigate to **API** section
4. Click **Client API Tokens**

### Step 2: Create Token
1. Click **Create Token** or **New Token**
2. Give it a name (e.g., "Pilot Command Dashboard")
3. Select permissions:
   - **Full Client API** (recommended), OR
   - At minimum: **Search** permission

### Step 3: Copy Token
1. Copy the ENTIRE token including the prefix
2. It should look like: `GLEAN_AUTH_TOKEN_CiUAnMMa8aGn1wr/ZPQ5H...`
3. Store it securely

### Step 4: Add to .env.local
```env
NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://scio-prod-be.glean.com
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=GLEAN_AUTH_TOKEN_CiUAnMMa8aGn1wr/ZPQ5H...
```

**Note**: Despite the variable name `OAUTH_TOKEN`, this should be a Client API token.

## 🧪 Test Your Token

### Using curl:

```bash
curl -X POST "https://scio-prod-be.glean.com/rest/api/v1/search" \
  -H "Authorization: Bearer GLEAN_AUTH_TOKEN_YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"query": "app:jira", "pageSize": 5}'
```

**Expected**: HTTP 200 with search results
**If 401**: Token is invalid or expired - create a new one

### Check Token Format:

✅ **Correct**:
```
GLEAN_AUTH_TOKEN_CiUAnMMa8aGn1wr/ZPQ5HOvg48r6+phEQmlG8i7r3r5q...
```

❌ **Wrong** (missing prefix):
```
CiUAnMMa8aGn1wr/ZPQ5HOvg48r6+phEQmlG8i7r3r5q...
```

## 🔐 Token Types Explained

### Client API Token (What You Need)
- Created in Glean Admin Console
- Starts with `GLEAN_AUTH_TOKEN_`
- Used for server-to-server API calls
- Doesn't require `X-Glean-Auth-Type` header
- **This is what the app uses**

### OAuth Token (NOT for this app)
- From your Identity Provider (Okta, Azure AD, etc.)
- Part of OAuth 2.0 flow
- Requires `X-Glean-Auth-Type: OAUTH` header
- Different format (usually JWT)
- **Don't use this type**

## 📝 Checklist

Before asking for help, verify:

- [ ] Token starts with `GLEAN_AUTH_TOKEN_`
- [ ] Token is in `.env.local` file
- [ ] `.env.local` is in project root (not in src/)
- [ ] Variable name is `NEXT_PUBLIC_GLEAN_OAUTH_TOKEN`
- [ ] Dev server has been restarted
- [ ] Token works in curl test above
- [ ] Token has Search permissions in Admin Console
- [ ] Token is not expired

## 🆘 Still Not Working?

1. **Check Browser Console** (F12 → Console tab)
   - Look for error messages
   - Check if environment variables are loaded

2. **Check Network Tab** (F12 → Network tab)
   - Find the `/rest/api/v1/search` request
   - Check the Authorization header
   - View the response error

3. **Verify in Admin Console**
   - Go to API → Client API Tokens
   - Check token status
   - Check permissions
   - Check expiration date

4. **Create a Fresh Token**
   - Delete the old token
   - Create a new one with Full Client API access
   - Update `.env.local`
   - Restart dev server

## 💡 Pro Tips

- **Token Rotation**: Client API tokens can expire. Set a reminder to rotate them.
- **Development vs Production**: Use different tokens for dev and prod environments.
- **Permissions**: Start with Full Client API during development, narrow down later.
- **Security**: Never commit `.env.local` to git (it's in `.gitignore` by default).

## 📚 Additional Resources

- [Glean API Documentation](https://docs.glean.com)
- See `OAUTH_SETUP.md` for OAuth flow details (if needed later)
- Check browser console for detailed error messages from the app


