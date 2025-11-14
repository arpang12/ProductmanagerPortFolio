import React, { useState, useEffect, useRef } from 'react';
import { ContactSection, SocialLink } from '../types';
import { api } from '../services/api';
import { ulid } from 'ulid';

interface ContactManagerProps {
    onClose: () => void;
}

const ContactManager: React.FC<ContactManagerProps> = ({ onClose }) => {
    const [contactData, setContactData] = useState<ContactSection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    const [editingLink, setEditingLink] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        setIsLoading(true);
        try {
            const contact = await api.getContactSection();
            setContactData(contact);
        } catch (error) {
            console.error('Failed to fetch contact data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!contactData) return;
        
        setIsSaving(true);
        try {
            await api.updateContactSection(contactData);
            alert('Contact section updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to save contact:', error);
            alert('Failed to save contact. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateBasicInfo = (field: keyof ContactSection, value: string) => {
        if (!contactData) return;
        setContactData({ ...contactData, [field]: value });
    };

    const handleResumeUpload = async (file: File) => {
        if (!contactData) return;

        setIsUploadingResume(true);
        try {
            const { url } = await api.uploadDocument(file);
            setContactData({ ...contactData, resumeUrl: url });
        } catch (error) {
            console.error('Failed to upload resume:', error);
            alert('Failed to upload resume. Please try again.');
        } finally {
            setIsUploadingResume(false);
        }
    };

    const addSocialLink = () => {
        if (!contactData) return;
        
        const newLink: SocialLink = {
            id: ulid(),
            name: 'New Platform',
            url: 'https://example.com',
            icon: '🔗',
            color: 'blue'
        };
        
        setContactData({
            ...contactData,
            socialLinks: [...contactData.socialLinks, newLink]
        });
        setEditingLink(newLink.id);
    };

    const updateSocialLink = (linkId: string, updates: Partial<SocialLink>) => {
        if (!contactData) return;
        
        setContactData({
            ...contactData,
            socialLinks: contactData.socialLinks.map(link => 
                link.id === linkId ? { ...link, ...updates } : link
            )
        });
    };

    const deleteSocialLink = (linkId: string) => {
        if (!contactData) return;
        
        setContactData({
            ...contactData,
            socialLinks: contactData.socialLinks.filter(link => link.id !== linkId)
        });
    };

    const moveSocialLink = (linkId: string, direction: 'up' | 'down') => {
        if (!contactData) return;
        
        const links = [...contactData.socialLinks];
        const index = links.findIndex(link => link.id === linkId);
        
        if (direction === 'up' && index > 0) {
            [links[index], links[index - 1]] = [links[index - 1], links[index]];
        } else if (direction === 'down' && index < links.length - 1) {
            [links[index], links[index + 1]] = [links[index + 1], links[index]];
        }
        
        setContactData({ ...contactData, socialLinks: links });
    };

    const commonIcons = [
        { icon: '📧', name: 'Email' },
        { icon: '💼', name: 'LinkedIn' },
        { icon: '🐙', name: 'GitHub' },
        { icon: '🐦', name: 'Twitter' },
        { icon: '📷', name: 'Instagram' },
        { icon: '🎵', name: 'Spotify' },
        { icon: '🌐', name: 'Website' },
        { icon: '📱', name: 'Phone' },
        { icon: '💬', name: 'Discord' },
        { icon: '📺', name: 'YouTube' }
    ];

    const commonColors = [
        'blue', 'green', 'purple', 'pink', 'indigo', 'red', 'yellow', 'gray'
    ];

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Loading contact data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!contactData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">Failed to load contact data.</p>
                    <button onClick={onClose} className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Contact Management</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Basic Information */}
                    <div className="mb-8 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Basic Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={contactData.title}
                                    onChange={(e) => updateBasicInfo('title', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Subtitle
                                </label>
                                <input
                                    type="text"
                                    value={contactData.subtitle}
                                    onChange={(e) => updateBasicInfo('subtitle', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={contactData.description}
                                onChange={(e) => updateBasicInfo('description', e.target.value)}
                                rows={3}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={contactData.email}
                                    onChange={(e) => updateBasicInfo('email', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    value={contactData.location}
                                    onChange={(e) => updateBasicInfo('location', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Resume
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Resume File
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleResumeUpload(file);
                                    }}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingResume}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                                >
                                    {isUploadingResume ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                                            Uploading...
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">📄</div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Click to upload resume
                                            </p>
                                        </div>
                                    )}
                                </button>
                                
                                {contactData.resumeUrl && (
                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                                Resume uploaded successfully
                                            </span>
                                            <a
                                                href={contactData.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Resume Button Text
                                </label>
                                <input
                                    type="text"
                                    value={contactData.resumeButtonText}
                                    onChange={(e) => updateBasicInfo('resumeButtonText', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Social Links
                            </h3>
                            <button
                                onClick={addSocialLink}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Link
                            </button>
                        </div>

                        <div className="space-y-4">
                            {contactData.socialLinks.map((link, index) => (
                                <div key={link.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    {editingLink === link.id ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={link.name}
                                                    onChange={(e) => updateSocialLink(link.id, { name: e.target.value })}
                                                    placeholder="Platform Name"
                                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="url"
                                                    value={link.url}
                                                    onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                                                    placeholder="https://example.com"
                                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Icon</label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {commonIcons.map((iconOption) => (
                                                            <button
                                                                key={iconOption.icon}
                                                                type="button"
                                                                onClick={() => updateSocialLink(link.id, { icon: iconOption.icon })}
                                                                className={`p-2 rounded border ${
                                                                    link.icon === iconOption.icon
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                        : 'border-gray-300 dark:border-gray-600'
                                                                }`}
                                                                title={iconOption.name}
                                                            >
                                                                {iconOption.icon}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Color</label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {commonColors.map((colorOption) => (
                                                            <button
                                                                key={colorOption}
                                                                type="button"
                                                                onClick={() => updateSocialLink(link.id, { color: colorOption })}
                                                                className={`w-6 h-6 rounded-full border-2 ${
                                                                    link.color === colorOption
                                                                        ? 'border-gray-800 dark:border-white'
                                                                        : 'border-gray-300'
                                                                } bg-${colorOption}-500`}
                                                                title={colorOption}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => setEditingLink(null)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-${link.color}-500 rounded-full flex items-center justify-center text-white`}>
                                                    {link.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                                        {link.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {link.url}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => moveSocialLink(link.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => moveSocialLink(link.id, 'down')}
                                                    disabled={index === contactData.socialLinks.length - 1}
                                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setEditingLink(link.id)}
                                                    className="p-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => deleteSocialLink(link.id)}
                                                    className="p-1 text-red-600 hover:text-red-800"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactManager;