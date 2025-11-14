import React, { useState, useEffect, useRef } from 'react';
import { MyStorySection } from '../types';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
import AIEnhancementModal from './AIEnhancementModal';

interface MyStoryManagerProps {
    onClose: () => void;
}

const MyStoryManager: React.FC<MyStoryManagerProps> = ({ onClose }) => {
    const [storyData, setStoryData] = useState<MyStorySection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiModalField, setAIModalField] = useState<{ type: 'subtitle' | 'paragraph'; index?: number } | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        fetchStoryData();
    }, []);

    const fetchStoryData = async () => {
        setIsLoading(true);
        try {
            const story = await api.getMyStory();
            setStoryData(story);
        } catch (error) {
            console.error('Failed to fetch story data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !storyData) return;
        
        const file = files[0];
        setIsUploadingImage(true);
        
        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Auto-scale and optimize image
            const optimizedImageUrl = await processAndUploadImage(file);
            
            setStoryData(prev => prev ? {
                ...prev,
                imageUrl: optimizedImageUrl
            } : null);
            
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const processAndUploadImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            
            if (!canvas || !ctx) {
                reject(new Error('Canvas not available'));
                return;
            }

            const img = new Image();
            img.onload = async () => {
                // Calculate optimal dimensions (max 800px width, maintain aspect ratio)
                const maxWidth = 800;
                const maxHeight = 1000;
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob with compression
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        try {
                            // Create a File object from blob for upload
                            const optimizedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            
                            const uploadResult = await api.uploadImage(optimizedFile);
                            resolve(uploadResult.url);
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error('Failed to process image'));
                    }
                }, 'image/jpeg', 0.85); // 85% quality
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    };

    const handleFieldChange = (field: keyof MyStorySection, value: string | string[]) => {
        if (!storyData) return;
        setStoryData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleParagraphChange = (index: number, value: string) => {
        if (!storyData) return;
        const newParagraphs = [...storyData.paragraphs];
        newParagraphs[index] = value;
        setStoryData(prev => prev ? { ...prev, paragraphs: newParagraphs } : null);
    };

    const addParagraph = () => {
        if (!storyData) return;
        setStoryData(prev => prev ? {
            ...prev,
            paragraphs: [...prev.paragraphs, 'New paragraph...']
        } : null);
    };

    const removeParagraph = (index: number) => {
        if (!storyData || storyData.paragraphs.length <= 1) return;
        const newParagraphs = storyData.paragraphs.filter((_, i) => i !== index);
        setStoryData(prev => prev ? { ...prev, paragraphs: newParagraphs } : null);
    };

    const enhanceWithAI = (field: 'subtitle' | 'paragraph', index?: number) => {
        if (!storyData) return;
        
        setAIModalField({ type: field, index });
        setShowAIModal(true);
    };

    const handleAIApply = (enhancedText: string) => {
        if (!aiModalField) return;

        if (aiModalField.type === 'subtitle') {
            handleFieldChange('subtitle', enhancedText);
        } else if (aiModalField.type === 'paragraph' && typeof aiModalField.index === 'number') {
            handleParagraphChange(aiModalField.index, enhancedText);
        }

        setShowAIModal(false);
        setAIModalField(null);
    };

    const getAIModalText = (): string => {
        if (!storyData || !aiModalField) return '';
        
        if (aiModalField.type === 'subtitle') {
            return storyData.subtitle;
        } else if (aiModalField.type === 'paragraph' && typeof aiModalField.index === 'number') {
            return storyData.paragraphs[aiModalField.index];
        }
        
        return '';
    };

    const handleSave = async () => {
        if (!storyData) return;
        
        setIsSaving(true);
        try {
            await api.updateMyStory(storyData);
            alert('Story updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to save story:', error);
            alert('Failed to save story. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span>Loading story data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!storyData) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
                    <p className="text-red-500">Failed to load story data</p>
                    <button onClick={onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold ghibli-font text-gray-800 dark:text-gray-200">
                        📖 Edit My Story Section
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Form */}
                        <div className="space-y-6">
                            {/* Section Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={storyData.title}
                                    onChange={e => handleFieldChange('title', e.target.value)}
                                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subtitle
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={storyData.subtitle}
                                        onChange={e => handleFieldChange('subtitle', e.target.value)}
                                        className="w-full p-3 pr-12 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <button
                                        onClick={() => enhanceWithAI('subtitle')}
                                        disabled={isGeneratingContent}
                                        className="absolute right-2 top-2 text-purple-500 hover:text-purple-700 p-1"
                                        title="Enhance with AI"
                                    >
                                        {isGeneratingContent ? '⏳' : '🪄'}
                                    </button>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Profile Image
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={e => handleImageUpload(e.target.files)}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingImage}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isUploadingImage ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Processing & Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Upload New Image
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        Images are automatically scaled and optimized for web. Recommended: Portrait orientation, max 2MB.
                                    </p>
                                </div>
                            </div>

                            {/* Image Alt Text */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Image Alt Text (for accessibility)
                                </label>
                                <input
                                    type="text"
                                    value={storyData.imageAlt}
                                    onChange={e => handleFieldChange('imageAlt', e.target.value)}
                                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Describe the image for screen readers"
                                />
                            </div>

                            {/* Paragraphs */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Story Paragraphs
                                    </label>
                                    <button
                                        onClick={addParagraph}
                                        className="text-green-500 hover:text-green-700 text-sm font-medium"
                                    >
                                        + Add Paragraph
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {storyData.paragraphs.map((paragraph, index) => (
                                        <div key={index} className="relative">
                                            <div className="flex items-start gap-2">
                                                <span className="text-sm text-gray-500 mt-3 min-w-[20px]">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex-1 relative">
                                                    <textarea
                                                        value={paragraph}
                                                        onChange={e => handleParagraphChange(index, e.target.value)}
                                                        rows={4}
                                                        className="w-full p-3 pr-20 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none"
                                                    />
                                                    <div className="absolute right-2 top-2 flex gap-1">
                                                        <button
                                                            onClick={() => enhanceWithAI('paragraph', index)}
                                                            disabled={isGeneratingContent}
                                                            className="text-purple-500 hover:text-purple-700 p-1"
                                                            title="Enhance with AI"
                                                        >
                                                            {isGeneratingContent ? '⏳' : '🪄'}
                                                        </button>
                                                        {storyData.paragraphs.length > 1 && (
                                                            <button
                                                                onClick={() => removeParagraph(index)}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                                title="Remove paragraph"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Preview */}
                        <div className="lg:sticky lg:top-0">
                            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
                                Live Preview
                            </h3>
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border">
                                <div className="max-w-2xl mx-auto">
                                    <h2 className="ghibli-font text-3xl text-center mb-8 text-blue-700 dark:text-blue-300">
                                        <span className="border-b-4 border-yellow-400 pb-2">{storyData.title}</span>
                                    </h2>
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="md:w-1/2">
                                            <img 
                                                src={previewImage || storyData.imageUrl} 
                                                alt={storyData.imageAlt}
                                                className="rounded-2xl shadow-xl border-4 border-white dark:border-gray-700 w-full max-w-sm mx-auto" 
                                            />
                                        </div>
                                        <div className="md:w-1/2">
                                            <h3 className="ghibli-font text-2xl mb-4 text-gray-800 dark:text-gray-200">
                                                {storyData.subtitle}
                                            </h3>
                                            <div className="text-gray-600 space-y-3 dark:text-gray-400 text-sm">
                                                {storyData.paragraphs.map((paragraph, index) => (
                                                    <p key={index}>{paragraph}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* AI Enhancement Modal */}
            <AIEnhancementModal
                isOpen={showAIModal}
                onClose={() => {
                    setShowAIModal(false);
                    setAIModalField(null);
                }}
                onApply={handleAIApply}
                originalText={getAIModalText()}
                sectionType={aiModalField?.type === 'subtitle' ? 'subtitle' : 'paragraph'}
            />
        </div>
    );
};

export default MyStoryManager;