import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface PublishedPortfolioData {
    profile: {
        name: string;
        username: string;
        bio?: string;
        location?: string;
        website?: string;
        avatar_url?: string;
    };
    story?: any[];
    skills?: any[];
    tools?: any[];
    projects?: any[];
    journey?: any[];
    carousel?: any[];
    cv?: any[];
    contact?: any[];
    published_at: string;
    version: number;
}

export const PublicPortfolioSnapshotPage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [portfolioData, setPortfolioData] = useState<PublishedPortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (username) {
            fetchPublishedPortfolio();
        }
    }, [username]);

    const fetchPublishedPortfolio = async () => {
        try {
            setLoading(true);
            setError(null);

            // First get the org_id from username
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('org_id, name, username, bio, location, website, avatar_url, portfolio_status')
                .eq('username', username)
                .eq('is_portfolio_public', true)
                .single();

            if (profileError || !profileData) {
                setError('Portfolio not found or not public');
                return;
            }

            if (profileData.portfolio_status !== 'published') {
                setError('This portfolio is currently in draft mode and not available for public viewing.');
                return;
            }

            // Get published portfolio snapshot
            const { data: snapshotData, error: snapshotError } = await supabase
                .rpc('get_published_portfolio', { p_org_id: profileData.org_id });

            if (snapshotError) {
                console.error('Error fetching published portfolio:', snapshotError);
                setError('Failed to load portfolio');
                return;
            }

            if (!snapshotData || Object.keys(snapshotData).length === 0) {
                setError('No published portfolio found');
                return;
            }

            setPortfolioData(snapshotData);
        } catch (err) {
            console.error('Error loading portfolio:', err);
            setError('Failed to load portfolio');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                            Portfolio Not Available
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {error}
                        </p>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (!portfolioData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            
            {/* Published Portfolio Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
                <div className="max-w-6xl mx-auto px-4 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Published Portfolio • Version {portfolioData.version}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                            Last updated: {new Date(portfolioData.published_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <main className="pb-20">
                {/* Hero Section */}
                <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        {portfolioData.profile.avatar_url && (
                            <img
                                src={portfolioData.profile.avatar_url}
                                alt={portfolioData.profile.name}
                                className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20"
                            />
                        )}
                        <h1 className="ghibli-font text-5xl md:text-6xl mb-6">
                            {portfolioData.profile.name}
                        </h1>
                        {portfolioData.profile.bio && (
                            <p className="text-xl md:text-2xl mb-8 opacity-90">
                                {portfolioData.profile.bio}
                            </p>
                        )}
                        <div className="flex items-center justify-center gap-6 text-lg">
                            {portfolioData.profile.location && (
                                <div className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>{portfolioData.profile.location}</span>
                                </div>
                            )}
                            {portfolioData.profile.website && (
                                <a
                                    href={portfolioData.profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:underline"
                                >
                                    <span>🌐</span>
                                    <span>Website</span>
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* My Story Section */}
                {portfolioData.story && portfolioData.story.length > 0 && (
                    <section className="py-20 bg-white dark:bg-gray-800">
                        <div className="max-w-4xl mx-auto px-4">
                            <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">My Story</span>
                            </h2>
                            {portfolioData.story.map((story: any) => (
                                <div key={story.story_id} className="mb-12">
                                    <h3 className="ghibli-font text-3xl mb-6 text-gray-800 dark:text-gray-200">
                                        {story.subtitle}
                                    </h3>
                                    <div className="space-y-4">
                                        {story.paragraphs?.map((paragraph: any, index: number) => (
                                            <p key={index} className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                                                {paragraph.content}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills Section */}
                {portfolioData.skills && portfolioData.skills.length > 0 && (
                    <section className="py-20 bg-gray-50 dark:bg-gray-900">
                        <div className="max-w-6xl mx-auto px-4">
                            <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">Magic Toolbox</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {portfolioData.skills.map((category: any) => (
                                    <div key={category.category_id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                                            {category.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            {category.description}
                                        </p>
                                        <div className="space-y-4">
                                            {category.skills?.map((skill: any, index: number) => (
                                                <div key={index}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {skill.name}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {skill.level}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                                                            style={{ width: `${skill.level}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Tools Section */}
                {portfolioData.tools && portfolioData.tools.length > 0 && (
                    <section className="py-20 bg-white dark:bg-gray-800">
                        <div className="max-w-6xl mx-auto px-4">
                            <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">Enhanced Tools I Wield</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {portfolioData.tools.map((tool: any) => (
                                    <div
                                        key={tool.tool_id}
                                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="text-3xl mb-2">{tool.icon}</div>
                                        <h3 className="font-medium text-gray-800 dark:text-gray-200">
                                            {tool.name}
                                        </h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Projects Section */}
                {portfolioData.projects && portfolioData.projects.length > 0 && (
                    <section className="py-20 bg-gray-50 dark:bg-gray-900">
                        <div className="max-w-6xl mx-auto px-4">
                            <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">Magical Projects</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {portfolioData.projects.map((project: any) => (
                                    <div key={project.case_study_id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                        {project.hero_image_url && (
                                            <img
                                                src={project.hero_image_url}
                                                alt={project.title}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">
                                                {project.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                {project.description}
                                            </p>
                                            {project.tags && (
                                                <div className="flex flex-wrap gap-2">
                                                    {project.tags.map((tag: string, index: number) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact Section */}
                {portfolioData.contact && portfolioData.contact.length > 0 && (
                    <section className="py-20 bg-gray-50 dark:bg-gray-900">
                        <div className="max-w-4xl mx-auto px-4">
                            <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">Contact Me</span>
                            </h2>
                            {portfolioData.contact.map((contact: any) => (
                                <div key={contact.contact_id} className="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-3xl p-8 shadow-2xl">
                                    <h3 className="ghibli-font text-2xl mb-4">{contact.subtitle}</h3>
                                    <p className="text-lg leading-relaxed opacity-90 mb-6">
                                        {contact.description}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                📧
                                            </div>
                                            <span className="font-medium">{contact.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                                📍
                                            </div>
                                            <span className="font-medium">{contact.location}</span>
                                        </div>
                                    </div>
                                    {contact.social_links && (
                                        <div className="flex gap-4">
                                            {contact.social_links.map((link: any) => (
                                                <a
                                                    key={link.name}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                                    title={link.name}
                                                >
                                                    <span className="text-xl">{link.icon}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
};