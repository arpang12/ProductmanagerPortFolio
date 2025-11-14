// This script should be run in the browser console while on the admin page
// Copy and paste this into the browser console to debug the upload issue

console.log('🔍 Frontend Upload Debug');

// Check if we're in development mode
const isDevelopmentMode = !import.meta.env.VITE_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder') || 
                          import.meta.env.VITE_SUPABASE_URL.includes('your-project') ||
                          !import.meta.env.VITE_SUPABASE_ANON_KEY ||
                          import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder') ||
                          import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your_supabase');

console.log('Development Mode:', isDevelopmentMode);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

// Test the API service
import { api } from './services/api.js';

// Create a test file
const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

console.log('Testing upload with test file...');

api.uploadImage(testFile)
  .then(result => {
    console.log('✅ Upload successful:', result);
    
    // Test carousel creation
    return api.createCarouselImage({
      src: result.url,
      title: 'Test Image',
      description: 'Test description',
      asset_id: result.asset_id
    });
  })
  .then(carousel => {
    console.log('✅ Carousel creation successful:', carousel);
  })
  .catch(error => {
    console.error('❌ Upload failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  });