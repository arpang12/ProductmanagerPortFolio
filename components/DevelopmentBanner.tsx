import React from 'react';

const DevelopmentBanner: React.FC = () => {
  const isDevelopmentMode = !import.meta.env.VITE_SUPABASE_URL || 
                           import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

  if (!isDevelopmentMode) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                🔧 Development Mode Active
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Using mock data. Configure Supabase in .env.local for full functionality.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/QUICK_START.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
            >
              Setup Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentBanner;