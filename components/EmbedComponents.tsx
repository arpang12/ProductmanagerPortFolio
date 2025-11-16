import React, { useState, useEffect, useRef } from 'react';
import './EmbedStyles.css';

interface EmbedFrameProps {
    src: string;
    title: string;
    className?: string;
    allowFullScreen?: boolean;
    frameBorder?: string | number;
    scrolling?: string;
}

export const EmbedFrame: React.FC<EmbedFrameProps> = ({ 
    src, 
    title, 
    className = "", 
    allowFullScreen = true,
    frameBorder = "0",
    scrolling = "no"
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Stop observing once visible
                }
            },
            {
                rootMargin: '100px', // Start loading 100px before element is visible
                threshold: 0.1
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div ref={containerRef} className={`embed-container ${className}`}>
            {!isVisible ? (
                <div className="embed-loading">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="block">Scroll to load {title}</span>
                    </div>
                </div>
            ) : (
                <>
                    {(isLoading || hasError) && (
                        <div className={`absolute inset-0 flex items-center justify-center z-10 ${hasError ? 'embed-error' : 'embed-loading'}`}>
                            {isLoading && (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    <span className="ml-2">Loading {title}...</span>
                                </div>
                            )}
                            {hasError && (
                                <span>Failed to load {title}</span>
                            )}
                        </div>
                    )}
                    <iframe
                        src={src}
                        title={title}
                        className="w-full h-full"
                        allowFullScreen={allowFullScreen}
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                </>
            )}
        </div>
    );
};

interface YouTubeEmbedProps {
    url: string;
    caption?: string;
    className?: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ url, caption, className = "" }) => {
    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return '';
        let videoId = '';
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.hostname.includes('youtube.com')) {
                videoId = urlObj.searchParams.get('v') || '';
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : '';
        } catch (error) {
            return '';
        }
    };

    const embedUrl = getYouTubeEmbedUrl(url);

    if (!embedUrl) {
        return (
            <div className="embed-error">
                <span>Invalid YouTube URL</span>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="aspect-w-16" style={{ paddingBottom: '75%', minHeight: '600px' }}>
                <EmbedFrame
                    src={embedUrl}
                    title="YouTube video player"
                    className="sketch-border"
                />
            </div>
            {caption && (
                <p className="text-center mt-4 text-gray-600 dark:text-gray-400 italic">
                    {caption}
                </p>
            )}
        </div>
    );
};

interface FigmaEmbedProps {
    url: string;
    caption?: string;
    className?: string;
}

export const FigmaEmbed: React.FC<FigmaEmbedProps> = ({ url, caption, className = "" }) => {
    const convertFigmaUrl = (inputUrl: string): string => {
        // If it's already an embed URL, return as is
        if (inputUrl.includes('figma.com/embed')) {
            return inputUrl;
        }
        
        // Convert regular Figma file URL to embed URL
        if (inputUrl.includes('figma.com/file/') || inputUrl.includes('figma.com/design/') || inputUrl.includes('figma.com/proto/')) {
            const encodedUrl = encodeURIComponent(inputUrl);
            return `https://www.figma.com/embed?embed_host=share&url=${encodedUrl}`;
        }
        
        return inputUrl; // Return original if we can't convert
    };

    if (!url || (!url.includes('figma.com/embed') && !url.includes('figma.com/file/') && !url.includes('figma.com/design/') && !url.includes('figma.com/proto/'))) {
        return (
            <div className="embed-error">
                <span>Please use a valid Figma URL</span>
            </div>
        );
    }

    const embedUrl = convertFigmaUrl(url);

    return (
        <div className={className}>
            <div className="aspect-w-16" style={{ paddingBottom: '75%', minHeight: '600px' }}>
                <EmbedFrame
                    src={embedUrl}
                    title="Figma prototype"
                    className="sketch-border"
                />
            </div>
            {caption && (
                <p className="text-center mt-4 text-gray-600 dark:text-gray-400 italic">
                    {caption}
                </p>
            )}
        </div>
    );
};

interface MiroEmbedProps {
    url: string;
    caption?: string;
    className?: string;
}

export const MiroEmbed: React.FC<MiroEmbedProps> = ({ url, caption, className = "" }) => {
    const convertMiroUrl = (inputUrl: string): string => {
        // If it's already a live embed URL, return as is
        if (inputUrl.includes('miro.com/app/live-embed')) {
            return inputUrl;
        }
        
        // Convert regular Miro board URL to live embed URL
        if (inputUrl.includes('miro.com/app/board/')) {
            // Extract board ID from URL like: https://miro.com/app/board/uXjVOcKGjZo=/
            const boardIdMatch = inputUrl.match(/\/board\/([^\/\?]+)/);
            if (boardIdMatch) {
                const boardId = boardIdMatch[1];
                return `https://miro.com/app/live-embed/${boardId}/?moveToViewport=-1000,-1000,2000,2000`;
            }
        }
        
        return inputUrl; // Return original if we can't convert
    };

    if (!url || (!url.includes('miro.com/app/live-embed') && !url.includes('miro.com/app/board/'))) {
        return (
            <div className="embed-error">
                <span>Please use a valid Miro URL</span>
            </div>
        );
    }

    const embedUrl = convertMiroUrl(url);

    return (
        <div className={className}>
            <div className="aspect-w-16" style={{ paddingBottom: '75%', minHeight: '600px' }}>
                <EmbedFrame
                    src={embedUrl}
                    title="Miro board"
                    className="sketch-border"
                    scrolling="no"
                />
            </div>
            {caption && (
                <p className="text-center mt-4 text-gray-600 dark:text-gray-400 italic">
                    {caption}
                </p>
            )}
        </div>
    );
};