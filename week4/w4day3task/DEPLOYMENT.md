# Deployment Guide

## Environment Variables

### Current Environment Variables
Your project uses **1 public environment variable**:

```
NEXT_PUBLIC_API_URL
```

**Location**: `app/actions/gameActions.ts`  
**Purpose**: API endpoint URL for fetching game data  
**Default**: `http://localhost:3000` (if not set)  
**Type**: Public (accessible in browser)

---

## Local Development

### Setup
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update values if needed:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

---

## Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Setup environment config"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Set Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add variable:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://your-api-domain.com
     ```
   - Select environments: Production, Preview, Development
   - Click "Save"

4. **Deploy**
   - Vercel automatically deploys on push to main branch
   - Or manually trigger: Click "Deploy"

### Option 2: Netlify

1. **Connect repository**
   - Go to [netlify.com](https://netlify.com)
   - Click "Import an existing project"
   - Select your GitHub repo

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Set Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add variable:
     ```
     Key: NEXT_PUBLIC_API_URL
     Value: https://your-api-domain.com
     ```

4. **Deploy**
   - Netlify automatically builds and deploys

### Option 3: Docker / Self-hosted

1. **Create Dockerfile** (if deploying to own server)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 3000
   ENV NEXT_PUBLIC_API_URL=https://your-api-domain.com
   CMD ["npm", "start"]
   ```

2. **Build and run**
   ```bash
   docker build -t epic-games-landing .
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://your-api-domain.com epic-games-landing
   ```

### Option 4: Railway, Render, AWS, etc.

These platforms also support Next.js deployments. They all follow similar patterns:
1. Connect GitHub repository
2. Set environment variables in platform dashboard
3. Deploy automatically or manually

---

## Environment Variable Guidelines

### ✅ For Public Variables (NEXT_PUBLIC_*)
- Visible in browser (don't put secrets here)
- `NEXT_PUBLIC_API_URL` is safe - it's just an endpoint URL

### ❌ For Private Variables (no prefix)
- Only available server-side
- Use for API keys, database URLs, tokens, etc.
- Never exposed to client

---

## Key Points

1. **Local Development**: Use `.env.local` (ignored by git)
2. **Production**: Set variables in deployment platform dashboard
3. **CI/CD**: Platforms like Vercel auto-detect Next.js and handle deployment
4. **Secure**: Never commit `.env` files with secrets
5. **Current setup**: App works with or without env var (has default fallback)

---

## Build Without Environment Variables

Your app has a **fallback default**, so it will work even without setting environment variables:
```javascript
process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
```

However, **for production**, you should set the correct API URL.

---

## Suggested Deployment Setup

| Platform | Effort | Cost | Recommendation |
|----------|--------|------|-----------------|
| Vercel | Very Easy | Free/Paid | ⭐ **Best for Next.js** |
| Netlify | Easy | Free/Paid | Good alternative |
| Railway | Medium | Paid | Good for custom needs |
| Docker | Hard | Varies | For full control |

---

## Quick Vercel Deployment Checklist

- [ ] Push code to GitHub
- [ ] Visit vercel.com and import project
- [ ] Vercel auto-detects Next.js framework
- [ ] Add `NEXT_PUBLIC_API_URL` environment variable
- [ ] Set to your production API endpoint
- [ ] Click Deploy
- [ ] ✅ Done! App is live

