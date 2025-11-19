import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CaseStudy, MyStorySection, MyJourney, MagicToolbox, ContactSection, CarouselImage } from '../types';
import Carousel from './Carousel';

interface PublicPortfolioViewerProps {
    username: string;
}

interface PortfolioData {
    profile: any;
    caseStudies: CaseStudy[];
    story: MyStorySection | null;
    journey: MyJourney | null;
    toolbox: MagicToolbox | null;
    contact: ContactSection | null;
    carousel: CarouselImage[];
}

const PublicPortfolioViewer: React.FC<PublicPortfolioViewerProps> = ({ username }) => {
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPortfolioData();
    }, [username]);

    const loadPortfolioData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const data = await api.getPublicPortfolioByUsername(username);
            setPortfolioData(data);
        } catch (error) {
            console.error('Error loading portfolio:', error);
            setError('Portfolio not found or not published');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    if (error || !portfolioData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Portfolio Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {error || 'The portfolio you\'re looking for doesn\'t exist or isn\'t published yet.'}
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const { profile, caseStudies, story, journey, toolbox, contact, carousel } = portfolioData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {profile.name || username}
                            </h1>
                            {profile.bio && (
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.bio}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">Live Portfolio</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Carousel */}
            {carousel && carousel.length > 0 && (
                <section className="py-8">
                    <div className="max-w-7xl mx-auto px-4">
                        <Carousel />
                    </div>
                </section>
            )}

            {/* My Story */}
            {story && (
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {story.title}
                            </h2>
                            {story.subtitle && (
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{story.subtitle}</p>
                            )}
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-4">
                                    {story.paragraphs.map((paragraph, index) => (
                                        <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                                {story.imageUrl && (
                                    <div className="flex justify-center">
                                        <img
                                            src={story.imageUrl}
                                            alt={story.imageAlt || 'Profile'}
                                            className="rounded-lg shadow-lg max-w-full h-auto"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Case Studies */}
            {caseStudies && caseStudies.length > 0 && (
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                            Case Studies
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {caseStudies.map((caseStudy) => (
                                <div key={caseStudy.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    {caseStudy.sections.hero?.imageUrl && (
                                        <img
                                            src={caseStudy.sections.hero.imageUrl}
                                            alt={caseStudy.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {caseStudy.title}
                                        </h3>
                                        {caseStudy.sections.overview?.summary && (
                                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                                {caseStudy.sections.overview.summary}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => window.location.href = `/case-study/${caseStudy.id}`}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            View Case Study
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Journey */}
            {journey && journey.items && journey.items.length > 0 && (
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                            My Journey
                        </h2>
                        <div className="space-y-6">
                            {journey.items.map((item, index) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-4 h-4 rounded-full mt-2 ${
                                            item.isActive ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}></div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                {item.description}
                                            </p>
                                            {item.period && (
                                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                                    {item.period}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Magic Toolbox */}
            {toolbox && (toolbox.categories.length > 0 || toolbox.tools.length > 0) && (
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                            Skills & Tools
                        </h2>
                        
                        {/* Skills */}
                        {toolbox.categories.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Skills</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {toolbox.categories.map((category) => (
                                        <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                {category.title}
                                            </h4>
                                            <div className="space-y-2">
                                                {category.skills.map((skill, index) => (
                                                    <div key={index} className="flex justify-between items-center">
                                                        <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                                                        <span className="text-sm text-gray-500">{skill.level}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tools */}
                        {toolbox.tools.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Tools</h3>
                                <div className="flex flex-wrap gap-3">
                                    {toolbox.tools.map((tool) => (
                                        <div
                                            key={tool.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                                        >
                                            {tool.iconUrl && (
                                                <img src={tool.iconUrl} alt={tool.name} className="w-5 h-5" />
                                            )}
                                            <span className="text-gray-700 dark:text-gray-300">{tool.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Contact */}
            {contact && (
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                {contact.title || 'Get In Touch'}
                            </h2>
                            {contact.description && (
                                <p className="text-gray-600 dark:text-gray-400 mb-6">{contact.description}</p>
                            )}
                            {contact.email && (
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
                                >
                                    Contact Me
                                </a>
                            )}
                            {contact.socialLinks && contact.socialLinks.length > 0 && (
                                <div className="flex justify-center gap-4 mt-6">
                                    {contact.socialLinks.map((link) => (
                                        <a
                                            key={link.id}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        © 2024 {profile.name || username}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicPortfolioViewer;