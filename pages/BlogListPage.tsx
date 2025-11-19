import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BlogPost, View } from '../types';
import { api } from '../services/api';

interface BlogListPageProps {
    navigateTo: (view: View, blogSlug?: string) => void;
    isAuthenticated?: boolean;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ navigateTo, isAuthenticated = false }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [filterTag, setFilterTag] = useState<string>('all');

    useEffect(() => {
        const fetchPosts = async () => {
            const fetchedPosts = await api.getBlogPosts();
            setPosts(fetchedPosts);
            setFilteredPosts(fetchedPosts);
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        let result = [...posts];

        if (filterTag !== 'all') {
            result = result.filter(post => post.tags.includes(filterTag));
        }

        result.sort((a, b) => {
            const dateA = new Date(a.publishedAt).getTime();
            const dateB = new Date(b.publishedAt).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredPosts(result);
    }, [posts, sortBy, filterTag]);

    const allTags = Array.from(new Set(posts.flatMap(p => p.tags)));

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
            
            <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Blog
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Thoughts, insights, and stories from my journey
                        </p>
                    </div>

                    {/* Filters */}
                    {posts.length > 0 && (
                        <div className="flex flex-wrap gap-4 justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterTag('all')}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        filterTag === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    All Posts
                                </button>
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setFilterTag(tag)}
                                        className={`px-4 py-2 rounded-lg transition-all ${
                                            filterTag === tag
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    )}

                    {/* Blog Posts Grid */}
                    {filteredPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map(post => (
                                <article
                                    key={post.id}
                                    onClick={() => navigateTo('blogPost', post.slug)}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
                                >
                                    {post.coverImageUrl && (
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={post.coverImageUrl}
                                                alt={post.title}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            <span>{formatDate(post.publishedAt)}</span>
                                            {post.readTime && (
                                                <>
                                                    <span>•</span>
                                                    <span>{post.readTime} min read</span>
                                                </>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                                            {post.excerpt}
                                        </p>
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
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                By {post.author}
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-2 transition-transform">
                                                →
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                                No blog posts yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Check back soon for new content!
                            </p>
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </>
    );
};

export default BlogListPage;
