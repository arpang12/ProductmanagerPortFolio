# Portfolio Management System - Deployment Guide

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Cloudinary account
- Google AI Studio account (for Gemini API)

## 1. Supabase Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### Database Setup

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project:
```bash
supabase init
```

3. Link to your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. Run migrations:
```bash
supabase db push
```

### Deploy Edge Functions

1. Deploy all edge functions:
```bash
supabase functions deploy generate-upload-signature
supabase functions deploy finalize-upload
supabase functions deploy ai-enhance-content
supabase functions deploy bulk-operations
```

2. Set environment variables for edge functions:
```bash
supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name
supabase secrets set CLOUDINARY_API_KEY=your_api_key
supabase secrets set CLOUDINARY_API_SECRET=your_api_secret
supabase secrets set ENVIRONMENT=production
```

## 2. Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from Dashboard
3. Configure upload presets (optional) for better control

## 3. Environment Configuration

Create `.env.local` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn
```

## 4. Initial Data Setup

### Create Organization and User Profile

After deployment, you'll need to create initial data:

1. Sign up through your application
2. Manually insert organization and user profile in Supabase dashboard:

```sql
-- Insert organization
INSERT INTO organizations (org_id, name, slug) 
VALUES ('01234567890123456789012345', 'Your Portfolio', 'your-portfolio');

-- Insert user profile (replace USER_ID with your auth.users id)
INSERT INTO user_profiles (user_id, org_id, email, name, role)
VALUES ('your-auth-user-id', '01234567890123456789012345', 'your@email.com', 'Your Name', 'admin');
```

## 5. Local Development

1. Install dependencies:
```bash
npm install
```

2. Start Supabase locally (optional):
```bash
supabase start
```

3. Start development server:
```bash
npm run dev
```

## 6. Production Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Docker Deployment

1. Build Docker image:
```bash
docker build -t portfolio-management .
```

2. Run container:
```bash
docker run -p 3000:3000 --env-file .env.local portfolio-management
```

## 7. Post-Deployment Setup

### Configure AI Settings

1. Get Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Go to Admin Panel > AI Settings
3. Enter API key and test connection

### Upload Initial Content

1. Go to Admin Panel
2. Configure each section:
   - My Story
   - Magic Toolbox (Skills)
   - Journey Timeline
   - Contact Information
   - CV Management
   - Carousel Images

### Create Case Studies

1. Use the Case Study Editor to create your first project
2. Choose template style (Default, Ghibli, or Modern)
3. Fill in all sections and publish

## 8. Security Considerations

### Row Level Security (RLS)

RLS policies are automatically applied via migrations. Ensure:
- Users can only access their organization's data
- Public content is properly exposed
- Upload sessions are user-specific

### API Key Security

- Gemini API keys are encrypted in the database
- Never expose API keys in client-side code
- Use environment variables for all secrets

### File Upload Security

- File uploads go through signed URLs
- Cloudinary handles file validation
- Upload sessions expire after 10 minutes

## 9. Monitoring and Maintenance

### Database Monitoring

Monitor your Supabase dashboard for:
- Database usage and performance
- API request patterns
- Error logs

### Cloudinary Monitoring

Check Cloudinary dashboard for:
- Storage usage
- Bandwidth consumption
- Transformation usage

### Application Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring
- Uptime monitoring

## 10. Backup and Recovery

### Database Backups

Supabase provides automatic backups, but consider:
- Regular manual exports of critical data
- Testing restore procedures
- Documenting recovery processes

### Asset Backups

Cloudinary provides redundancy, but consider:
- Periodic asset audits
- Backup critical images locally
- Document asset organization structure

## Troubleshooting

### Common Issues

1. **Upload failures**: Check Cloudinary credentials and CORS settings
2. **AI not working**: Verify Gemini API key and model availability
3. **Database errors**: Check RLS policies and user permissions
4. **Build failures**: Ensure all environment variables are set

### Debug Mode

Enable debug logging by setting:
```env
VITE_DEBUG=true
```

### Support

- Supabase: [docs.supabase.com](https://docs.supabase.com)
- Cloudinary: [cloudinary.com/documentation](https://cloudinary.com/documentation)
- Gemini API: [ai.google.dev/docs](https://ai.google.dev/docs)