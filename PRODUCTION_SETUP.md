# 🚀 Production Setup Guide

## **Required Credentials**

To connect your portfolio system to real services, you'll need the following credentials:

### **1. Supabase Credentials**
From your Supabase project dashboard:
- **Project URL**: `https://your-project-id.supabase.co`
- **Anon Key**: Your public anon key (starts with `eyJ...`)

### **2. Cloudinary Credentials**
From your Cloudinary dashboard:
- **Cloud Name**: Your cloud name
- **API Key**: Your API key
- **API Secret**: Your API secret

### **3. Gemini AI (Optional)**
From Google AI Studio:
- **API Key**: Your Gemini API key

---

## **Step 1: Update .env.local**

Replace the placeholder values in your `.env.local` file with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key

# Cloudinary Configuration (for file uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI (Optional - for AI content enhancement)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional: Analytics and Monitoring
# VITE_GOOGLE_ANALYTICS_ID=your_ga_id
# VITE_SENTRY_DSN=your_sentry_dsn

# Development flag
VITE_DEBUG=true
```

---

## **Step 2: Deploy Database Schema**

Run the following commands to set up your Supabase database:

```bash
# Initialize Supabase (if not already done)
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-id

# Deploy migrations
npx supabase db push

# Deploy edge functions
npx supabase functions deploy
```

---

## **Step 3: Configure Supabase Project**

1. **Enable Authentication**:
   - Go to Authentication > Settings
   - Enable email authentication
   - Set up your site URL: `http://localhost:5175` (for development)

2. **Configure Storage**:
   - Go to Storage
   - Create a bucket named `assets`
   - Set appropriate policies for file uploads

3. **Set Environment Variables**:
   - Go to Project Settings > Edge Functions
   - Add your Cloudinary credentials as secrets

---

## **Step 4: Test Connection**

After updating credentials:

1. **Restart Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Authentication**:
   - Visit `/admin`
   - Try logging in with real credentials

3. **Test File Uploads**:
   - Try uploading images in the admin dashboard
   - Verify they appear in your Cloudinary account

---

## **Need Help?**

If you encounter issues:

1. **Check Console**: Open browser dev tools (F12) for error messages
2. **Verify Credentials**: Double-check all URLs and keys
3. **Check Supabase Logs**: View logs in your Supabase dashboard
4. **Test API Endpoints**: Use the Supabase API explorer

---

**Ready to provide your credentials? I'll help you configure everything!**