import React, { useState, useEffect, useRef } from 'react';
import { CVSection, CVVersion } from '../types';
import { api } from '../services/api';

const CVManager: React.FC = () => {
    const [cvSection, setCVSection] = useState<CVSection | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingVersionId, setUploadingVersionId] = useState<string | null>(null);
    const [editingSection, setEditingSection] = useState(false);
    const [sectionForm, setSectionForm] = useState({
        title: '',
        subtitle: '',
        description: ''
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        fetchCVSection();
    }, []);

    const fetchCVSection = async () => {
        try {
            console.log('🔍 CVManager: Fetching CV section...');
            const data = await api.getCVSection();
            console.log('✅ CVManager: CV section data received:', data);
            setCVSection(data);
            setSectionForm({
                title: data.title,
                subtitle: data.subtitle,
                description: data.description
            });
        } catch (error) {
            console.error('❌ CVManager: Error fetching CV section:', error);
            console.error('❌ CVManager: Error details:', error.message);
            console.error('❌ CVManager: Error stack:', error.stack);
        } finally {
            setLoading(false);
        }
    };

    const handleSectionUpdate = async () => {
        if (!cvSection) return;
        
        try {
            const updatedSection = await api.updateCVSection({
                ...cvSection,
                ...sectionForm
            });
            setCVSection(updatedSection);
            setEditingSection(false);
        } catch (error) {
            console.error('Error updating CV section:', error);
        }
    };

    const handleFileUpload = async (file: File, versionId: string) => {
        if (!cvSection) return;

        setUploadingVersionId(versionId);
        try {
            console.log('📤 Uploading file:', file.name, file.size, file.type);
            const { asset_id, url } = await api.uploadDocument(file);
            console.log('✅ Upload successful:', asset_id, url);
            
            const updatedVersions = cvSection.versions.map(version => 
                version.id === versionId 
                    ? { 
                        ...version, 
                        fileUrl: url,
                        fileName: file.name,
                        fileSize: file.size,
                        uploadDate: new Date().toISOString()
                      }
                    : version
            );

            const updatedSection = { ...cvSection, versions: updatedVersions };
            console.log('💾 Saving CV section with uploaded file...');
            await api.updateCVSection(updatedSection);
            console.log('✅ CV file saved successfully');
            setCVSection(updatedSection);
            setHasUnsavedChanges(false); // File upload auto-saves
            alert('CV file uploaded and saved successfully!');
        } catch (error) {
            console.error('❌ Error uploading file:', error);
            console.error('❌ Error details:', error.message);
            console.error('❌ Error stack:', error.stack);
            
            let errorMessage = 'Failed to upload file. ';
            if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += 'Please check your internet connection and try again.';
            }
            
            alert(errorMessage);
        } finally {
            setUploadingVersionId(null);
        }
    };

    const handleGoogleDriveUpdate = (versionId: string, driveUrl: string) => {
        if (!cvSection) return;

        const updatedVersions = cvSection.versions.map(version => 
            version.id === versionId 
                ? { ...version, googleDriveUrl: driveUrl }
                : version
        );

        setCVSection({ ...cvSection, versions: updatedVersions });
        setHasUnsavedChanges(true);
    };

    const toggleVersionActive = (versionId: string) => {
        if (!cvSection) return;

        const updatedVersions = cvSection.versions.map(version => 
            version.id === versionId 
                ? { ...version, isActive: !version.isActive }
                : version
        );

        setCVSection({ ...cvSection, versions: updatedVersions });
        setHasUnsavedChanges(true);
    };

    const handleSaveAll = async () => {
        if (!cvSection) return;

        setIsSaving(true);
        try {
            console.log('💾 Saving all CV changes...');
            await api.updateCVSection(cvSection);
            console.log('✅ All changes saved successfully');
            setHasUnsavedChanges(false);
            alert('All changes saved successfully!');
        } catch (error) {
            console.error('❌ Error saving changes:', error);
            alert(`Failed to save changes: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3">Loading CV management...</span>
            </div>
        );
    }

    if (!cvSection) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">Failed to load CV section.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Section Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        CV Section Settings
                    </h3>
                    <button
                        onClick={() => setEditingSection(!editingSection)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {editingSection ? 'Cancel' : 'Edit'}
                    </button>
                </div>

                {editingSection ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={sectionForm.title}
                                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={sectionForm.subtitle}
                                onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={sectionForm.description}
                                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                                rows={3}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleSectionUpdate}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setEditingSection(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            {cvSection.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{cvSection.subtitle}</p>
                        <p className="text-gray-600 dark:text-gray-400">{cvSection.description}</p>
                    </div>
                )}
            </div>

            {/* CV Versions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cvSection.versions.map((version) => (
                    <div key={version.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getVersionColor(version.type)} flex items-center justify-center text-3xl shadow-lg`}>
                                {getVersionIcon(version.type)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                {version.name}
                            </h3>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => toggleVersionActive(version.id)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                        version.isActive
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    {version.isActive ? 'Active' : 'Inactive'}
                                </button>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Upload CV File
                                </label>
                                <input
                                    type="file"
                                    ref={(el) => fileInputRefs.current[version.id] = el}
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, version.id);
                                    }}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRefs.current[version.id]?.click()}
                                    disabled={uploadingVersionId === version.id}
                                    className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                                >
                                    {uploadingVersionId === version.id ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                                            Uploading...
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">📎</div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Click to upload CV file
                                            </p>
                                        </div>
                                    )}
                                </button>
                                
                                {version.fileUrl && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                                    {version.fileName}
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    {version.fileSize ? `${Math.round(version.fileSize / 1024)} KB` : ''}
                                                </p>
                                            </div>
                                            <a
                                                href={version.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Google Drive URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Google Drive URL (Alternative)
                                </label>
                                <input
                                    type="url"
                                    value={version.googleDriveUrl || ''}
                                    onChange={(e) => handleGoogleDriveUpdate(version.id, e.target.value)}
                                    placeholder="https://drive.google.com/file/d/..."
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                {version.googleDriveUrl && (
                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-600 dark:text-green-400">🔗</span>
                                            <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                                Google Drive Link Active
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Download Button */}
                        <div className="mt-6 text-center">
                            {(version.fileUrl || version.googleDriveUrl) ? (
                                <a
                                    href={version.fileUrl || version.googleDriveUrl}
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
                                    No File Available
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Save All Changes Button */}
            {hasUnsavedChanges && (
                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-medium text-yellow-800 dark:text-yellow-300">
                                You have unsaved changes
                            </span>
                        </div>
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save All Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CVManager;