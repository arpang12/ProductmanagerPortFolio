// Check environment variables in browser context
console.log('🔍 Environment Variables Check');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
console.log('VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

const isDevelopmentMode = !import.meta.env.VITE_SUPABASE_URL || 
                          !import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder') || 
                          import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
                          import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder') ||
                          import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your_supabase');

console.log('Development Mode Detected:', isDevelopmentMode);

// Check individual conditions
console.log('URL missing:', !import.meta.env.VITE_SUPABASE_URL);
console.log('Key missing:', !import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('URL has placeholder:', import.meta.env.VITE_SUPABASE_URL?.includes('placeholder'));
console.log('URL has your-project:', import.meta.env.VITE_SUPABASE_URL?.includes('your-project'));
console.log('Key has placeholder:', import.meta.env.VITE_SUPABASE_ANON_KEY?.includes('placeholder'));
console.log('Key has your_supabase:', import.meta.env.VITE_SUPABASE_ANON_KEY?.includes('your_supabase'));