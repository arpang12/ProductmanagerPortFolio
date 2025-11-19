import React from 'react';
import PublicPortfolioViewer from '../components/PublicPortfolioViewer';
import { View } from '../types';

interface PublicPortfolioPageProps {
    navigateTo: (view: View, caseStudyId?: string) => void;
    username?: string;
}

const PublicPortfolioPage: React.FC<PublicPortfolioPageProps> = ({ navigateTo, username }) => {
    if (!username) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Username Provided</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Please provide a valid username to view the portfolio.
                    </p>
                    <button
                        onClick={() => navigateTo('home')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return <PublicPortfolioViewer username={username} />;
};

export default PublicPortfolioPage;