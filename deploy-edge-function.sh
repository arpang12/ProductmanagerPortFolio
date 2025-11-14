#!/bin/bash

# Edge Function Deployment Script
# Project ID: djbdwbkhnrdnjreigtfz

echo "🚀 Deploying Edge Function to Supabase"
echo "Project ID: djbdwbkhnrdnjreigtfz"
echo ""

# Check if Supabase CLI is installed
echo "📋 Step 1: Checking Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo "Installing Supabase CLI..."
    npm install -g supabase
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Supabase CLI"
        echo "Please install manually: npm install -g supabase"
        exit 1
    fi
    echo "✅ Supabase CLI installed"
else
    echo "✅ Supabase CLI found"
fi

echo ""

# Login to Supabase
echo "📋 Step 2: Logging in to Supabase..."
echo "This will open your browser. Please login with your Supabase account."
supabase login

if [ $? -ne 0 ]; then
    echo "❌ Login failed"
    echo "Please run: supabase login"
    exit 1
fi
echo "✅ Logged in successfully"
echo ""

# Link project
echo "📋 Step 3: Linking project..."
supabase link --project-ref djbdwbkhnrdnjreigtfz

if [ $? -ne 0 ]; then
    echo "❌ Failed to link project"
    echo "Please check your project ID and try again"
    exit 1
fi
echo "✅ Project linked"
echo ""

# Deploy Edge Function
echo "📋 Step 4: Deploying Edge Function..."
echo "Deploying ai-enhance-content..."
supabase functions deploy ai-enhance-content

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    echo "Please check the error message above"
    exit 1
fi
echo "✅ Edge Function deployed successfully!"
echo ""

# Verify deployment
echo "📋 Step 5: Verifying deployment..."
supabase functions list

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "Next steps:"
echo "1. Refresh your app in the browser"
echo "2. Go to case study editor"
echo "3. Click AI button (🪄 or ✨)"
echo "4. AI generation should work now!"
echo ""
echo "To test, run: node scripts/diagnose-ai-generation.js"
