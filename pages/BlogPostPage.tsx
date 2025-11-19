import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BlogPost, View } from '../types';

interface BlogPostPageProps {
    post: BlogPost;
    navigateTo: (view: View) => void;
    isAuthenticated?: boolean;
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, navigateTo, isAuthenticated = false }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <Header navigateTo={navigateTo} />
            
            {/* Fixed Back Button */}
            <button
                onClick={() => navigateTo('blog')}
                className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all group border border-gray-200 dark:border-gray-700"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Blog</span>
            </button>

            <main className="pt-20 min-h-screen bg-white dark:bg-gray-900">
                {/* Hero Section with Cover Image */}
                {post.coverImageUrl && (
                    <div className="relative h-[60vh] bg-gray-900">
                        <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <div className="max-w-4xl mx-auto">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                                    {post.title}
                                </h1>
                                <div className="flex items-center gap-4 text-white/90">
                                    <span>By {post.author}</span>
                                    <span>•</span>
                                    <span>{formatDate(post.publishedAt)}</span>
                                    {post.readTime && (
                                        <>
                                            <span>•</span>
                                            <span>{post.readTime} min read</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <article className="max-w-4xl mx-auto px-4 py-12">
                    {/* Title and Meta (if no cover image) */}
                    {!post.coverImageUrl && (
                        <header className="mb-12">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                {post.title}
                            </h1>
                            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                                <span>By {post.author}</span>
                                <span>•</span>
                                <span>{formatDate(post.publishedAt)}</span>
                                {post.readTime && (
                                    <>
                                        <span>•</span>
                                        <span>{post.readTime} min read</span>
                                    </>
                                )}
                            </div>
                        </header>
                    )}

                    {/* Excerpt */}
                    {post.excerpt && (
                        <div className="text-xl text-gray-600 dark:text-gray-400 italic border-l-4 border-blue-500 pl-6 mb-12">
                            {post.excerpt}
                        </div>
                    )}

                    {/* Main Content */}
                    <div 
                        className="prose prose-lg dark:prose-invert max-w-none
                            prose-headings:font-bold prose-headings:text-gray-800 dark:prose-headings:text-gray-100
                            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                            prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100
                            prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
                            prose-img:rounded-xl prose-img:shadow-lg
                            prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                            prose-ol:text-gray-700 dark:prose-ol:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Updated At */}
                    {post.updatedAt && post.updatedAt !== post.publishedAt && (
                        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                            Last updated: {formatDate(post.updatedAt)}
                        </div>
                    )}

                    {/* Back to Blog Link */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => navigateTo('blog')}
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to All Posts
                        </button>
                    </div>
                </article>
            </main>
            
            <Footer />
        </>
    );
};

export default BlogPostPage;
