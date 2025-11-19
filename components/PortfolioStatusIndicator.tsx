import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface PortfolioStatus {
    status: 'draft' | 'published';
    publicUrl?: string;
    username?: string;
}

const PortfolioStatusIndicator: React.FC = () => {
    const [status, setStatus] = useState<PortfolioStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatus();
        // Refresh status every 30 seconds
        const interval = setInterval(loadStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadStatus = async () => {
        try {
            const portfolioStatus = await api.getPortfolioStatus();
            setStatus(portfolioStatus);
        } catch (error) {
            console.error('Error loading portfolio status:', error);
            // Set default status if error (likely not authenticated)
            setStatus({
                status: 'draft',
                username: undefined,
                publicUrl: undefined
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Loading...</span>
            </div>
        );
    }

    if (!status) return null;

    return (
        <div className="flex items-center gap-2">
            {/* Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
                status.status === 'published' 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
                <div className={`w-2 h-2 rounded-full ${
                    status.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className={`text-xs font-medium ${
                    status.status === 'published'
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                    {status.status === 'published' ? 'Live' : 'Draft'}
                </span>
            </div>

            {/* Quick Actions */}
            {status.status === 'published' && status.publicUrl && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(status.publicUrl!);
                            // Show temporary feedback
                            const btn = document.activeElement as HTMLButtonElement;
                            const originalText = btn.textContent;
                            btn.textContent = '✓';
                            setTimeout(() => {
                                btn.textContent = originalText;
                            }, 1000);
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="Copy public URL"
                    >
                        📋
                    </button>
                    <button
                        onClick={() => window.open(status.publicUrl, '_blank')}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="Visit live portfolio"
                    >
                        🔗
                    </button>
                </div>
            )}
        </div>
    );
};

export default PortfolioStatusIndicator;