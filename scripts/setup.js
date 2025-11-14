#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Portfolio Management System Setup');
console.log('=====================================\n');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
    console.log('📝 Creating .env.local from template...');
    fs.copyFileSync('.env.example', '.env.local');
    console.log('✅ Created .env.local - Please fill in your environment variables\n');
} else {
    console.log('✅ .env.local already exists\n');
}

// Check if Supabase CLI is installed
try {
    execSync('supabase --version', { stdio: 'ignore' });
    console.log('✅ Supabase CLI is installed');
} catch (error) {
    console.log('❌ Supabase CLI not found');
    console.log('📦 Installing Supabase CLI...');
    try {
        execSync('npm install -g supabase', { stdio: 'inherit' });
        console.log('✅ Supabase CLI installed successfully');
    } catch (installError) {
        console.log('❌ Failed to install Supabase CLI');
        console.log('Please install manually: npm install -g supabase');
    }
}

// Check if supabase is initialized
if (!fs.existsSync('supabase/config.toml')) {
    console.log('\n📋 Supabase not initialized');
    console.log('Run the following commands to set up Supabase:');
    console.log('1. supabase login');
    console.log('2. supabase link --project-ref YOUR_PROJECT_REF');
    console.log('3. supabase db push');
    console.log('4. Deploy edge functions (see README.md)');
} else {
    console.log('✅ Supabase is initialized');
}

// Check dependencies
console.log('\n📦 Checking dependencies...');
if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
    } catch (error) {
        console.log('❌ Failed to install dependencies');
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies are installed');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Fill in your .env.local file with Supabase credentials');
console.log('2. Set up Supabase project and deploy edge functions');
console.log('3. Configure Cloudinary credentials in Supabase secrets');
console.log('4. Run "npm run dev" to start development server');
console.log('\nSee DEPLOYMENT_GUIDE.md for detailed instructions.');