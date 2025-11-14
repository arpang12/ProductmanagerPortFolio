#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Portfolio Management System - Setup Verification');
console.log('==================================================\n');

const checks = [
    {
        name: 'Environment Configuration',
        check: () => fs.existsSync('.env.local'),
        message: '.env.local file exists',
        fix: 'Create .env.local from .env.example template'
    },
    {
        name: 'Supabase Configuration',
        check: () => fs.existsSync('supabase/config.toml'),
        message: 'Supabase configuration exists',
        fix: 'Run: supabase init'
    },
    {
        name: 'Database Migrations',
        check: () => fs.existsSync('supabase/migrations/001_initial_schema.sql'),
        message: 'Database schema migration exists',
        fix: 'Database migrations are included in the project'
    },
    {
        name: 'Edge Functions',
        check: () => {
            const functions = [
                'supabase/functions/generate-upload-signature/index.ts',
                'supabase/functions/finalize-upload/index.ts',
                'supabase/functions/ai-enhance-content/index.ts',
                'supabase/functions/bulk-operations/index.ts'
            ];
            return functions.every(f => fs.existsSync(f));
        },
        message: 'All edge functions are present',
        fix: 'Edge functions are included in the project'
    },
    {
        name: 'TypeScript Configuration',
        check: () => fs.existsSync('tsconfig.json'),
        message: 'TypeScript configuration exists',
        fix: 'TypeScript config is included'
    },
    {
        name: 'Vite Configuration',
        check: () => fs.existsSync('vite.config.ts'),
        message: 'Vite configuration exists',
        fix: 'Vite config is included'
    },
    {
        name: 'Package Dependencies',
        check: () => fs.existsSync('node_modules'),
        message: 'Dependencies are installed',
        fix: 'Run: npm install'
    },
    {
        name: 'Core Components',
        check: () => {
            const components = [
                'components/CVManager.tsx',
                'components/ContactManager.tsx',
                'components/JourneyManager.tsx',
                'components/MagicToolboxManager.tsx',
                'components/AISettingsManager.tsx',
                'components/CarouselManager.tsx',
                'components/MyStoryManager.tsx'
            ];
            return components.every(c => fs.existsSync(c));
        },
        message: 'All manager components exist',
        fix: 'Manager components are included'
    },
    {
        name: 'Services',
        check: () => {
            const services = [
                'services/api.ts',
                'services/geminiService.ts'
            ];
            return services.every(s => fs.existsSync(s));
        },
        message: 'API and AI services exist',
        fix: 'Services are included'
    },
    {
        name: 'Documentation',
        check: () => {
            const docs = [
                'README.md',
                'DEPLOYMENT_GUIDE.md',
                'CV_MANAGEMENT_GUIDE.md',
                'AI_SETTINGS_GUIDE.md'
            ];
            return docs.every(d => fs.existsSync(d));
        },
        message: 'Documentation files exist',
        fix: 'Documentation is included'
    }
];

let allPassed = true;

checks.forEach((check, index) => {
    const passed = check.check();
    const status = passed ? '✅' : '❌';
    const message = passed ? check.message : `${check.message} - ${check.fix}`;
    
    console.log(`${index + 1}. ${status} ${check.name}`);
    console.log(`   ${message}\n`);
    
    if (!passed) {
        allPassed = false;
    }
});

console.log('📋 Setup Summary');
console.log('================');

if (allPassed) {
    console.log('🎉 All checks passed! Your portfolio system is ready.');
    console.log('\n📝 Next Steps:');
    console.log('1. Configure your .env.local with Supabase credentials');
    console.log('2. Set up Supabase project: supabase link --project-ref YOUR_REF');
    console.log('3. Deploy database: supabase db push');
    console.log('4. Deploy edge functions: supabase functions deploy <function-name>');
    console.log('5. Set Cloudinary secrets in Supabase');
    console.log('6. Start development: npm run dev');
} else {
    console.log('⚠️  Some checks failed. Please address the issues above.');
}

console.log('\n🔗 Useful Commands:');
console.log('• npm run dev          - Start development server');
console.log('• npm run build        - Build for production');
console.log('• npm run setup        - Run initial setup');
console.log('• supabase start       - Start local Supabase');
console.log('• supabase db push     - Deploy database changes');

console.log('\n📚 Documentation:');
console.log('• README.md            - Project overview and setup');
console.log('• DEPLOYMENT_GUIDE.md  - Production deployment guide');
console.log('• Component guides     - Feature-specific documentation');

console.log('\n💡 Need help? Check the documentation or create an issue.');