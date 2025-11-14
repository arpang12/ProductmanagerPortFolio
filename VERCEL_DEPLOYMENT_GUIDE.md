# 🚀 Vercel Deployment Guide

Complete guide to deploy your Portfolio Management System on Vercel.

---

## 📋 Prerequisites

- ✅ GitHub repository: https://github.com/arpang12/ProductmanagerPortFolio
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Supabase project set up
- ✅ Cloudinary account (for image uploads)
- ✅ Google Gemini API key (for AI features)

---

## 🎯 Quick Deployment (5 Minutes)

### Step 1: Connect to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **GitHub**
4. Find and select: `arpang12/ProductmanagerPortFolio`
5. Click **"Import"**

### Step 2: Configure Project

**Framework Preset:** Vite
**Root Directory:** `./` (leave as default)
**Build Command:** `npm run build`
**Output Directory:** `dist`

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add these:

```env
VITE_SUPABASE_URL=https://djbdwbkhnrdnjreigtfz.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDINARY_CLOUD_NAME=dgymjtqil
VITE_CLOUDINARY_API_KEY=416743773648286
VITE_CLOUDINARY_API_SECRET=your_cloudinary_secret
ENVIRONMENT=production
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://your-project.vercel.app`

---

## 🔧 Detailed Setup

### 1. Environment Variables Setup

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Production, Preview, Development |
| `VITE_CLOUDINARY_API_KEY` | Your Cloudinary API key | Production, Preview, Development |
| `VITE_CLOUDINARY_API_SECRET` | Your Cloudinary API secret | Production, Preview, Development |
| `ENVIRONMENT` | `production` | Production |

**Where to find these values:**

**Supabase:**
- Go to https://supabase.com/dashboard
- Select your project
- Settings → API
- Copy `URL` and `anon/public` key

**Cloudinary:**
- Go to https://cloudinary.com/console
- Dashboard shows Cloud Name, API Key, API Secret

### 2. Build Settings

In Vercel Dashboard → Your Project → Settings → General:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Development Command: npm run dev
```

### 3. Domain Configuration (Optional)

**Custom Domain:**
1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-30 minutes)

**Default Domain:**
Your app will be available at: `https://productmanager-portfolio.vercel.app`

---

## 🗄️ Supabase Edge Functions Deployment

Your Vercel deployment handles the frontend. For backend (Edge Functions), deploy to Supabase:

### Deploy Edge Functions

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref djbdwbkhnrdnjreigtfz

# Deploy all Edge Functions
supabase functions deploy ai-enhance-content
supabase functions deploy generate-upload-signature
supabase functions deploy finalize-upload
supabase functions deploy bulk-operations
```

### Set Supabase Secrets

```bash
supabase secrets set CLOUDINARY_CLOUD_NAME=dgymjtqil
supabase secrets set CLOUDINARY_API_KEY=416743773648286
supabase secrets set CLOUDINARY_API_SECRET=your_secret
supabase secrets set ENVIRONMENT=production
```

---

## ✅ Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Visit your Vercel URL
- [ ] Check if homepage loads
- [ ] Verify no console errors (F12)
- [ ] Test navigation between pages

### 2. Test Authentication

- [ ] Go to login page
- [ ] Try logging in with your credentials
- [ ] Verify you can access admin page

### 3. Test Core Features

- [ ] Upload an image (Carousel)
- [ ] Create a case study
- [ ] Test AI enhancement (if configured)
- [ ] Check if data persists after refresh

### 4. Configure AI Settings

- [ ] Go to Admin → AI Settings
- [ ] Enter your Gemini API key
- [ ] Select a model
- [ ] Test connection
- [ ] Save settings

### 5. Set Up Your Profile

- [ ] Go to Admin page
- [ ] Fill in your story
- [ ] Add case studies
- [ ] Upload images
- [ ] Configure contact info

---

## 🔍 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Check package.json dependencies
# Ensure all imports are correct
```

**Error: "Environment variable not found"**
```bash
# Solution: Add missing env vars in Vercel dashboard
# Make sure they start with VITE_
```

### Runtime Errors

**"Supabase URL is required"**
- Check environment variables in Vercel
- Ensure `VITE_SUPABASE_URL` is set
- Redeploy after adding variables

**"Failed to fetch"**
- Check Supabase RLS policies
- Verify Edge Functions are deployed
- Check browser console for CORS errors

**Images not uploading**
- Verify Cloudinary credentials
- Check Edge Functions are deployed
- Test Cloudinary signature generation

### Performance Issues

**Slow initial load**
- Enable Vercel Analytics
- Check bundle size
- Consider code splitting

**API timeouts**
- Check Supabase Edge Function logs
- Verify database queries are optimized
- Check for rate limiting

---

## 🚀 Optimization Tips

### 1. Enable Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `src/main.tsx`:
```typescript
import { inject } from '@vercel/analytics';
inject();
```

### 2. Enable Speed Insights

```bash
npm install @vercel/speed-insights
```

Add to `src/main.tsx`:
```typescript
import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights();
```

### 3. Configure Caching

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. Optimize Images

- Use Cloudinary transformations
- Enable lazy loading
- Compress images before upload

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

### Automatic Deployments

**Production:**
- Push to `main` branch
- Automatic deployment to production URL

**Preview:**
- Create pull request
- Automatic preview deployment
- Unique URL for each PR

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 📊 Monitoring

### Vercel Dashboard

**Analytics:**
- Page views
- Unique visitors
- Top pages
- Geographic distribution

**Logs:**
- Build logs
- Function logs
- Error tracking

**Performance:**
- Core Web Vitals
- Load times
- Response times

### Supabase Dashboard

**Database:**
- Query performance
- Table sizes
- Active connections

**Edge Functions:**
- Invocation count
- Error rate
- Response times

**Storage:**
- File uploads
- Bandwidth usage

---

## 🔐 Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/prod

### 2. Supabase Security

- ✅ Enable Row Level Security (RLS)
- ✅ Use service role key only in Edge Functions
- ✅ Never expose service role key to frontend
- ✅ Implement proper authentication

### 3. API Keys

- ✅ Store Gemini API key in database (encrypted)
- ✅ Use Edge Functions to proxy API calls
- ✅ Implement rate limiting
- ✅ Monitor API usage

---

## 📱 Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., `portfolio.yourdomain.com`)
4. Click "Add"

### 2. Configure DNS

**For subdomain (portfolio.yourdomain.com):**
```
Type: CNAME
Name: portfolio
Value: cname.vercel-dns.com
```

**For root domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

### 3. Wait for Propagation

- DNS changes take 5-30 minutes
- Vercel will automatically provision SSL certificate
- Your site will be available at your custom domain

---

## 🎯 Production Checklist

Before going live:

### Technical
- [ ] All environment variables set
- [ ] Edge Functions deployed
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)

### Content
- [ ] Profile information complete
- [ ] Case studies published
- [ ] Images uploaded and optimized
- [ ] Contact information updated
- [ ] CV uploaded

### Testing
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Image uploads work
- [ ] AI features work (if configured)
- [ ] Mobile responsive
- [ ] Cross-browser tested

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Images optimized
- [ ] No console errors

---

## 🆘 Getting Help

### Vercel Support

- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: https://vercel.com/support

### Supabase Support

- Documentation: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions
- Discord: https://discord.supabase.com

### Project Issues

- GitHub Issues: https://github.com/arpang12/ProductmanagerPortFolio/issues
- Check documentation files in the repository

---

## 🎉 Success!

Once deployed, your portfolio will be live at:
- **Vercel URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

Share your portfolio with the world! 🚀

---

## 📚 Next Steps

1. **Customize Content**: Add your projects and case studies
2. **Configure AI**: Set up Gemini API for AI features
3. **Optimize Performance**: Enable analytics and monitoring
4. **Share**: Add to your resume and LinkedIn
5. **Maintain**: Keep content updated regularly

---

**Your portfolio is production-ready and optimized for Vercel!** 🎊
