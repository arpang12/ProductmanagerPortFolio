// Utility functions for URL conversion - can be used across components

export const convertFigmaUrl = (url: string): string => {
    // If it's already an embed URL, return as is
    if (url.includes('figma.com/embed')) {
        return url;
    }
    
    // Convert regular Figma file URL to embed URL
    if (url.includes('figma.com/file/') || url.includes('figma.com/design/') || url.includes('figma.com/proto/')) {
        const encodedUrl = encodeURIComponent(url);
        return `https://www.figma.com/embed?embed_host=share&url=${encodedUrl}`;
    }
    
    return url; // Return original if we can't convert
};

export const convertMiroUrl = (url: string): string => {
    // If it's already a live embed URL, return as is
    if (url.includes('miro.com/app/live-embed')) {
        return url;
    }
    
    // Convert regular Miro board URL to live embed URL
    if (url.includes('miro.com/app/board/')) {
        // Extract board ID from URL like: https://miro.com/app/board/uXjVOcKGjZo=/
        const boardIdMatch = url.match(/\/board\/([^\/\?]+)/);
        if (boardIdMatch) {
            const boardId = boardIdMatch[1];
            return `https://miro.com/app/live-embed/${boardId}/?moveToViewport=-1000,-1000,2000,2000`;
        }
    }
    
    return url; // Return original if we can't convert
};

export const isValidFigmaUrl = (url: string): boolean => {
    return url.includes('figma.com/embed') || 
           url.includes('figma.com/file/') || 
           url.includes('figma.com/design/') || 
           url.includes('figma.com/proto/');
};

export const isValidMiroUrl = (url: string): boolean => {
    return url.includes('miro.com/app/live-embed') || 
           url.includes('miro.com/app/board/');
};

export const isValidYouTubeUrl = (url: string): boolean => {
    return /youtube\.com|youtu\.be/.test(url);
};

// Test examples for documentation
export const urlExamples = {
    figma: {
        regular: 'https://www.figma.com/file/ABC123/My-Design-File',
        design: 'https://www.figma.com/design/ABC123/My-Design-File',
        prototype: 'https://www.figma.com/proto/ABC123/My-Design-File',
        embed: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FABC123%2FMy-Design-File'
    },
    miro: {
        regular: 'https://miro.com/app/board/uXjVOcKGjZo=/',
        embed: 'https://miro.com/app/live-embed/uXjVOcKGjZo=/?moveToViewport=-1000,-1000,2000,2000'
    },
    youtube: {
        watch: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        share: 'https://youtu.be/dQw4w9WgXcQ'
    }
};