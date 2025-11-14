
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import Carousel from '../components/Carousel';
import { Project, View, MyStorySection, MagicToolbox, MyJourney, ContactSection, CVSection } from '../types';
import { api } from '../services/api';

interface HomePageProps {
    navigateTo: (view: View, caseStudyId?: string) => void;
}

const SootSprite: React.FC<{ style?: React.CSSProperties }> = ({ style }) => <div className="w-8 h-8 bg-black rounded-full relative floating" style={style}><div className="absolute top-2 left-1.5 w-2 h-2 bg-white rounded-full"></div><div className="absolute top-2 right-1.5 w-2 h-2 bg-white rounded-full"></div></div>;

const HomePage: React.FC<HomePageProps> = ({ navigateTo }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [filterTag, setFilterTag] = useState<string>('all');
    const [myStory, setMyStory] = useState<MyStorySection | null>(null);
    const [magicToolbox, setMagicToolbox] = useState<MagicToolbox | null>(null);
    const [myJourney, setMyJourney] = useState<MyJourney | null>(null);
    const [contactSection, setContactSection] = useState<ContactSection | null>(null);
    const [cvSection, setCVSection] = useState<CVSection | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const [fetchedProjects, fetchedStory, fetchedToolbox, fetchedJourney, fetchedContact, fetchedCV] = await Promise.all([
                api.getProjects(),
                api.getMyStory(),
                api.getMagicToolbox(),
                api.getMyJourney(),
                api.getContactSection(),
                api.getCVSection()
            ]);
            setProjects(fetchedProjects);
            setFilteredProjects(fetchedProjects);
            setMyStory(fetchedStory);
            setMagicToolbox(fetchedToolbox);
            setMyJourney(fetchedJourney);
            setContactSection(fetchedContact);
            setCVSection(fetchedCV);
        };
        fetchData();
    }, []);

    // Sort and filter projects
    useEffect(() => {
        let result = [...projects];

        // Filter by tag
        if (filterTag !== 'all') {
            result = result.filter(project => project.tags.includes(filterTag));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            // For date sorting, we'll use the order they come from API
            // (API should return them ordered by created_at)
            return 0;
        });

        if (sortBy === 'oldest') {
            result.reverse();
        }

        setFilteredProjects(result);
    }, [projects, sortBy, filterTag]);

    // Get all unique tags from projects
    const allTags = Array.from(new Set(projects.flatMap(p => p.tags)));

    const handleThemeToggle = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <>
            <Header navigateTo={navigateTo} isTransparent={true} />
            
            <div className="fixed top-4 right-4 z-50">
                <button onClick={handleThemeToggle} className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 dark:bg-gray-700 dark:text-yellow-300 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                    <i className="fas fa-moon text-xl hidden dark:inline"></i>
                    <i className="fas fa-sun text-xl dark:hidden"></i>
                </button>
            </div>

            {/* Hero Section */}
            <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16 bg-gradient-to-b from-blue-200 to-blue-100 dark:from-gray-800 dark:to-gray-900">
                <div className="absolute top-20 right-20 hidden md:block"><SootSprite /></div>
                <div className="absolute bottom-10 left-10 hidden md:block"><SootSprite style={{ animationDelay: '1s' }}/></div>
                <div className="max-w-4xl mx-auto text-center px-4 z-10">
                    <h1 className="ghibli-font text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100">
                        Crafting Products <br />That Spark <span className="text-yellow-400">Joy & Magic</span>
                    </h1>
                    <p className="text-xl md:text-2xl my-8 text-gray-700 dark:text-gray-300">
                        A Product Manager's journey through enchanted user experiences and data-driven storytelling
                    </p>
                    <a href="#about" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105">
                        Begin the Journey <i className="fas fa-arrow-down ml-2"></i>
                    </a>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent"></div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto px-4">
                    {myStory ? (
                        <>
                            <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">{myStory.title}</span>
                            </h2>
                            <div className="flex flex-col md:flex-row items-center gap-12">
                                <div className="md:w-1/2">
                                    <img 
                                        src={myStory.imageUrl} 
                                        alt={myStory.imageAlt} 
                                        className="rounded-2xl shadow-xl border-4 border-white dark:border-gray-700 w-full max-w-md mx-auto" 
                                    />
                                </div>
                                <div className="md:w-1/2">
                                    <h3 className="ghibli-font text-3xl mb-6 text-gray-800 dark:text-gray-200">
                                        {myStory.subtitle}
                                    </h3>
                                    <div className="text-gray-600 space-y-4 dark:text-gray-400">
                                        {myStory.paragraphs.map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading story...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Magic Toolbox Section */}
            <section id="toolbox" className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-4">
                    {magicToolbox ? (
                        <>
                            <h2 className="ghibli-font text-4xl text-center mb-4 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">{magicToolbox.title}</span>
                            </h2>
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">
                                {magicToolbox.subtitle}
                            </p>

                            {/* Skill Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                {magicToolbox.categories.map((category) => (
                                    <div key={category.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div 
                                                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl overflow-hidden"
                                                style={{ 
                                                    backgroundColor: category.iconUrl ? 'transparent' : `${category.color}20`,
                                                    border: category.iconUrl ? 'none' : `2px solid ${category.color}40`
                                                }}
                                            >
                                                {category.iconUrl ? (
                                                    <img 
                                                        src={category.iconUrl} 
                                                        alt={category.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{category.icon}</span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                                {category.title}
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {category.skills.map((skill) => (
                                                <div key={skill.id}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {skill.name}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {skill.level}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                                            style={{ 
                                                                width: `${skill.level}%`,
                                                                backgroundColor: category.color
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Enhanced Tools */}
                            <div className="text-center">
                                <h3 className="ghibli-font text-2xl mb-8 text-gray-800 dark:text-gray-200">
                                    Enhanced Tools I Wield
                                </h3>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {magicToolbox.tools.map((tool) => (
                                        <div 
                                            key={tool.id}
                                            className="px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                                            style={{
                                                backgroundColor: `${tool.color}20`,
                                                border: `2px solid ${tool.color}60`,
                                                color: tool.color
                                            }}
                                        >
                                            {tool.iconUrl ? (
                                                <img 
                                                    src={tool.iconUrl} 
                                                    alt={tool.name}
                                                    className="w-6 h-6 object-cover rounded"
                                                />
                                            ) : (
                                                <span className="text-lg">{tool.icon}</span>
                                            )}
                                            <span className="font-semibold">{tool.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading toolbox...</p>
                        </div>
                    )}
                </div>
            </section>

             {/* Projects Section */}
            <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="ghibli-font text-4xl text-center mb-8 text-blue-700 dark:text-blue-300">
                        <span className="border-b-4 border-yellow-400 pb-2">Magical Projects</span>
                    </h2>
                    
                    {/* Sort and Filter Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sort by:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">Title (A-Z)</option>
                            </select>
                        </div>

                        {/* Filter by Tag */}
                        {allTags.length > 0 && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Filter:
                                </label>
                                <select
                                    value={filterTag}
                                    onChange={(e) => setFilterTag(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Projects ({projects.length})</option>
                                    {allTags.map(tag => (
                                        <option key={tag} value={tag}>
                                            {tag} ({projects.filter(p => p.tags.includes(tag)).length})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Results Count */}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredProjects.length} of {projects.length} projects
                        </div>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map(project => <ProjectCard key={project.id} project={project} navigateTo={navigateTo} />)
                        ) : filterTag !== 'all' ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    No projects found with tag "{filterTag}"
                                </p>
                                <button
                                    onClick={() => setFilterTag('all')}
                                    className="mt-4 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    Clear filter
                                </button>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    No published case studies yet.
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                                    Create and publish case studies from the Admin page to showcase your work here.
                                </p>
                            </div>
                        ) : (
                            <p className="col-span-full text-center text-gray-600 dark:text-gray-400">Loading projects...</p>
                        )}
                    </div>
                </div>
            </section>

            {/* My Journey Section */}
            <section id="journey" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto px-4">
                    {myJourney ? (
                        <>
                            <h2 className="ghibli-font text-4xl text-center mb-4 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">{myJourney.title}</span>
                            </h2>
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">
                                {myJourney.subtitle}
                            </p>

                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-yellow-400"></div>
                                
                                <div className="space-y-12">
                                    {myJourney.items.map((item, index) => (
                                        <div key={item.id} className="relative flex items-start gap-8">
                                            {/* Timeline dot */}
                                            <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                                                item.isActive 
                                                    ? 'bg-yellow-400 text-gray-800' 
                                                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                            }`}>
                                                <span className="text-2xl">
                                                    {item.isActive ? '🏆' : '📍'}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                                        {item.title}
                                                    </h3>
                                                    {item.isActive && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                                                    {item.company}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading journey...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Carousel Section */}
            <section id="magical-scenery" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                        <span className="border-b-4 border-yellow-400 pb-2">Magical Journeys</span>
                    </h2>
                    <Carousel />
                </div>
            </section>

            {/* CV Section */}
            <section id="cv" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto px-4">
                    {cvSection ? (
                        <>
                            <h2 className="ghibli-font text-4xl text-center mb-4 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">{cvSection.title}</span>
                            </h2>
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-lg">
                                {cvSection.subtitle}
                            </p>
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-16">
                                {cvSection.description}
                            </p>

                            {/* CV Version Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {cvSection.versions.filter(version => version.isActive).map((version) => (
                                    <CVVersionCard key={version.id} version={version} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading CV information...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4">
                    {contactSection ? (
                        <>
                            <h2 className="ghibli-font text-4xl text-center mb-16 text-blue-700 dark:text-blue-300">
                                <span className="border-b-4 border-yellow-400 pb-2">{contactSection.title}</span>
                            </h2>

                            {/* Main Contact Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-3xl p-8 mb-8 shadow-2xl">
                                <h3 className="ghibli-font text-2xl mb-4">{contactSection.subtitle}</h3>
                                <div className="space-y-4 mb-6">
                                    {contactSection.description.split('\n').map((paragraph, index) => (
                                        <p key={index} className="text-lg leading-relaxed opacity-90">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>

                                {/* Contact Info */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            📧
                                        </div>
                                        <span className="font-medium">{contactSection.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            📍
                                        </div>
                                        <span className="font-medium">{contactSection.location}</span>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="flex gap-4">
                                    {contactSection.socialLinks.map((link) => (
                                        <a
                                            key={link.id}
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
                            </div>

                            {/* Resume Download Button */}
                            <div className="text-center">
                                <a
                                    href={contactSection.resumeUrl}
                                    download
                                    className="inline-flex items-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3" />
                                    </svg>
                                    {contactSection.resumeButtonText}
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading contact information...</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
};

// CV Version Card Component for Homepage Display
interface CVVersionCardProps {
    version: CVSection['versions'][0];
}

const CVVersionCard: React.FC<CVVersionCardProps> = ({ version }) => {
    const getVersionIcon = (type: string): string => {
        switch (type) {
            case 'indian': return '🇮🇳';
            case 'europass': return '🇪🇺';
            case 'global': return '🌍';
            default: return '📄';
        }
    };

    const getVersionColor = (type: string): string => {
        switch (type) {
            case 'indian': return 'from-orange-500 to-red-500';
            case 'europass': return 'from-blue-500 to-indigo-500';
            case 'global': return 'from-green-500 to-teal-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getDownloadUrl = (): string => {
        return version.fileUrl || version.googleDriveUrl || '#';
    };

    const isDownloadable = (): boolean => {
        return !!(version.fileUrl || version.googleDriveUrl);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            {/* Header with Icon and Title */}
            <div className="text-center mb-6">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getVersionColor(version.type)} flex items-center justify-center text-3xl shadow-lg`}>
                    {getVersionIcon(version.type)}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {version.name}
                </h3>
                <div className="flex justify-center">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                        isDownloadable()
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                        {isDownloadable() ? 'Available' : 'Coming Soon'}
                    </span>
                </div>
            </div>

            {/* File Info */}
            {version.fileUrl && version.fileName && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600 dark:text-blue-400">📎</span>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            File Available
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        {version.fileName}
                    </p>
                </div>
            )}

            {version.googleDriveUrl && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">🔗</span>
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            Google Drive Link
                        </span>
                    </div>
                </div>
            )}

            {/* Download Button */}
            <div className="text-center">
                {isDownloadable() ? (
                    <a
                        href={getDownloadUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${getVersionColor(version.type)} text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3" />
                        </svg>
                        Download CV
                    </a>
                ) : (
                    <button
                        disabled
                        className="inline-flex items-center gap-2 bg-gray-400 text-white font-semibold py-3 px-6 rounded-full shadow-lg cursor-not-allowed opacity-60"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Coming Soon
                    </button>
                )}
            </div>
        </div>
    );
};

export default HomePage;
