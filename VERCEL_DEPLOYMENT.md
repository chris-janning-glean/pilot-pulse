# Vercel Deployment Guide

This guide will help you deploy Pilot Pulse to Vercel in minutes.

## Prerequisites

- GitHub account (repository already set up at https://github.com/chris-janning-glean/pilot-pulse)
- Vercel account (sign up at https://vercel.com)
- Glean API credentials (OAuth token and endpoint)

## Quick Deployment Steps

### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste: `https://github.com/chris-janning-glean/pilot-pulse`
4. Click "Import"

### 2. Configure Project Settings

Vercel will auto-detect Next.js settings:
- **Framework Preset**: Next.js ✓
- **Build Command**: `npm run build` ✓
- **Output Directory**: `.next` ✓
- **Install Command**: `npm install` ✓

### 3. Add Environment Variables

Click "Environment Variables" and add:

```
NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://scio-prod-be.glean.com
NEXT_PUBLIC_GLEAN_OAUTH_TOKEN=your_oauth_token_here
```

**Important**: These must start with `NEXT_PUBLIC_` to be accessible in the browser.

### 4. Deploy

Click "Deploy" and wait ~2 minutes.

Your dashboard will be live at: `https://pilot-pulse-xxxxx.vercel.app`

## Post-Deployment

### Custom Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `pilot-pulse.yourdomain.com`)
3. Follow DNS configuration instructions

### Environment Updates

To update environment variables:
1. Go to Project Settings → Environment Variables
2. Edit or add variables
3. Redeploy from the Deployments tab

### Monitoring

- **Deployment logs**: Available in Vercel dashboard
- **Runtime logs**: Check Vercel Functions logs
- **Analytics**: Enable in Project Settings → Analytics

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "[Feature] Add new feature"
git push origin main
```

Vercel will:
- Detect the push
- Build automatically
- Deploy to production
- Provide a preview URL

## Troubleshooting

### Build Fails

- Check Vercel build logs for errors
- Verify all dependencies are in `package.json`
- Ensure environment variables are set

### API Errors in Production

- Verify environment variables are set correctly
- Check that OAuth token hasn't expired
- Ensure Glean API endpoint is accessible from Vercel's infrastructure

### Slow Load Times

- Enable Vercel Analytics to identify bottlenecks
- Consider implementing incremental static regeneration (ISR)
- Use Vercel Edge Functions for faster API responses

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- GitHub Issues: https://github.com/chris-janning-glean/pilot-pulse/issues

## Project Links

- **GitHub**: https://github.com/chris-janning-glean/pilot-pulse
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Production URL**: Will be provided after first deployment

