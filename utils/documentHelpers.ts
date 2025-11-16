import { Document } from '../types';

/**
 * Detect document type from URL or filename
 */
export const detectDocumentType = (url: string): Document['type'] => {
    const urlLower = url.toLowerCase();
    
    if (urlLower.endsWith('.pdf') || urlLower.includes('.pdf?')) return 'pdf';
    if (urlLower.endsWith('.doc') || urlLower.includes('.doc?')) return 'doc';
    if (urlLower.endsWith('.docx') || urlLower.includes('.docx?')) return 'docx';
    if (urlLower.endsWith('.ppt') || urlLower.includes('.ppt?')) return 'ppt';
    if (urlLower.endsWith('.pptx') || urlLower.includes('.pptx?')) return 'pptx';
    if (urlLower.endsWith('.xls') || urlLower.includes('.xls?')) return 'xls';
    if (urlLower.endsWith('.xlsx') || urlLower.includes('.xlsx?')) return 'xlsx';
    if (urlLower.endsWith('.txt') || urlLower.includes('.txt?')) return 'txt';
    
    // Check for Google Drive document types
    if (urlLower.includes('docs.google.com/document')) return 'doc';
    if (urlLower.includes('docs.google.com/presentation')) return 'ppt';
    if (urlLower.includes('docs.google.com/spreadsheets')) return 'xls';
    
    return 'other';
};

/**
 * Get icon for document type
 */
export const getDocumentIcon = (type: Document['type']): string => {
    switch (type) {
        case 'pdf':
            return '📕';
        case 'doc':
        case 'docx':
            return '📘';
        case 'ppt':
        case 'pptx':
            return '📊';
        case 'xls':
        case 'xlsx':
            return '📗';
        case 'txt':
            return '📄';
        default:
            return '📎';
    }
};

/**
 * Get color for document type
 */
export const getDocumentColor = (type: Document['type']): string => {
    switch (type) {
        case 'pdf':
            return 'from-red-500 to-red-600';
        case 'doc':
        case 'docx':
            return 'from-blue-500 to-blue-600';
        case 'ppt':
        case 'pptx':
            return 'from-orange-500 to-orange-600';
        case 'xls':
        case 'xlsx':
            return 'from-green-500 to-green-600';
        case 'txt':
            return 'from-gray-500 to-gray-600';
        default:
            return 'from-purple-500 to-purple-600';
    }
};

/**
 * Get display name for document type
 */
export const getDocumentTypeName = (type: Document['type']): string => {
    switch (type) {
        case 'pdf':
            return 'PDF Document';
        case 'doc':
            return 'Word Document';
        case 'docx':
            return 'Word Document';
        case 'ppt':
            return 'PowerPoint';
        case 'pptx':
            return 'PowerPoint';
        case 'xls':
            return 'Excel Spreadsheet';
        case 'xlsx':
            return 'Excel Spreadsheet';
        case 'txt':
            return 'Text File';
        default:
            return 'Document';
    }
};

/**
 * Extract filename from URL
 */
export const extractFilename = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop() || 'document';
        return decodeURIComponent(filename);
    } catch {
        // If URL parsing fails, try simple extraction
        const parts = url.split('/');
        return parts[parts.length - 1] || 'document';
    }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
