import React from 'react';
import { CaseStudy, View } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { YouTubeEmbed, FigmaEmbed, MiroEmbed } from '../components/EmbedComponents';

interface CaseStudyPageProps {
    caseStudy: CaseStudy;
    navigateTo: (view: View) => void;
}

const GhibliStyledPage: React.FC<{ htmlContent: string; navigateTo: (view: View) => void }> = ({ htmlContent, navigateTo }) => {
     // This component is a wrapper that can inject the Ghibli styles
     // if they are not globally available. For now, we assume global styles.
    return (
        <>
            {/* Fixed Back Button - Always Visible */}
            <button
                onClick={() => navigateTo('home')}
                className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all group border border-gray-200 dark:border-gray-700"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back</span>
            </button>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </>
    );
};

const DefaultStyledPage: React.FC<{ caseStudy: CaseStudy, navigateTo: (view: View) => void; }> = ({ caseStudy, navigateTo }) => {
    const { sections } = caseStudy;
    const [lightboxImage, setLightboxImage] = React.useState<string | null>(null);
    const [lightboxIndex, setLightboxIndex] = React.useState<number>(0);
    
    const openLightbox = (image: string, index: number) => {
        setLightboxImage(image);
        setLightboxIndex(index);
    };
    
    const closeLightbox = () => {
        setLightboxImage(null);
    };
    
    const nextImage = () => {
        if (sections.gallery?.images) {
            const nextIndex = (lightboxIndex + 1) % sections.gallery.images.length;
            setLightboxIndex(nextIndex);
            setLightboxImage(sections.gallery.images[nextIndex]);
        }
    };
    
    const prevImage = () => {
        if (sections.gallery?.images) {
            const prevIndex = (lightboxIndex - 1 + sections.gallery.images.length) % sections.gallery.images.length;
            setLightboxIndex(prevIndex);
            setLightboxImage(sections.gallery.images[prevIndex]);
        }
    };
    
    // Keyboard navigation for lightbox
    React.useEffect(() => {
        if (!lightboxImage) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxImage, lightboxIndex]);
    
    return (
         <>
            <Header navigateTo={navigateTo} />
            
            {/* Lightbox Modal */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    {/* Previous button */}
                    {sections.gallery && sections.gallery.images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
                            aria-label="Previous image"
                        >
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    
                    {/* Image */}
                    <img 
                        src={lightboxImage} 
                        alt={`Gallery image ${lightboxIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Next button */}
                    {sections.gallery && sections.gallery.images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
                            aria-label="Next image"
                        >
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                    
                    {/* Image counter */}
                    {sections.gallery && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg bg-black bg-opacity-60 px-4 py-2 rounded-full">
                            {lightboxIndex + 1} / {sections.gallery.images.length}
                        </div>
                    )}
                </div>
            )}
            
            {/* Fixed Back Button - Always Visible */}
            <button
                onClick={() => navigateTo('home')}
                className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all group border border-gray-200 dark:border-gray-700"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back</span>
            </button>
            
            <main className="pt-20">
                {/* Hero Section */}
                {sections.hero?.enabled && (
                    <section 
                        className="h-[60vh] bg-cover bg-center flex items-end p-8 text-white relative"
                        style={{ backgroundImage: `url(https://picsum.photos/seed/${caseStudy.id}-hero/1200/800)` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="max-w-6xl mx-auto px-4 z-10">
                            <h1 className="ghibli-font text-4xl md:text-6xl font-bold">{sections.hero.headline}</h1>
                             <p className="mt-4 text-xl max-w-3xl">{sections.hero.subheading}</p>
                        </div>
                    </section>
                )}

                <div className="bg-white dark:bg-gray-800">
                    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">

                        {/* Overview */}
                        {sections.overview?.enabled && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <h2 className="ghibli-font text-3xl mb-4 text-blue-700 dark:text-blue-300">{sections.overview.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-400">{sections.overview.summary}</p>
                                </div>
                                <div>
                                    <h2 className="ghibli-font text-3xl mb-4 text-yellow-500 dark:text-yellow-400">Key Outcomes</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        {sections.overview.metrics.split('\n').map(metric => {
                                            const [key, value] = metric.split(':');
                                            return (
                                                <div key={key} className="bg-yellow-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                                    <div className="font-bold text-gray-700 dark:text-gray-300">{key}</div>
                                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{value}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Problem */}
                        {sections.problem?.enabled && (
                             <div>
                                <h2 className="ghibli-font text-3xl mb-4 text-center text-blue-700 dark:text-blue-300">{sections.problem.title}</h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center">{sections.problem.description}</p>
                            </div>
                        )}
                        
                        {/* Process */}
                        {sections.process?.enabled && (
                             <div>
                                <h2 className="ghibli-font text-3xl mb-8 text-center text-blue-700 dark:text-blue-300">{sections.process.title}</h2>
                                <div className="relative">
                                    <div className="border-l-4 border-blue-200 dark:border-gray-700 absolute h-full top-0 left-4"></div>
                                    {sections.process.steps.split('\n').map((step, index) => (
                                        <div key={index} className="mb-8 flex items-center w-full">
                                            <div className="z-10 bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">{index + 1}</div>
                                            <div className="ml-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm w-full">
                                                <p className="text-gray-700 dark:text-gray-300">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Showcase & Results */}
                         {sections.showcase?.enabled && (
                             <div className="text-center p-8 bg-blue-50 dark:bg-gray-900 rounded-2xl shadow-inner">
                                <h2 className="ghibli-font text-3xl mb-4 text-blue-700 dark:text-blue-300">{sections.showcase.title}</h2>
                                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{sections.showcase.description}</p>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {sections.showcase.features.split('\n').map(tech => (
                                        <span key={tech} className="bg-blue-100 text-blue-800 font-semibold px-4 py-2 rounded-full dark:bg-blue-900 dark:text-blue-300">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery */}
                        {sections.gallery?.enabled && sections.gallery.images.length > 0 && (
                            <div>
                                <h2 className="ghibli-font text-3xl mb-8 text-center text-blue-700 dark:text-blue-300">Image Gallery</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sections.gallery.images.map((img, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => openLightbox(img, index)}
                                            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gray-100 dark:bg-gray-800 cursor-pointer"
                                            style={{ aspectRatio: '4/3' }}
                                        >
                                            <img 
                                                src={img} 
                                                alt={`Gallery image ${index + 1}`} 
                                                loading="lazy"
                                                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                                style={{
                                                    imageRendering: 'auto',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center'
                                                }}
                                            />
                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {/* Image number badge */}
                                            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                                                {index + 1} / {sections.gallery.images.length}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Video */}
                        {sections.video?.enabled && sections.video.url && (
                             <div className="-mx-4 md:mx-0">
                                <h2 className="ghibli-font text-3xl mb-6 text-center text-blue-700 dark:text-blue-300 px-4 md:px-0">Demo Video</h2>
                                <div className="max-w-5xl mx-auto">
                                    <YouTubeEmbed 
                                        url={sections.video.url}
                                        caption={sections.video.caption}
                                    />
                                </div>
                            </div>
                        )}
                        
                         {/* Figma */}
                        {sections.figma?.enabled && sections.figma.url && (
                             <div className="-mx-4 md:mx-0">
                                <h2 className="ghibli-font text-3xl mb-6 text-center text-blue-700 dark:text-blue-300 px-4 md:px-0">Figma Prototype</h2>
                                <div className="max-w-5xl mx-auto">
                                    <FigmaEmbed 
                                        url={sections.figma.url}
                                        caption={sections.figma.caption}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Miro */}
                        {sections.miro?.enabled && sections.miro.url && (
                            <div className="-mx-4 md:mx-0">
                                <h2 className="ghibli-font text-3xl mb-6 text-center text-blue-700 dark:text-blue-300 px-4 md:px-0">Miro Board</h2>
                                <div className="max-w-5xl mx-auto">
                                    <MiroEmbed 
                                        url={sections.miro.url}
                                        caption={sections.miro.caption}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Reflection */}
                        {sections.reflection?.enabled && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-lg">
                                <h2 className="ghibli-font text-3xl mb-6 text-center text-purple-700 dark:text-purple-300">{sections.reflection.title}</h2>
                                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{sections.reflection.content}</p>
                                {sections.reflection.learnings && sections.reflection.learnings.trim() && (
                                    <div className="mt-6">
                                        <h3 className="text-xl font-semibold mb-4 text-purple-600 dark:text-purple-400">Key Learnings:</h3>
                                        <ul className="space-y-3">
                                            {sections.reflection.learnings.split('\n').filter(l => l.trim()).map((learning, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-purple-500 mr-3 text-xl">✨</span>
                                                    <span className="text-gray-700 dark:text-gray-300">{learning}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Document */}
                        {sections.document?.enabled && (sections.document.documents?.length > 0 || sections.document.url) && (
                            <div>
                                <h2 className="ghibli-font text-3xl mb-8 text-center text-blue-700 dark:text-blue-300">Project Documentation</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* New: Multiple documents */}
                                    {sections.document.documents?.map((doc) => {
                                        const getDocIcon = (type: string) => {
                                            switch (type) {
                                                case 'pdf': return '📕';
                                                case 'doc': case 'docx': return '📘';
                                                case 'ppt': case 'pptx': return '📊';
                                                case 'xls': case 'xlsx': return '📗';
                                                case 'txt': return '📄';
                                                default: return '📎';
                                            }
                                        };
                                        const getDocColor = (type: string) => {
                                            switch (type) {
                                                case 'pdf': return 'from-red-500 to-red-600';
                                                case 'doc': case 'docx': return 'from-blue-500 to-blue-600';
                                                case 'ppt': case 'pptx': return 'from-orange-500 to-orange-600';
                                                case 'xls': case 'xlsx': return 'from-green-500 to-green-600';
                                                case 'txt': return 'from-gray-500 to-gray-600';
                                                default: return 'from-purple-500 to-purple-600';
                                            }
                                        };
                                        return (
                                            <a
                                                key={doc.id}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                                            >
                                                <div className={`w-14 h-14 bg-gradient-to-br ${getDocColor(doc.type)} rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    {getDocIcon(doc.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                        {doc.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                        {doc.type === 'doc' || doc.type === 'docx' ? 'Word Document' :
                                                         doc.type === 'ppt' || doc.type === 'pptx' ? 'PowerPoint' :
                                                         doc.type === 'xls' || doc.type === 'xlsx' ? 'Excel' :
                                                         doc.type === 'pdf' ? 'PDF Document' :
                                                         doc.type === 'txt' ? 'Text File' : 'Document'}
                                                    </p>
                                                </div>
                                                <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        );
                                    })}
                                    {/* Backward compatibility: single URL */}
                                    {sections.document.url && !sections.document.documents?.length && (
                                        <a 
                                            href={sections.document.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                                        >
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                                📄
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    View Document
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Project Documentation
                                                </p>
                                            </div>
                                            <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        {sections.links?.enabled && sections.links.items && sections.links.items.trim() && (
                            <div>
                                <h2 className="ghibli-font text-3xl mb-8 text-center text-blue-700 dark:text-blue-300">{sections.links.title || 'Related Links'}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sections.links.items.split('\n').filter(item => item.trim() && item.includes('|')).map((item, index) => {
                                        const [name, url] = item.split('|').map(s => s.trim());
                                        return (
                                            <a 
                                                key={index}
                                                href={url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-blue-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 group"
                                            >
                                                <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{name}</span>
                                                <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="text-center mt-8">
                            <button onClick={() => navigateTo('home')} className="text-blue-600 dark:text-blue-400 hover:underline">
                                &larr; Back to All Projects
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </>
    );
};

const ModernStyledPage: React.FC<{ htmlContent: string; navigateTo: (view: View) => void }> = ({ htmlContent, navigateTo }) => {
    // This component renders the modern template HTML content
    return (
        <>
            {/* Fixed Back Button - Always Visible */}
            <button
                onClick={() => navigateTo('home')}
                className="fixed top-24 left-4 z-50 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all group border border-gray-200 dark:border-gray-700"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back</span>
            </button>
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </>
    );
};

const CaseStudyPage: React.FC<CaseStudyPageProps> = ({ caseStudy, navigateTo }) => {
    // If template is 'ghibli' and static content exists, render it directly.
    if (caseStudy.template === 'ghibli' && caseStudy.content) {
        return <GhibliStyledPage htmlContent={caseStudy.content} navigateTo={navigateTo} />;
    }

    // If template is 'modern' and static content exists, render it directly.
    if (caseStudy.template === 'modern' && caseStudy.content) {
        return <ModernStyledPage htmlContent={caseStudy.content} navigateTo={navigateTo} />;
    }

    // Otherwise, use the default dynamic React rendering.
    return <DefaultStyledPage caseStudy={caseStudy} navigateTo={navigateTo} />;
};


export default CaseStudyPage;