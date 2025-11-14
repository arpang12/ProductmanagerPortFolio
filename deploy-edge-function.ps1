# Edge Function Deployment Script
# Project ID: djbdwbkhnrdnjreigtfz

Write-Host "🚀 Deploying Edge Function to Supabase" -ForegroundColor Cyan
Write-Host "Project ID: djbdwbkhnrdnjreigtfz" -ForegroundColor Yellow
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "📋 Step 1: Checking Supabase CLI..." -ForegroundColor Cyan
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found" -ForegroundColor Red
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Supabase CLI" -ForegroundColor Red
        Write-Host "Please install manually: npm install -g supabase" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
}

Write-Host ""

# Login to Supabase
Write-Host "📋 Step 2: Logging in to Supabase..." -ForegroundColor Cyan
Write-Host "This will open your browser. Please login with your Supabase account." -ForegroundColor Yellow
supabase login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host "Please run: supabase login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in successfully" -ForegroundColor Green
Write-Host ""

# Link project
Write-Host "📋 Step 3: Linking project..." -ForegroundColor Cyan
supabase link --project-ref djbdwbkhnrdnjreigtfz

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to link project" -ForegroundColor Red
    Write-Host "Please check your project ID and try again" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Project linked" -ForegroundColor Green
Write-Host ""

# Deploy Edge Function
Write-Host "📋 Step 4: Deploying Edge Function..." -ForegroundColor Cyan
Write-Host "Deploying ai-enhance-content..." -ForegroundColor Yellow
supabase functions deploy ai-enhance-content

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Please check the error message above" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Edge Function deployed successfully!" -ForegroundColor Green
Write-Host ""

# Verify deployment
Write-Host "📋 Step 5: Verifying deployment..." -ForegroundColor Cyan
supabase functions list

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Refresh your app in the browser" -ForegroundColor White
Write-Host "2. Go to case study editor" -ForegroundColor White
Write-Host "3. Click AI button (🪄 or ✨)" -ForegroundColor White
Write-Host "4. AI generation should work now!" -ForegroundColor White
Write-Host ""
Write-Host "To test, run: node scripts/diagnose-ai-generation.js" -ForegroundColor Yellow
