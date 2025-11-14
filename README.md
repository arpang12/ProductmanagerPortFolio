# Portfolio Management System

A comprehensive, AI-powered portfolio management system built with React, TypeScript, Supabase, and Cloudinary. Features a beautiful admin dashboard, multiple case study templates, and seamless content management.

## ✨ Features

### 🎨 **Multiple Template Styles**
- **Default Template**: Dynamic React components with Tailwind CSS
- **Ghibli Template**: Whimsical forest theme with hand-drawn aesthetics  
- **Modern Template**: Glassmorphism design with gradient backgrounds

### 🤖 **AI-Powered Content Enhancement**
- Google Gemini integration for content generation and improvement
- Multiple tone options (Professional, Creative, Whimsical, etc.)
- Custom instruction support for specific requirements
- Real-time content enhancement with magic wand buttons

### 📊 **Comprehensive Content Management**
- **Case Studies**: Rich project showcases with multiple sections
- **My Story**: Personal narrative with AI assistance
- **Magic Toolbox**: Skills and tools showcase with progress bars
- **Journey Timeline**: Career milestones and professional growth
- **Contact Management**: Social links and resume downloads
- **CV Management**: Multi-region CV versions (Indian, Europass, Global)
- **Carousel Management**: Homepage image carousel with drag-and-drop reordering

### 🔧 **Advanced Features**
- **Embedding System**: Figma prototypes, YouTube videos, Miro boards
- **File Upload**: Cloudinary integration with automatic optimization
- **Multi-tenant Architecture**: Organization-based data isolation
- **Row Level Security**: Secure data access with Supabase RLS
- **Real-time Updates**: Live collaboration and instant previews
- **Responsive Design**: Mobile-first approach with dark/light themes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Cloudinary account  
- Google AI Studio account (for Gemini API)

### 1. Clone and Install
```bash
git clone <repository-url>
cd portfolio-management-system
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize and link project
supabase init
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 4. Deploy Edge Functions
```bash
supabase functions deploy generate-upload-signature
supabase functions deploy finalize-upload
supabase functions deploy ai-enhance-content
supabase functions deploy bulk-operations

# Set secrets
supabase secrets set CLOUDINARY_CLOUD_NAME=your_cloud_name
supabase secrets set CLOUDINARY_API_KEY=your_api_key
supabase secrets set CLOUDINARY_API_SECRET=your_api_secret
supabase secrets set ENVIRONMENT=development
```

### 5. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see your portfolio!

## 📁 Project Structure

```
├── components/                 # Reusable UI components
│   ├── managers/              # Content management components
│   ├── templates/             # Case study templates
│   └── ui/                    # Basic UI components
├── pages/                     # Route components
├── services/                  # API and external integrations
├── supabase/                  # Database and edge functions
│   ├── functions/             # Edge functions
│   └── migrations/            # Database migrations
├── types.ts                   # TypeScript definitions
└── utils/                     # Helper functions
```

## 🎯 Core Components

### Admin Dashboard (`AdminPage.tsx`)
- Centralized content management
- Quick action cards for all features
- Case study creation and editing
- Live preview with template switching

### Case Study Editor
- Section-based editing with enable/disable toggles
- AI-powered content enhancement
- Embed support with auto-URL conversion
- Real-time validation and preview

### Content Managers
- **MyStoryManager**: Personal story with AI enhancement
- **CarouselManager**: Image carousel with drag-and-drop
- **MagicToolboxManager**: Skills and tools showcase
- **JourneyManager**: Career timeline management
- **ContactManager**: Contact info and social links
- **CVManager**: Multi-region CV management
- **AISettingsManager**: AI configuration and testing

## 🔧 Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Supabase Client** for real-time data

### Backend Infrastructure
- **Supabase** (PostgreSQL) for database and auth
- **Cloudinary** for media storage and optimization
- **Edge Functions** for server-side logic
- **Row Level Security** for data protection

### AI Integration
- **Google Gemini API** for content enhancement
- **Edge Function** proxy for secure API calls
- **Multiple model support** with fallback options
- **Encrypted API key storage**

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Management
```bash
supabase start       # Start local Supabase
supabase stop        # Stop local Supabase
supabase db reset    # Reset local database
supabase db push     # Push migrations to remote
```

### Edge Functions
```bash
supabase functions serve                    # Serve functions locally
supabase functions deploy <function-name>   # Deploy specific function
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Docker
```bash
docker build -t portfolio-management .
docker run -p 3000:80 portfolio-management
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📖 Documentation

- [CV Management Guide](./CV_MANAGEMENT_GUIDE.md)
- [AI Settings Guide](./AI_SETTINGS_GUIDE.md)
- [Carousel Management](./CAROUSEL_MANAGEMENT.md)
- [Embedding Guide](./EMBEDDING_GUIDE.md)
- [My Story Management](./MY_STORY_MANAGEMENT.md)
- [Modern Template Guide](./MODERN_TEMPLATE_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🔐 Security Features

### Data Protection
- Row Level Security (RLS) policies
- Organization-based data isolation
- Encrypted API key storage
- Secure file upload with signed URLs

### Authentication
- Supabase Auth integration
- JWT-based session management
- Role-based access control
- Secure logout and session cleanup

### File Security
- Cloudinary signed uploads
- File type validation
- Size limits and optimization
- Automatic virus scanning (Cloudinary Pro)

## 🎨 Customization

### Adding New Templates
1. Create template component in `components/templates/`
2. Add template option to case study creation
3. Implement static HTML generation function
4. Update template selector in editor

### Custom Sections
1. Define section type in `types.ts`
2. Add section editor component
3. Update case study validation
4. Implement template rendering

### Styling
- Modify Tailwind configuration
- Update component styles
- Add custom CSS for templates
- Configure dark/light theme variants

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Cloudinary](https://cloudinary.com) for media management
- [Google AI](https://ai.google.dev) for Gemini API
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [React](https://reactjs.org) for the component library

## 📞 Support

For support, please check the documentation or create an issue in the repository.

---

Built with ❤️ using modern web technologies