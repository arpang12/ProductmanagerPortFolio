import React from 'react';

const DevModeDebug: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isDevelopmentMode = !supabaseUrl || !supabaseKey || 
                            supabaseUrl.includes('placeholder') || 
                            supabaseUrl.includes('your-project') ||
                            supabaseKey.includes('placeholder') ||
                            supabaseKey.includes('your_supabase');

  // Only show in development
  if (!isDevelopmentMode) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-xs max-w-sm z-50">
      <div className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">🔧 Dev Mode Debug</div>
      <div className="space-y-1 text-yellow-700 dark:text-yellow-300">
        <div>Mode: <span className="font-mono">{isDevelopmentMode ? 'DEVELOPMENT' : 'PRODUCTION'}</span></div>
        <div>URL: <span className="font-mono">{supabaseUrl || 'undefined'}</span></div>
        <div>Key: <span className="font-mono">{supabaseKey ? '***set***' : 'undefined'}</span></div>
      </div>
    </div>
  );
};

export default DevModeDebug;