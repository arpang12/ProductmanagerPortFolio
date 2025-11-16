import React, { useState } from 'react';
import { Document } from '../types';
import { detectDocumentType, getDocumentIcon, getDocumentColor, getDocumentTypeName, extractFilename } from '../utils/documentHelpers';

interface DocumentManagerProps {
    documents: Document[];
    onChange: (documents: Document[]) => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, onChange }) => {
    const [newDocUrl, setNewDocUrl] = useState('');
    const [newDocName, setNewDocName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddDocument = () => {
        if (!newDocUrl.trim()) {
            alert('Please enter a document URL');
            return;
        }

        const docType = detectDocumentType(newDocUrl);
        const docName = newDocName.trim() || extractFilename(newDocUrl);

        const newDoc: Document = {
            id: Date.now().toString(),
            name: docName,
            url: newDocUrl.trim(),
            type: docType,
            uploadedAt: new Date().toISOString()
        };

        onChange([...documents, newDoc]);
        setNewDocUrl('');
        setNewDocName('');
        setIsAdding(false);
    };

    const handleRemoveDocument = (id: string) => {
        onChange(documents.filter(doc => doc.id !== id));
    };

    const handleUpdateDocument = (id: string, updates: Partial<Document>) => {
        onChange(documents.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documents ({documents.length})
                </label>
                <button
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                >
                    {isAdding ? 'Cancel' : '+ Add Document'}
                </button>
            </div>

            {/* Add Document Form */}
            {isAdding && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Document Name
                        </label>
                        <input
                            type="text"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            placeholder="e.g., Project Requirements, User Research"
                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Document URL
                        </label>
                        <input
                            type="url"
                            value={newDocUrl}
                            onChange={(e) => setNewDocUrl(e.target.value)}
                            placeholder="https://... (PDF, DOC, PPT, XLS, Google Docs, etc.)"
                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Supports: PDF, Word, PowerPoint, Excel, Google Docs, and more
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddDocument}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                        Add Document
                    </button>
                </div>
            )}

            {/* Documents List */}
            {documents.length > 0 ? (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                {/* Document Icon */}
                                <div className={`w-14 h-14 bg-gradient-to-br ${getDocumentColor(doc.type)} rounded-lg flex items-center justify-center text-2xl flex-shrink-0 mt-1`}>
                                    {getDocumentIcon(doc.type)}
                                </div>

                                {/* Document Info */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={doc.name}
                                            onChange={(e) => handleUpdateDocument(doc.id, { name: e.target.value })}
                                            className="flex-1 font-semibold text-base text-gray-800 dark:text-gray-200 bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none transition-colors px-1 -ml-1"
                                            placeholder="Document name"
                                        />
                                        {/* Actions - moved next to title */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                title="Preview document"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDocument(doc.id)}
                                                className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Remove document"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                                        {getDocumentTypeName(doc.type)}
                                    </p>
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline break-all"
                                        title={doc.url}
                                    >
                                        {doc.url}
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No documents added yet</p>
                    <p className="text-xs mt-1">Click "Add Document" to get started</p>
                </div>
            )}
        </div>
    );
};

export default DocumentManager;
