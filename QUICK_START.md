# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# You'll need:
# - Supabase project URL and anon key
# - (Optional) Cloudinary credentials for file uploads
# - (Optional) Gemini API key for AI features
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Development Mode Features

### Without Supabase Setup
- ✅ UI components and layouts work
- ✅ Navigation and routing
- ✅ Theme switching (dark/light)
- ❌ Data persistence (uses mock data)
- ❌ File uploads
- ❌ AI features

### With Supabase Setup
- ✅ Full database integration
- ✅ User authentication
- ✅ File uploads via Cloudinary
- ✅ AI content enhancement
- ✅ Real-time updates

## 📝 Environment Variables

### Required for Full Functionality
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional
```env
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn
VITE_DEBUG=true
```

## 🗄️ Database Setup (Optional for Development)

If you want full functionality:

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get URL and anon key from Settings > API

2. **Deploy Database Schema**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy generate-upload-signature
   supabase functions deploy finalize-upload
   supabase functions deploy ai-enhance-content
   supabase functions deploy bulk-operations
   ```

## 🎨 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run setup        # Run setup wizard
npm run verify       # Verify installation
```

## 🔍 Troubleshooting

### "supabaseUrl is required" Error
- Check that `.env.local` exists and has valid Supabase credentials
- Restart the development server after adding environment variables

### Tailwind Styles Not Loading
- Make sure `tailwind.config.js` and `postcss.config.js` exist
- Restart the development server

### Build Errors
- Run `npm run verify` to check system status
- Ensure all dependencies are installed with `npm install`

## 📚 Next Steps

1. **Explore the Admin Panel** - Go to `/admin` (no auth required in dev mode)
2. **Check Documentation** - Read the component-specific guides
3. **Set Up Production** - Follow `DEPLOYMENT_GUIDE.md` for production setup

## 💡 Development Tips

- Use the browser's React DevTools for debugging
- Check the browser console for helpful error messages
- The app works offline with mock data when Supabase isn't configured
- All manager components have placeholder interfaces when data isn't available

Happy coding! 🎉