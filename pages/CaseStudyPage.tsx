import React from 'react';
import { CaseStudy, View } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { YouTubeEmbed, FigmaEmbed, MiroEmbed } from '../components/EmbedComponents';

interface CaseStudyPageProps {
    caseStudy: CaseStudy;
    navigateTo: (view: View) => void;
}

const GhibliStyledPage: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
     // This component is a wrapper that can inject the Ghibli styles
     // if they are not globally available. For now, we assume global styles.
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const DefaultStyledPage: React.FC<{ caseStudy: CaseStudy, navigateTo: (view: View) => void; }> = ({ caseStudy, navigateTo }) => {
    const { sections } = caseStudy;
    
    return (
         <>
            <Header navigateTo={navigateTo} />
            
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
                    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">

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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sections.gallery.images.map((img, index) => (
                                        <div key={index} className="overflow-hidden rounded-lg shadow-md aspect-w-4 aspect-h-3">
                                            <img src={img} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Video */}
                        {sections.video?.enabled && sections.video.url && (
                             <div>
                                <h2 className="ghibli-font text-3xl mb-8 text-center text-blue-700 dark:text-blue-300">Demo Video</h2>
                                <YouTubeEmbed 
                                    url={sections.video.url}
                                    caption={sections.video.caption}
                                />
                            </div>
                        )}
                        
                         {/* Figma */}
                        {sections.figma?.enabled && sections.figma.url && (
                             <div>
                                <h2 className="ghibli-font text-3xl mb-8 text-center text-blue-700 dark:text-blue-300">Figma Prototype</h2>
                                <FigmaEmbed 
                                    url={sections.figma.url}
                                    caption={sections.figma.caption}
                                />
                            </div>
                        )}

                        {/* Miro */}
                        {sections.miro?.enabled && sections.miro.url && (
                            <div>
                                <h2 className="ghibli-font text-3xl mb-8 text-center text-blue-700 dark:text-blue-300">Miro Board</h2>
                                <MiroEmbed 
                                    url={sections.miro.url}
                                    caption={sections.miro.caption}
                                />
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

const ModernStyledPage: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
    // This component renders the modern template HTML content
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const CaseStudyPage: React.FC<CaseStudyPageProps> = ({ caseStudy, navigateTo }) => {
    // If template is 'ghibli' and static content exists, render it directly.
    if (caseStudy.template === 'ghibli' && caseStudy.content) {
        return <GhibliStyledPage htmlContent={caseStudy.content} />;
    }

    // If template is 'modern' and static content exists, render it directly.
    if (caseStudy.template === 'modern' && caseStudy.content) {
        return <ModernStyledPage htmlContent={caseStudy.content} />;
    }

    // Otherwise, use the default dynamic React rendering.
    return <DefaultStyledPage caseStudy={caseStudy} navigateTo={navigateTo} />;
};


export default CaseStudyPage;