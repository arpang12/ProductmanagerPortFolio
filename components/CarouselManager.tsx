import React, { useState, useEffect, useRef } from 'react';
import { CarouselImage } from '../types';
import { api } from '../services/api';

interface CarouselManagerProps {
    onClose: () => void;
}

interface DragItem {
    id: string;
    index: number;
}

const CarouselManager: React.FC<CarouselManagerProps> = ({ onClose }) => {
    const [images, setImages] = useState<CarouselImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const fetchedImages = await api.getCarouselImages();
            setImages(fetchedImages);
        } catch (error) {
            console.error('Failed to fetch carousel images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddImage = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                const uploadResult = await api.uploadImage(file);
                const newImage = await api.createCarouselImage({
                    src: uploadResult.url,
                    title: `New Image ${images.length + 1}`,
                    description: 'Add a description for this magical scene',
                    asset_id: uploadResult.asset_id
                });
                setImages(prev => [...prev, newImage]);
            }
        } catch (error) {
            console.error('Failed to add image:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            alert(`Failed to add image: ${error.message}. Check console for details.`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateImage = async (updatedImage: CarouselImage) => {
        setIsSaving(true);
        try {
            const updated = await api.updateCarouselImage(updatedImage.id, updatedImage);
            setImages(prev => prev.map(img => img.id === updated.id ? updated : img));
            setEditingImage(null);
        } catch (error) {
            console.error('Failed to update image:', error);
            alert('Failed to update image. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteImage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this carousel image?')) return;
        
        try {
            await api.deleteCarouselImage(id);
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image. Please try again.');
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string, index: number) => {
        setDraggedItem({ id, index });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        
        if (!draggedItem || draggedItem.index === dropIndex) {
            setDraggedItem(null);
            return;
        }

        const newImages = [...images];
        const draggedImage = newImages[draggedItem.index];
        
        // Remove dragged item
        newImages.splice(draggedItem.index, 1);
        
        // Insert at new position
        newImages.splice(dropIndex, 0, draggedImage);
        
        setImages(newImages);
        setDraggedItem(null);

        // Save new order to backend
        try {
            const imageIds = newImages.map(img => img.id);
            await api.reorderCarouselImages(imageIds);
        } catch (error) {
            console.error('Failed to reorder images:', error);
            // Revert on error
            fetchImages();
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span>Loading carousel images...</span>
                    </div>
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
                        🎠 Carousel Manager
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
                    {/* Add Image Button */}
                    <div className="mb-6">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={e => handleAddImage(e.target.files)}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Images
                                </>
                            )}
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                            Upload multiple images at once. Drag and drop to reorder.
                        </p>
                    </div>

                    {/* Images Grid */}
                    {images.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium">No carousel images yet</p>
                            <p>Add some magical images to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {images.map((image, index) => (
                                <div
                                    key={image.id}
                                    draggable
                                    onDragStart={e => handleDragStart(e, image.id, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={e => handleDrop(e, index)}
                                    className={`bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-move ${
                                        draggedItem?.id === image.id ? 'opacity-50 scale-95' : ''
                                    }`}
                                >
                                    {/* Image Preview */}
                                    <div className="relative aspect-w-16 aspect-h-9">
                                        <img
                                            src={image.src}
                                            alt={image.title}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                                            #{index + 1}
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button
                                                onClick={() => setEditingImage(image)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteImage(image.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                            {image.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {image.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingImage && (
                <EditImageModal
                    image={editingImage}
                    onSave={handleUpdateImage}
                    onCancel={() => setEditingImage(null)}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
};

// Edit Image Modal Component
interface EditImageModalProps {
    image: CarouselImage;
    onSave: (image: CarouselImage) => void;
    onCancel: () => void;
    isSaving: boolean;
}

const EditImageModal: React.FC<EditImageModalProps> = ({ image, onSave, onCancel, isSaving }) => {
    const [title, setTitle] = useState(image.title);
    const [description, setDescription] = useState(image.description);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...image,
            title: title.trim(),
            description: description.trim()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 ghibli-font">Edit Image Details</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CarouselManager;