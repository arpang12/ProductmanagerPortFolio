import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CarouselManager from '../components/CarouselManager';
import MyStoryManager from '../components/MyStoryManager';
import AISettingsManager from '../components/AISettingsManager';
import MagicToolboxManager from '../components/MagicToolboxManager';
import JourneyManager from '../components/JourneyManager';
import ContactManager from '../components/ContactManager';
import CVManager from '../components/CVManager';
import ProfileSettingsManager from '../components/ProfileSettingsManager';
import OptimizedPortfolioPublisher from '../components/OptimizedPortfolioPublisher';
import PortfolioStatusIndicator from '../components/PortfolioStatusIndicator';
import AIEnhancementModal from '../components/AIEnhancementModal';
import DocumentManager from '../components/DocumentManager';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';
// FIX: Import HeroSection and OverviewSection types.
import { CaseStudy, View, CaseStudySectionName, CaseStudySection, HeroSection, OverviewSection } from '../types';
import { AuthContext } from '../App';

// ---------- PROPS & STATE INTERFACES ---------- //

interface AdminPageProps {
    navigateTo: (view: View) => void;
}

type EditorView = 'dashboard' | 'editor';

// ---------- VALIDATION LOGIC ---------- //

const validateCaseStudy = (caseStudy: CaseStudy): Record<string, string> => {
    const errors: Record<string, string> = {};
    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

    // Hero
    if (caseStudy.sections.hero.enabled && !caseStudy.sections.hero.headline.trim()) {
        errors['hero.headline'] = 'Hero headline is required.';
    }

    // Video
    if (caseStudy.sections.video.enabled && caseStudy.sections.video.url && !/youtube\.com|youtu\.be/.test(caseStudy.sections.video.url)) {
        errors['video.url'] = 'Please enter a valid YouTube URL.';
    }

    // Figma
    if (caseStudy.sections.figma.enabled && caseStudy.sections.figma.url &&
        !caseStudy.sections.figma.url.includes('figma.com/embed') &&
        !caseStudy.sections.figma.url.includes('figma.com/file/') &&
        !caseStudy.sections.figma.url.includes('figma.com/design/') &&
        !caseStudy.sections.figma.url.includes('figma.com/proto/')) {
        errors['figma.url'] = 'Please use a valid Figma URL.';
    }

    // Miro
    if (caseStudy.sections.miro.enabled && caseStudy.sections.miro.url &&
        !caseStudy.sections.miro.url.includes('miro.com/app/live-embed') &&
        !caseStudy.sections.miro.url.includes('miro.com/app/board/')) {
        errors['miro.url'] = 'Please use a valid Miro URL.';
    }

    // Links
    if (caseStudy.sections.links.enabled && caseStudy.sections.links.items) {
        const links = caseStudy.sections.links.items.split('\n');
        links.forEach((link, index) => {
            if (!link.trim()) return;
            const parts = link.split('|');
            if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim() || !urlRegex.test(parts[1].trim())) {
                errors[`links.items.${index}`] = `Link #${index + 1} is invalid. Use "Name|URL" format.`;
            }
        });
    }

    // Metrics
    if (caseStudy.sections.overview.enabled && caseStudy.sections.overview.metrics) {
        const metrics = caseStudy.sections.overview.metrics.split('\n');
        metrics.forEach((metric, index) => {
            if (!metric.trim()) return;
            const parts = metric.split(':');
            if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
                errors[`overview.metrics.${index}`] = `Metric #${index + 1} is invalid. Use "Key: Value" format.`;
            }
        });
    }

    return errors;
};


// ---------- HELPER & CHILD COMPONENTS ---------- //

/**
 * A modal for creating a new case study.
 */
const CreateCaseStudyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, template: 'default' | 'ghibli' | 'modern') => void;
}> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [template, setTemplate] = useState<'default' | 'ghibli' | 'modern'>('default');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (title.trim()) {
            onCreate(title.trim(), template);
            setTitle('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 ghibli-font">Create New Case Study</h2>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter new case study title"
                    className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as 'default' | 'ghibli' | 'modern')}
                    className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="default">Default (Dynamic React Rendering)</option>
                    <option value="ghibli">Ghibli Style (Static HTML)</option>
                    <option value="modern">Modern Style (Glassmorphism & Pastels)</option>
                </select>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="text-gray-600 dark:text-gray-400">Cancel</button>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create</button>
                </div>
            </div>
        </div>
    );
};

/**
 * A confirmation modal for deleting a case study.
 */
const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    caseStudyTitle: string;
}> = ({ isOpen, onClose, onConfirm, caseStudyTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4 ghibli-font">Confirm Deletion</h2>
                <p>Are you sure you want to permanently delete the case study: <br /><strong>{caseStudyTitle}</strong>?</p>
                <div className="flex justify-center gap-4 mt-6">
                    <button onClick={onClose} className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
                </div>
            </div>
        </div>
    );
};

// ---------- MAIN ADMIN PAGE COMPONENT ---------- //

const AdminPage: React.FC<AdminPageProps> = ({ navigateTo }) => {
    const [view, setView] = useState<EditorView>('dashboard');
    const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
    const [selectedCaseStudy, setSelectedCaseStudy] = useState<CaseStudy | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studyToDelete, setStudyToDelete] = useState<CaseStudy | null>(null);
    const [isCarouselManagerOpen, setCarouselManagerOpen] = useState(false);
    const [isMyStoryManagerOpen, setMyStoryManagerOpen] = useState(false);
    const [isAISettingsOpen, setAISettingsOpen] = useState(false);
    const [isProfileSettingsOpen, setProfileSettingsOpen] = useState(false);
    const [isMagicToolboxOpen, setMagicToolboxOpen] = useState(false);
    const [isJourneyManagerOpen, setJourneyManagerOpen] = useState(false);
    const [isContactManagerOpen, setContactManagerOpen] = useState(false);
    const [isCVManagerOpen, setCVManagerOpen] = useState(false);
    const [isPortfolioPublishOpen, setPortfolioPublishOpen] = useState(false);

    const auth = useContext(AuthContext);

    const fetchCaseStudies = useCallback(async () => {
        setIsLoading(true);
        try {
            const studies = await api.getCaseStudies();
            setCaseStudies(studies);
        } catch (error) {
            console.error("Failed to load case studies:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (auth?.user) {
            fetchCaseStudies();
        }
    }, [auth?.user, fetchCaseStudies]);

    const handleCreate = async (title: string, template: 'default' | 'ghibli' | 'modern') => {
        try {
            const newStudy = await api.createCaseStudy(title, template);
            setCaseStudies(prev => [...prev, newStudy]);
            setSelectedCaseStudy(newStudy);
            setView('editor');
        } catch (error) {
            console.error("Failed to create case study:", error);
        }
    };

    const handleDelete = async () => {
        if (!studyToDelete) return;
        try {
            await api.deleteCaseStudy(studyToDelete.id);
            setCaseStudies(prev => prev.filter(cs => cs.id !== studyToDelete.id));
            if (selectedCaseStudy?.id === studyToDelete.id) {
                setSelectedCaseStudy(null);
                setView('dashboard');
            }
        } catch (error) {
            console.error("Failed to delete case study:", error);
        } finally {
            setDeleteModalOpen(false);
            setStudyToDelete(null);
        }
    };

    const handleEditClick = async (caseStudy: CaseStudy) => {
        try {
            // Fetch fresh data from database to ensure we have latest changes
            console.log('🔄 Fetching fresh case study data for:', caseStudy.id);
            const freshCaseStudy = await api.getCaseStudyById(caseStudy.id); // Admin can see unpublished
            setSelectedCaseStudy(freshCaseStudy);
            setView('editor');
        } catch (error) {
            console.error('Failed to load case study:', error);
            // Fallback to cached data if fetch fails
            setSelectedCaseStudy(caseStudy);
            setView('editor');
        }
    };

    const handleSaveChanges = async (updatedStudy: CaseStudy) => {
        if (!updatedStudy) return;
        setIsSaving(true);
        try {
            console.log('💾 Saving case study:', updatedStudy.id);
            const savedStudy = await api.updateCaseStudy(updatedStudy);
            
            // Update the list
            setCaseStudies(prev => prev.map(cs => cs.id === savedStudy.id ? savedStudy : cs));
            
            // Fetch fresh data from database to ensure editor has latest
            console.log('🔄 Fetching fresh data after save...');
            const freshStudy = await api.getCaseStudyById(savedStudy.id); // Admin can see unpublished
            setSelectedCaseStudy(freshStudy);
            
            alert('Changes saved successfully!');
        } catch (error) {
            console.error("Failed to save changes:", error);
            alert(`Failed to save changes: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const renderDashboard = () => (
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="ghibli-font text-4xl text-blue-700 dark:text-blue-300 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your magical portfolio content</p>
                </div>
                <div className="flex items-center gap-4">
                    <PortfolioStatusIndicator />
                    <button 
                        onClick={() => setCreateModalOpen(true)} 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Case Study
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 mb-8">
                {/* Case Studies Management */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                                {caseStudies.length} studies
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">Case Studies</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Create and manage your project case studies with rich content and embeds.
                        </p>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Create New Case Study
                        </button>
                    </div>
                </div>

                {/* My Story Management */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">📖</span>
                            </div>
                            <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                                About section
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">My Story</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Edit your personal story, image, and content with AI assistance.
                        </p>
                        <button
                            onClick={() => setMyStoryManagerOpen(true)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Edit My Story
                        </button>
                    </div>
                </div>

                {/* Carousel Management */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">🎠</span>
                            </div>
                            <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full font-medium">
                                Magical journeys
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">Homepage Carousel</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Upload and manage the beautiful carousel images on your homepage.
                        </p>
                        <button
                            onClick={() => setCarouselManagerOpen(true)}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Manage Carousel
                        </button>
                    </div>
                </div>

                {/* Magic Toolbox */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">🧰</span>
                            </div>
                            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-medium">
                                Skills & tools
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">Magic Toolbox</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Manage your skills categories and tools showcase section.
                        </p>
                        <button
                            onClick={() => setMagicToolboxOpen(true)}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Edit Toolbox
                        </button>
                    </div>
                </div>

                {/* My Journey */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">🗺️</span>
                            </div>
                            <span className="text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-full font-medium">
                                Career timeline
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">My Journey</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Manage your professional experience and career timeline.
                        </p>
                        <button
                            onClick={() => setJourneyManagerOpen(true)}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Edit Journey
                        </button>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">📞</span>
                            </div>
                            <span className="text-xs bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-1 rounded-full font-medium">
                                Let's connect
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">Contact Section</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Manage contact information, social links, and resume download.
                        </p>
                        <button
                            onClick={() => setContactManagerOpen(true)}
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Edit Contact
                        </button>
                    </div>
                </div>

                {/* CV Management */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">📋</span>
                            </div>
                            <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full font-medium">
                                CV Collection
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">CV Management</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Upload and manage CV versions for different regions and formats.
                        </p>
                        <button
                            onClick={() => setCVManagerOpen(true)}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Manage CVs
                        </button>
                    </div>
                </div>

                {/* Public Profile Settings - NEW! */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-green-200 dark:border-green-800">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">🌐</span>
                            </div>
                            <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-1 rounded-full font-medium">
                                NEW!
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">Public Profile</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Set your username and manage your public portfolio URL.
                        </p>
                        <button
                            onClick={() => setProfileSettingsOpen(true)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Manage Profile
                        </button>
                    </div>
                </div>

                {/* Portfolio Publish Manager - NEW! */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border-2 border-blue-200 dark:border-blue-800">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">🚀</span>
                            </div>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                                PUBLISH
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">Portfolio Publisher</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Publish your portfolio to make it live and accessible to the public.
                        </p>
                        <button
                            onClick={() => setPortfolioPublishOpen(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Publish Portfolio
                        </button>
                    </div>
                </div>

                {/* AI Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                                <span className="text-xl">🤖</span>
                            </div>
                            <span className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                                Gemini API
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-base">AI Settings</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                            Configure your Gemini API key and select models for AI content enhancement.
                        </p>
                        <button
                            onClick={() => setAISettingsOpen(true)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                        >
                            Configure AI
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Recent Case Studies</h2>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Loading case studies...</span>
                    </div>
                ) : caseStudies.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No case studies yet</p>
                        <p>Create your first case study to get started!</p>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {caseStudies.map(cs => (
                            <li key={cs.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                                        {cs.title.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{cs.title}</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {cs.template === 'ghibli' ? '🎨 Ghibli Style' : cs.template === 'modern' ? '✨ Modern Style' : '📝 Default Style'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(cs)} className="text-blue-500 hover:text-blue-700 font-medium">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStudyToDelete(cs);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete case study"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Header navigateTo={navigateTo} />
            <main className="pt-24 pb-12 bg-gray-100 dark:bg-gray-900 min-h-screen">
                {view === 'dashboard' ? renderDashboard() : (
                    <CaseStudyEditor
                        caseStudy={selectedCaseStudy}
                        onSave={handleSaveChanges}
                        onBack={() => setView('dashboard')}
                        isSaving={isSaving}
                    />
                )}
            </main>

            <CreateCaseStudyModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreate}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                caseStudyTitle={studyToDelete?.title || ''}
            />

            {/* My Story Manager */}
            {isMyStoryManagerOpen && (
                <MyStoryManager onClose={() => setMyStoryManagerOpen(false)} />
            )}

            {/* Carousel Manager */}
            {isCarouselManagerOpen && (
                <CarouselManager onClose={() => setCarouselManagerOpen(false)} />
            )}

            {/* Magic Toolbox Manager */}
            {isMagicToolboxOpen && (
                <MagicToolboxManager onClose={() => setMagicToolboxOpen(false)} />
            )}

            {/* Journey Manager */}
            {isJourneyManagerOpen && (
                <JourneyManager onClose={() => setJourneyManagerOpen(false)} />
            )}

            {/* Contact Manager */}
            {isContactManagerOpen && (
                <ContactManager onClose={() => setContactManagerOpen(false)} />
            )}

            {/* AI Settings Manager */}
            {isAISettingsOpen && (
                <AISettingsManager onClose={() => setAISettingsOpen(false)} />
            )}

            {/* Profile Settings Manager */}
            {isProfileSettingsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Public Profile Settings</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your username and portfolio visibility</p>
                            </div>
                            <button
                                onClick={() => setProfileSettingsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <ProfileSettingsManager />
                        </div>
                    </div>
                </div>
            )}

            {/* Portfolio Publish Manager */}
            {isPortfolioPublishOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Portfolio Publisher</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Publish your portfolio to make it live and accessible</p>
                            </div>
                            <button
                                onClick={() => setPortfolioPublishOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <OptimizedPortfolioPublisher onClose={() => setPortfolioPublishOpen(false)} />
                        </div>
                    </div>
                </div>
            )}

            {/* CV Manager */}
            {isCVManagerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">CV Management</h2>
                            <button
                                onClick={() => setCVManagerOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <CVManager />
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};


// ---------- CASE STUDY EDITOR COMPONENT ---------- //

interface CaseStudyEditorProps {
    caseStudy: CaseStudy | null;
    onSave: (updatedStudy: CaseStudy) => void;
    onBack: () => void;
    isSaving: boolean;
}

const CaseStudyEditor: React.FC<CaseStudyEditorProps> = ({ caseStudy, onSave, onBack, isSaving }) => {
    const [formState, setFormState] = useState<CaseStudy | null>(caseStudy);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [previewKey, setPreviewKey] = useState(0); // Force preview refresh

    const [isAIModalOpen, setAIModalOpen] = useState(false);
    const [aiFieldContext, setAIFieldContext] = useState<{ section: CaseStudySectionName; field: string; prompt: string; } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setFormState(caseStudy);
        if (caseStudy) {
            setErrors(validateCaseStudy(caseStudy));
        }
    }, [caseStudy]);

    const handleInputChange = useCallback((section: CaseStudySectionName, field: string, value: string | boolean | string[]) => {
        if (!formState) return;

        const newState = {
            ...formState,
            sections: {
                ...formState.sections,
                [section]: {
                    ...formState.sections[section],
                    [field]: value
                }
            }
        };
        setFormState(newState as CaseStudy);
        setErrors(validateCaseStudy(newState as CaseStudy));
        setPreviewKey(prev => prev + 1); // Force preview refresh
    }, [formState]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formState) return;
        setFormState({ ...formState, title: e.target.value });
    };

    const handleTemplateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!formState) return;
        const newTemplate = e.target.value as 'default' | 'ghibli' | 'modern';
        setFormState({ ...formState, template: newTemplate });
        // Clear any existing static content when switching templates to force regeneration
        if (newTemplate !== 'default') {
            setFormState(prev => prev ? { ...prev, template: newTemplate, content: undefined } : null);
        }
        setPreviewKey(prev => prev + 1); // Force preview refresh
    }, [formState]);

    const handleAIAction = async (section: CaseStudySectionName, field: string, prompt: string, existingText?: string, tone?: string, customInstruction?: string) => {
        if (!formState) return;

        setIsGenerating(true);
        try {
            const result = await geminiService.generateContent(prompt, existingText, tone, customInstruction);
            handleInputChange(section, field, result);
        } catch (error: any) {
            console.error("AI Generation failed:", error);
            
            // Show detailed error message
            let errorMessage = "AI Generation failed. ";
            
            if (error.message) {
                errorMessage += error.message;
            } else if (typeof error === 'string') {
                errorMessage += error;
            } else {
                errorMessage += "Please check your AI Settings and try again.";
            }
            
            // Add helpful hints based on error type
            if (errorMessage.includes('not configured') || errorMessage.includes('AI Settings')) {
                errorMessage += "\n\nPlease configure your AI Settings:\n1. Click 'AI Settings' button\n2. Enter your Gemini API key\n3. Test connection\n4. Save settings";
            } else if (errorMessage.includes('API') || errorMessage.includes('key')) {
                errorMessage += "\n\nPlease check your API key in AI Settings.";
            } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
                errorMessage += "\n\nYour API quota may be exceeded. Please check your Google AI Studio account.";
            }
            
            alert(errorMessage);
        } finally {
            setIsGenerating(false);
            setAIModalOpen(false);
        }
    };

    const handleSaveAndGenerate = () => {
        if (!formState) return;
        const currentErrors = validateCaseStudy(formState);
        setErrors(currentErrors);
        if (Object.keys(currentErrors).length > 0) {
            alert('Please fix the errors before saving.');
            return;
        }

        let studyToSave = { ...formState };
        if (formState.template === 'ghibli') {
            studyToSave.content = generateGhibliHTML(formState);
        } else if (formState.template === 'modern') {
            studyToSave.content = generateModernHTML(formState);
        } else {
            studyToSave.content = '';
        }
        onSave(studyToSave);
    };

    const handlePublishToggle = () => {
        if (!formState) return;
        
        const newPublishedState = !formState.is_published;
        const updatedStudy = {
            ...formState,
            is_published: newPublishedState,
            published_at: newPublishedState ? new Date().toISOString() : formState.published_at
        };
        
        setFormState(updatedStudy);
        onSave(updatedStudy);
    };

    if (!formState) {
        return <div className="text-center p-10">No case study selected.</div>;
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4">
                <button onClick={onBack} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">
                    &larr; Back to Dashboard
                </button>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <input
                            type="text"
                            value={formState.title}
                            onChange={handleTitleChange}
                            className="text-2xl font-bold w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 ghibli-font"
                        />
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Template Style</label>
                            <select
                                value={formState.template}
                                onChange={handleTemplateChange}
                                className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-medium min-w-[200px]"
                            >
                                <option value="default">📝 Default (React)</option>
                                <option value="ghibli">🎨 Ghibli Style</option>
                                <option value="modern">✨ Modern Glass</option>
                            </select>
                            <div className="text-xs text-gray-500 mt-1">
                                {formState.template === 'default' && 'Dynamic React components with Tailwind CSS'}
                                {formState.template === 'ghibli' && 'Whimsical forest theme with hand-drawn aesthetics'}
                                {formState.template === 'modern' && 'Glassmorphism design with gradient backgrounds'}
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                <div className={`w-3 h-3 rounded-full ${formState.template === 'default' ? 'bg-blue-500' : formState.template === 'ghibli' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {formState.template === 'default' ? 'Interactive' : 'Static HTML'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleSaveAndGenerate} 
                                disabled={isSaving || Object.keys(errors).length > 0} 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition disabled:bg-gray-400"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                onClick={handlePublishToggle} 
                                disabled={isSaving}
                                className={`font-bold py-2 px-6 rounded-full shadow-lg transition disabled:bg-gray-400 ${
                                    formState?.is_published 
                                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                            >
                                {formState?.is_published ? '📤 Unpublish' : '🚀 Publish'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-6">
                        {(Object.keys(formState.sections) as CaseStudySectionName[]).map(sectionName => (
                            <SectionEditor
                                key={sectionName}
                                sectionName={sectionName}
                                sectionData={formState.sections[sectionName]}
                                onChange={handleInputChange}
                                onAIAction={handleAIAction}
                                setAIContext={setAIFieldContext}
                                setAIModalOpen={setAIModalOpen}
                                errors={errors}
                            />
                        ))}
                    </div>

                    <div className="relative">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-t-2xl border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Live Preview</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${Object.keys(errors).length === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs text-gray-500">
                                            {Object.keys(errors).length === 0 ? 'Ready' : `${Object.keys(errors).length} errors`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ThemedPreview key={previewKey} caseStudy={formState} />
                        </div>
                    </div>
                </div>
            </div>

            <AIEnhancementModal
                isOpen={isAIModalOpen}
                onClose={() => setAIModalOpen(false)}
                originalText={aiFieldContext && formState.sections[aiFieldContext.section] ? (formState.sections[aiFieldContext.section] as any)[aiFieldContext.field] : ''}
                onApply={(enhancedText) => {
                    if (aiFieldContext) {
                        handleInputChange(aiFieldContext.section, aiFieldContext.field, enhancedText);
                    }
                    setAIModalOpen(false);
                }}
                sectionType={aiFieldContext?.section || 'content'}
            />
        </>
    );
};

// ---------- EDITOR HELPER COMPONENTS ---------- //

interface SectionEditorProps {
    sectionName: CaseStudySectionName;
    sectionData: CaseStudySection;
    onChange: (section: CaseStudySectionName, field: string, value: any) => void;
    onAIAction: (section: CaseStudySectionName, field: string, prompt: string, existingText?: string, tone?: string, customInstruction?: string) => void;
    setAIContext: (context: { section: CaseStudySectionName; field: string; prompt: string; } | null) => void;
    setAIModalOpen: (isOpen: boolean) => void;
    errors: Record<string, string>;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sectionName, sectionData, onChange, onAIAction, setAIContext, setAIModalOpen, errors }) => {
    const title = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);

    return (
        <fieldset className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg">
            <legend className="px-2 font-bold text-lg ghibli-font text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={sectionData.enabled}
                    onChange={(e) => onChange(sectionName, 'enabled', e.target.checked)}
                    className="w-5 h-5"
                />
                {title}
            </legend>
            {sectionData.enabled && (
                <div className="space-y-4 pt-2">
                    {Object.keys(sectionData).filter(key => key !== 'enabled' && key !== 'imageAssetId').map(field => {
                        const fieldKey = `${sectionName}.${field}`;
                        const error = errors[fieldKey] || Object.keys(errors).find(e => e.startsWith(fieldKey));
                        const value = (sectionData as any)[field];

                        // Hero section image upload
                        if (sectionName === 'hero' && field === 'imageUrl') {
                            return <ImageUploadInput key={fieldKey} label="Hero Image" images={value ? [value] : []} onChange={v => onChange(sectionName, field, v[0] || '')} />;
                        }
                        if (field === 'images') {
                            return <ImageUploadInput key={fieldKey} label="Gallery Images" images={value} onChange={v => onChange(sectionName, field, v)} />;
                        }
                        if (['metrics', 'steps', 'features', 'learnings', 'items'].includes(field)) {
                            return <FormListInput key={fieldKey} label={field} value={value} onChange={v => onChange(sectionName, field, v)} error={errors[fieldKey]} />;
                        }
                        if (field === 'url' && (sectionName === 'figma' || sectionName === 'video' || sectionName === 'miro')) {
                            return <EmbedUrlInput key={fieldKey} label={field} value={value} onChange={v => onChange(sectionName, field, v)} error={error} embedType={sectionName} />;
                        }
                        // Document section - use DocumentManager for multiple documents
                        if (sectionName === 'document' && field === 'documents') {
                            return <DocumentManager key={fieldKey} documents={value || []} onChange={v => onChange(sectionName, field, v)} />;
                        }
                        // Document section - if we see 'url' field, also render DocumentManager if 'documents' doesn't exist
                        if (sectionName === 'document' && field === 'url') {
                            // Check if documents field exists in sectionData
                            const hasDocumentsField = 'documents' in sectionData;
                            if (!hasDocumentsField) {
                                // Render DocumentManager here since documents field doesn't exist
                                return (
                                    <div key="document-manager-fallback">
                                        <DocumentManager documents={[]} onChange={v => onChange(sectionName, 'documents', v)} />
                                    </div>
                                );
                            }
                            // If documents field exists, skip the URL field
                            return null;
                        }
                        // Use AI-enabled textarea for all text fields (except special cases above)
                        if (typeof value === 'string') {
                            return <FormTextareaWithAI key={fieldKey} label={field} value={value} onChange={v => onChange(sectionName, field, v)} error={error} onAIAction={onAIAction} sectionName={sectionName} field={field} setAIContext={setAIContext} setAIModalOpen={setAIModalOpen} />;
                        }
                        return <FormInput key={fieldKey} label={field} value={value} onChange={v => onChange(sectionName, field, v)} error={error} />;
                    })}
                </div>
            )}
        </fieldset>
    );
};

// Generic Input Components
const FormInput: React.FC<{ label: string, value: string, onChange: (v: string) => void, error?: string }> = ({ label, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{label}</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className={`w-full p-2 mt-1 border rounded ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700`} />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const FormTextareaWithAI: React.FC<{ label: string, value: string, onChange: (v: string) => void, error?: string, onAIAction: Function, sectionName: string, field: string, setAIContext: Function, setAIModalOpen: Function }> = ({ label, value, onChange, error, onAIAction, sectionName, field, setAIContext, setAIModalOpen }) => {
    // Adjust rows based on content length for better UX
    const rows = value.length > 200 ? 6 : value.length > 100 ? 4 : 2;
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{label}</label>
            <div className="relative">
                <textarea 
                    value={value} 
                    onChange={e => onChange(e.target.value)} 
                    rows={rows} 
                    className={`w-full p-2 pr-10 mt-1 border rounded ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`} 
                    placeholder={`Enter ${label.toLowerCase()}...`}
                />
                <div className="absolute top-3 right-2 flex gap-1">
                    {value ? (
                        <button 
                            type="button" 
                            onClick={() => { 
                                setAIContext({ 
                                    section: sectionName, 
                                    field, 
                                    prompt: `Enhance this text for a case study's ${sectionName} section, focusing on the ${field}.` 
                                }); 
                                setAIModalOpen(true); 
                            }} 
                            className="text-purple-500 hover:text-purple-700 text-xl transition-transform hover:scale-110" 
                            title="Enhance with AI"
                        >
                            🪄
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={() => onAIAction(sectionName, field, `Generate content for a case study's ${sectionName} section, specifically for the ${field}.`)} 
                            className="text-blue-500 hover:text-blue-700 text-xl transition-transform hover:scale-110" 
                            title="Generate with AI"
                        >
                            ✨
                        </button>
                    )}
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

const FormListInput: React.FC<{ label: string, value: string, onChange: (v: string) => void, error?: string }> = ({ label, value, onChange, error }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{label} (one per line)</label>
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} className={`w-full p-2 mt-1 border rounded ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700`} />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const ImageUploadInput: React.FC<{ label: string; images: string[]; onChange: (images: string[]) => void; }> = ({ label, images, onChange }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        const uploadedUrls: string[] = [];
        for (const file of Array.from(files)) {
            try {
                const result = await api.uploadImage(file);
                uploadedUrls.push(result.url);
            } catch (err) {
                console.error('Upload failed:', err);
                alert('An image failed to upload.');
            }
        }
        onChange([...images, ...uploadedUrls]);
        setIsUploading(false);
    };

    const handleRemove = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="mt-1 p-4 border-2 border-dashed rounded-md text-center">
                <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={e => handleFileChange(e.target.files)} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-500 underline">Browse files</button>
                <p className="text-xs text-gray-500">or drag and drop</p>
                {isUploading && <p>Uploading...</p>}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((url, i) => (
                    <div key={i} className="relative group">
                        <img src={url} className="w-full h-24 object-cover rounded" />
                        <button onClick={() => handleRemove(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmbedUrlInput: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    embedType: 'figma' | 'video' | 'miro';
}> = ({ label, value, onChange, error, embedType }) => {
    const [showConversion, setShowConversion] = useState(false);
    const [convertedUrl, setConvertedUrl] = useState('');

    const getPlaceholder = () => {
        switch (embedType) {
            case 'figma':
                return 'https://www.figma.com/file/... or https://www.figma.com/design/... or https://www.figma.com/embed?...';
            case 'video':
                return 'https://www.youtube.com/watch?v=... or https://youtu.be/...';
            case 'miro':
                return 'https://miro.com/app/board/... or https://miro.com/app/live-embed/...';
            default:
                return 'Enter URL';
        }
    };

    const getIcon = () => {
        switch (embedType) {
            case 'figma':
                return '🎨';
            case 'video':
                return '📹';
            case 'miro':
                return '📋';
            default:
                return '🔗';
        }
    };

    const convertFigmaUrl = (url: string): string | null => {
        try {
            // Check if it's already an embed URL
            if (url.includes('figma.com/embed')) {
                return null; // Already converted
            }

            // Convert regular Figma file URL to embed URL
            if (url.includes('figma.com/file/') || url.includes('figma.com/design/') || url.includes('figma.com/proto/')) {
                const encodedUrl = encodeURIComponent(url);
                return `https://www.figma.com/embed?embed_host=share&url=${encodedUrl}`;
            }

            return null;
        } catch (error) {
            return null;
        }
    };

    const convertMiroUrl = (url: string): string | null => {
        try {
            // Check if it's already a live embed URL
            if (url.includes('miro.com/app/live-embed')) {
                return null; // Already converted
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

            return null;
        } catch (error) {
            return null;
        }
    };

    const validateUrl = (url: string, type: string) => {
        if (!url) return true;
        switch (type) {
            case 'figma':
                return url.includes('figma.com/embed') || url.includes('figma.com/file/') || url.includes('figma.com/design/') || url.includes('figma.com/proto/');
            case 'video':
                return /youtube\.com|youtu\.be/.test(url);
            case 'miro':
                return url.includes('miro.com/app/live-embed') || url.includes('miro.com/app/board/');
            default:
                return true;
        }
    };

    const checkForConversion = (url: string) => {
        if (!url) {
            setShowConversion(false);
            return;
        }

        let converted = null;
        if (embedType === 'figma') {
            converted = convertFigmaUrl(url);
        } else if (embedType === 'miro') {
            converted = convertMiroUrl(url);
        }

        if (converted) {
            setConvertedUrl(converted);
            setShowConversion(true);
        } else {
            setShowConversion(false);
        }
    };

    const handleUrlChange = (newUrl: string) => {
        onChange(newUrl);
        checkForConversion(newUrl);
    };

    const handleConvert = () => {
        onChange(convertedUrl);
        setShowConversion(false);
    };

    React.useEffect(() => {
        checkForConversion(value);
    }, [value, embedType]);

    const isValid = validateUrl(value, embedType);
    const isEmbedFormat = embedType === 'figma' ? value.includes('figma.com/embed') :
        embedType === 'miro' ? value.includes('miro.com/app/live-embed') :
            true;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize flex items-center gap-2">
                <span>{getIcon()}</span>
                {label} URL
            </label>
            <input
                type="url"
                value={value}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder={getPlaceholder()}
                className={`w-full p-2 mt-1 border rounded ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700`}
            />

            {/* Auto-conversion suggestion */}
            {showConversion && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                        <span className="text-blue-500">🔄</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Convert to embed format?
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                We can automatically convert this {embedType} URL to the proper embed format.
                            </p>
                            <div className="mt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleConvert}
                                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                                >
                                    Convert URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowConversion(false)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Keep as is
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

            {/* Status indicators */}
            {value && isValid && isEmbedFormat && !error && !showConversion && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300">
                    ✅ Ready to embed - {embedType === 'video' ? 'YouTube' : embedType} URL is in correct format
                </div>
            )}

            {value && isValid && !isEmbedFormat && !showConversion && (embedType === 'figma' || embedType === 'miro') && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠️ This URL will work, but embed format is recommended for better performance
                </div>
            )}

            {value && !isValid && (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                    ❌ Invalid URL format for {embedType === 'video' ? 'YouTube' : embedType}
                </div>
            )}

            {/* Help text */}
            <p className="text-xs text-gray-500 mt-1">
                {embedType === 'figma' && 'Paste any Figma file or prototype URL - we\'ll convert it automatically'}
                {embedType === 'miro' && 'Paste any Miro board URL - we\'ll convert it to embed format'}
                {embedType === 'video' && 'Paste any YouTube URL (watch or share link)'}
            </p>
        </div>
    );
};


// ---------- THEMED PREVIEW COMPONENT ---------- //

const ThemedPreview: React.FC<{ caseStudy: CaseStudy }> = React.memo(({ caseStudy }) => {
    const { sections, template } = caseStudy;
    
    // Generate live preview content based on template
    const generateLivePreview = () => {
        try {
            if (template === 'ghibli') {
                return generateGhibliHTML(caseStudy);
            } else if (template === 'modern') {
                return generateModernHTML(caseStudy);
            }
            return null;
        } catch (error) {
            console.error('Error generating preview:', error);
            return `<div style="padding: 2rem; text-align: center; color: #ef4444;">
                <h3>Preview Error</h3>
                <p>Unable to generate preview. Please check your content.</p>
            </div>`;
        }
    };

    const liveContent = generateLivePreview();

    if (template === 'ghibli' && liveContent) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner h-[70vh] overflow-y-auto">
                <h3 className="font-bold text-center mb-2 text-green-600">🎨 Ghibli Style Preview</h3>
                <div className="border border-dashed p-2 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded">
                    <div dangerouslySetInnerHTML={{ __html: liveContent }} />
                </div>
            </div>
        );
    }

    if (template === 'modern' && liveContent) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner h-[70vh] overflow-y-auto">
                <h3 className="font-bold text-center mb-2 text-purple-600">✨ Modern Style Preview</h3>
                <div className="border border-dashed p-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded">
                    <div dangerouslySetInnerHTML={{ __html: liveContent }} />
                </div>
            </div>
        );
    }

    // Default preview rendering
    const enabledSections = Object.entries(sections).filter(([, section]) => (section as any).enabled);

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
            return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
        } catch (error) {
            return '';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner h-[70vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-center mb-4 text-gray-700 dark:text-gray-300">Live Preview</h3>
            {enabledSections.length === 0 ? <p className="text-center text-gray-500">Enable sections to see a preview.</p> :
                <div className="space-y-6">
                    {sections.hero.enabled && <HeroPreview {...sections.hero} />}
                    {sections.overview.enabled && <OverviewPreview {...sections.overview} />}
                    {sections.video.enabled && sections.video.url && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                📹 Video Section
                            </h4>
                            {getYouTubeEmbedUrl(sections.video.url) ? (
                                <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded">
                                    <iframe
                                        src={getYouTubeEmbedUrl(sections.video.url)}
                                        className="w-full h-32 rounded"
                                        frameBorder="0"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-600 dark:text-red-400 text-sm">
                                    Invalid YouTube URL
                                </div>
                            )}
                            {sections.video.caption && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{sections.video.caption}</p>}
                        </div>
                    )}
                    {sections.figma.enabled && sections.figma.url && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                🎨 Figma Prototype
                            </h4>
                            {(() => {
                                let embedUrl = sections.figma.url;
                                // Convert regular Figma URL to embed format for preview
                                if (!embedUrl.includes('figma.com/embed') && (embedUrl.includes('figma.com/file/') || embedUrl.includes('figma.com/design/') || embedUrl.includes('figma.com/proto/'))) {
                                    embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(embedUrl)}`;
                                }

                                return embedUrl.includes('figma.com/embed') || embedUrl.includes('figma.com/file/') || embedUrl.includes('figma.com/design/') || embedUrl.includes('figma.com/proto/') ? (
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded">
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-32 rounded"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-600 dark:text-red-400 text-sm">
                                        Invalid Figma URL
                                    </div>
                                );
                            })()}
                            {sections.figma.caption && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{sections.figma.caption}</p>}
                        </div>
                    )}
                    {sections.miro.enabled && sections.miro.url && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                📋 Miro Board
                            </h4>
                            {(() => {
                                let embedUrl = sections.miro.url;
                                // Convert regular Miro URL to embed format for preview
                                if (!embedUrl.includes('miro.com/app/live-embed') && embedUrl.includes('miro.com/app/board/')) {
                                    const boardIdMatch = embedUrl.match(/\/board\/([^\/\?]+)/);
                                    if (boardIdMatch) {
                                        const boardId = boardIdMatch[1];
                                        embedUrl = `https://miro.com/app/live-embed/${boardId}/?moveToViewport=-1000,-1000,2000,2000`;
                                    }
                                }

                                return embedUrl.includes('miro.com/app/live-embed') || embedUrl.includes('miro.com/app/board/') ? (
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded">
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-32 rounded"
                                            frameBorder="0"
                                            scrolling="no"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-600 dark:text-red-400 text-sm">
                                        Invalid Miro URL
                                    </div>
                                );
                            })()}
                            {sections.miro.caption && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{sections.miro.caption}</p>}
                        </div>
                    )}
                    {sections.gallery.enabled && sections.gallery.images.length > 0 && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">🖼️ Gallery</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {sections.gallery.images.slice(0, 4).map((img, i) => (
                                    <img key={i} src={img} alt={`Gallery ${i + 1}`} className="w-full h-16 object-cover rounded" />
                                ))}
                            </div>
                            {sections.gallery.images.length > 4 && (
                                <p className="text-xs text-gray-500 mt-1">+{sections.gallery.images.length - 4} more images</p>
                            )}
                        </div>
                    )}
                    {sections.document.enabled && (sections.document.documents?.length > 0 || sections.document.url) && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                📄 Document Section ({sections.document.documents?.length || 1} {sections.document.documents?.length === 1 ? 'document' : 'documents'})
                            </h4>
                            <div className="space-y-2">
                                {sections.document.documents?.map((doc) => (
                                    <a
                                        key={doc.id}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 hover:underline"
                                    >
                                        <span>{doc.type === 'pdf' ? '📕' : doc.type === 'doc' || doc.type === 'docx' ? '📘' : doc.type === 'ppt' || doc.type === 'pptx' ? '📊' : doc.type === 'xls' || doc.type === 'xlsx' ? '📗' : '📄'}</span>
                                        <span className="truncate">{doc.name}</span>
                                    </a>
                                ))}
                                {sections.document.url && !sections.document.documents?.length && (
                                    <a 
                                        href={sections.document.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        View Document
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                    {sections.links.enabled && sections.links.items && sections.links.items.trim() && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                🔗 {sections.links.title || 'Related Links'}
                            </h4>
                            <div className="space-y-2">
                                {sections.links.items.split('\n').filter(item => item.trim() && item.includes('|')).slice(0, 3).map((item, index) => {
                                    const [name, url] = item.split('|').map(s => s.trim());
                                    return (
                                        <a 
                                            key={index}
                                            href={url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
                                        >
                                            <span className="font-medium">{name}</span>
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    );
                                })}
                                {sections.links.items.split('\n').filter(item => item.trim() && item.includes('|')).length > 3 && (
                                    <p className="text-xs text-gray-500 mt-1">+{sections.links.items.split('\n').filter(item => item.trim() && item.includes('|')).length - 3} more links</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            }
        </div>
    );
});

const HeroPreview: React.FC<HeroSection> = ({ headline, subheading }) => (
    <div className="text-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h1 className="ghibli-font text-3xl font-bold">{headline}</h1>
        <p className="mt-2 text-lg">{subheading}</p>
    </div>
);
const OverviewPreview: React.FC<OverviewSection> = ({ title, summary, metrics }) => (
    <div>
        <h2 className="handwriting text-2xl font-bold text-center mb-4">{title}</h2>
        <p className="mb-4">{summary}</p>
        <div className="grid grid-cols-2 gap-2">
            {metrics.split('\n').map(m => m.split(':')).map(([key, value]) => (
                <div key={key} className="bg-yellow-100 dark:bg-yellow-900/50 p-2 rounded text-center">
                    <div className="text-sm font-bold">{key}</div>
                    <div className="text-xl">{value}</div>
                </div>
            ))}
        </div>
    </div>
);


// ---------- HTML GENERATOR FOR GHIBLI TEMPLATE ---------- //
const generateGhibliHTML = (caseStudy: CaseStudy): string => {
    const { sections } = caseStudy;
    
    let html = `
    <style>
        .ghibli-preview {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%);
            color: #2d5016;
            border-radius: 12px;
            overflow: hidden;
        }
        .ghibli-hero {
            background: linear-gradient(45deg, #87ceeb, #98fb98);
            padding: 2rem;
            text-align: center;
            border-bottom: 3px solid #228b22;
        }
        .ghibli-section {
            padding: 1.5rem;
            margin: 1rem 0;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            border-left: 4px solid #32cd32;
        }
        .ghibli-title {
            font-size: 1.8rem;
            font-weight: bold;
            color: #006400;
            margin-bottom: 1rem;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .ghibli-metric {
            background: #fffacd;
            padding: 0.8rem;
            border-radius: 6px;
            text-align: center;
            border: 2px dashed #daa520;
            margin: 0.5rem;
        }
        .ghibli-step {
            background: #f0fff0;
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 8px;
            border-left: 3px solid #32cd32;
        }
    </style>
    <div class="ghibli-preview">`;

    // Hero Section
    if (sections.hero.enabled) {
        html += `
        <div class="ghibli-hero">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem; color: #006400;">${sections.hero.headline}</h1>
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #228b22;">${sections.hero.subheading}</h2>
            <p style="font-size: 1.1rem; color: #2d5016;">${sections.hero.text}</p>
        </div>`;
    }

    // Overview Section
    if (sections.overview.enabled) {
        const metrics = sections.overview.metrics ? sections.overview.metrics.split('\n').filter(m => m.trim()) : [];
        html += `
        <div class="ghibli-section">
            <h2 class="ghibli-title">${sections.overview.title}</h2>
            <p style="margin-bottom: 1rem; font-size: 1.1rem;">${sections.overview.summary}</p>
            ${metrics.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem;">
                ${metrics.map(metric => {
                    const [key, value] = metric.split(':').map(s => s.trim());
                    return `
                    <div class="ghibli-metric">
                        <div style="font-weight: bold; color: #b8860b;">${key}</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: #daa520;">${value}</div>
                    </div>`;
                }).join('')}
            </div>` : ''}
        </div>`;
    }

    // Problem Section
    if (sections.problem.enabled) {
        html += `
        <div class="ghibli-section">
            <h2 class="ghibli-title">${sections.problem.title}</h2>
            <p style="font-size: 1.1rem;">${sections.problem.description}</p>
        </div>`;
    }

    // Process Section
    if (sections.process.enabled) {
        const steps = sections.process.steps ? sections.process.steps.split('\n').filter(s => s.trim()) : [];
        html += `
        <div class="ghibli-section">
            <h2 class="ghibli-title">${sections.process.title}</h2>
            <p style="margin-bottom: 1rem;">${sections.process.description}</p>
            ${steps.map((step, index) => `
            <div class="ghibli-step">
                <strong style="color: #006400;">Step ${index + 1}:</strong> ${step}
            </div>`).join('')}
        </div>`;
    }

    // Showcase Section
    if (sections.showcase.enabled) {
        const features = sections.showcase.features ? sections.showcase.features.split('\n').filter(f => f.trim()) : [];
        html += `
        <div class="ghibli-section">
            <h2 class="ghibli-title">${sections.showcase.title}</h2>
            <p style="margin-bottom: 1rem;">${sections.showcase.description}</p>
            ${features.map(feature => `
            <div style="background: #f5fffa; padding: 0.8rem; margin: 0.5rem 0; border-radius: 6px; border-left: 3px solid #32cd32;">
                ✨ ${feature}
            </div>`).join('')}
        </div>`;
    }

    // Gallery Section
    if (sections.gallery.enabled && sections.gallery.images && sections.gallery.images.length > 0) {
        html += `
        <div class="ghibli-section">
            <h2 class="ghibli-title">Gallery</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;">
                ${sections.gallery.images.slice(0, 6).map((image, index) => `
                <div style="aspect-ratio: 1; background: #f0fff0; border-radius: 6px; overflow: hidden; border: 2px solid #90ee90;">
                    <img src="${image}" alt="Gallery ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>`).join('')}
            </div>
        </div>`;
    }

    // Video Section
    if (sections.video.enabled && sections.video.url) {
        const getYouTubeEmbedUrl = (url: string) => {
            let videoId = '';
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname === 'youtu.be') {
                    videoId = urlObj.pathname.slice(1);
                } else if (urlObj.hostname.includes('youtube.com')) {
                    videoId = urlObj.searchParams.get('v') || '';
                }
                return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
            } catch (error) {
                return '';
            }
        };
        const embedUrl = getYouTubeEmbedUrl(sections.video.url);
        if (embedUrl) {
            html += `
            <div class="ghibli-section">
                <h2 class="ghibli-title">🎥 Demo Video</h2>
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 3px solid #90ee90;">
                    <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>
                </div>
                ${sections.video.caption ? `<p style="margin-top: 0.5rem; font-style: italic; color: #2d5016;">${sections.video.caption}</p>` : ''}
            </div>`;
        }
    }

    // Figma Section
    if (sections.figma.enabled && sections.figma.url) {
        let embedUrl = sections.figma.url;
        if (!embedUrl.includes('figma.com/embed') && (embedUrl.includes('figma.com/file/') || embedUrl.includes('figma.com/design/') || embedUrl.includes('figma.com/proto/'))) {
            embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(embedUrl)}`;
        }
        html += `
        <div class="ghibli-section">
            <h2 class="ghibli-title">🎨 Figma Prototype</h2>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 3px solid #90ee90;">
                <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" allowfullscreen></iframe>
            </div>
            ${sections.figma.caption ? `<p style="margin-top: 0.5rem; font-style: italic; color: #2d5016;">${sections.figma.caption}</p>` : ''}
        </div>`;
    }

    // Miro Section
    if (sections.miro.enabled && sections.miro.url) {
        let embedUrl = sections.miro.url;
        if (!embedUrl.includes('miro.com/app/live-embed') && embedUrl.includes('miro.com/app/board/')) {
            const boardIdMatch = embedUrl.match(/\/board\/([^\/\?]+)/);
            if (boardIdMatch) {
                const boardId = boardIdMatch[1];
                embedUrl = `https://miro.com/app/live-embed/${boardId}/?moveToViewport=-1000,-1000,2000,2000`;
            }
        }
        html += `
        <div class="ghibli-section">
            <h2 class="ghibli-title">📋 Miro Board</h2>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; border: 3px solid #90ee90;">
                <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" scrolling="no" allowfullscreen></iframe>
            </div>
            ${sections.miro.caption ? `<p style="margin-top: 0.5rem; font-style: italic; color: #2d5016;">${sections.miro.caption}</p>` : ''}
        </div>`;
    }

    // Document Section
    if (sections.document.enabled && sections.document.url) {
        html += `
        <div class="ghibli-section" style="text-align: center;">
            <h2 class="ghibli-title">📄 Project Documentation</h2>
            <a href="${sections.document.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(45deg, #32cd32, #228b22); color: white; padding: 1rem 2rem; border-radius: 25px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Document
            </a>
        </div>`;
    }

    // Links Section
    if (sections.links.enabled && sections.links.items && sections.links.items.trim()) {
        const links = sections.links.items.split('\n').filter(item => item.trim() && item.includes('|'));
        if (links.length > 0) {
            html += `
            <div class="ghibli-section">
                <h2 class="ghibli-title">🔗 ${sections.links.title || 'Related Links'}</h2>
                <div style="display: grid; gap: 0.8rem;">
                    ${links.map(item => {
                        const [name, url] = item.split('|').map(s => s.trim());
                        return `
                        <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #f0fff0; border: 2px solid #90ee90; border-radius: 8px; text-decoration: none; color: #2d5016; font-weight: 600; transition: all 0.2s;">
                            <span>${name}</span>
                            <svg style="width: 1.2rem; height: 1.2rem; color: #32cd32;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>`;
                    }).join('')}
                </div>
            </div>`;
        }
    }

    html += `</div>`;
    return html;
};

// ---------- HTML GENERATOR FOR MODERN TEMPLATE ---------- //
const generateModernHTML = (caseStudy: CaseStudy): string => {
    const { sections } = caseStudy;
    
    let html = `
    <style>
        .modern-preview {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #2d3748;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
        }
        .modern-hero {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
            padding: 3rem 2rem;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }
        .modern-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        .modern-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            margin: 1rem;
            padding: 2rem;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .modern-title {
            font-size: 1.8rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }
        .modern-metric {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin: 0.5rem;
            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.3);
        }
        .modern-step {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 1.2rem;
            margin: 0.8rem 0;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
        }
        .modern-feature {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            padding: 1.2rem;
            margin: 0.8rem 0;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            box-shadow: 0 4px 15px rgba(168, 237, 234, 0.3);
        }
    </style>
    <div class="modern-preview">`;

    // Hero Section
    if (sections.hero.enabled) {
        html += `
        <div class="modern-hero">
            <div style="position: relative; z-index: 1;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: 800; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${sections.hero.headline}</h1>
                <h2 style="font-size: 1.3rem; margin-bottom: 1.5rem; opacity: 0.9; font-weight: 400;">${sections.hero.subheading}</h2>
                <p style="font-size: 1.1rem; opacity: 0.8; max-width: 600px; margin: 0 auto; line-height: 1.6;">${sections.hero.text}</p>
            </div>
        </div>`;
    }

    // Overview Section
    if (sections.overview.enabled) {
        const metrics = sections.overview.metrics ? sections.overview.metrics.split('\n').filter(m => m.trim()) : [];
        html += `
        <div class="modern-section">
            <h2 class="modern-title">${sections.overview.title}</h2>
            <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6; color: #4a5568;">${sections.overview.summary}</p>
            ${metrics.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                ${metrics.map(metric => {
                    const [key, value] = metric.split(':').map(s => s.trim());
                    return `
                    <div class="modern-metric">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem;">${key}</div>
                        <div style="font-size: 1.8rem; font-weight: 800;">${value}</div>
                    </div>`;
                }).join('')}
            </div>` : ''}
        </div>`;
    }

    // Problem Section
    if (sections.problem.enabled) {
        html += `
        <div class="modern-section">
            <h2 class="modern-title">${sections.problem.title}</h2>
            <p style="font-size: 1.1rem; line-height: 1.6; color: #4a5568;">${sections.problem.description}</p>
        </div>`;
    }

    // Process Section
    if (sections.process.enabled) {
        const steps = sections.process.steps ? sections.process.steps.split('\n').filter(s => s.trim()) : [];
        html += `
        <div class="modern-section">
            <h2 class="modern-title">${sections.process.title}</h2>
            <p style="margin-bottom: 1.5rem; color: #4a5568;">${sections.process.description}</p>
            ${steps.map((step, index) => `
            <div class="modern-step">
                <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">Step ${index + 1}</div>
                <div style="opacity: 0.9;">${step}</div>
            </div>`).join('')}
        </div>`;
    }

    // Showcase Section
    if (sections.showcase.enabled) {
        const features = sections.showcase.features ? sections.showcase.features.split('\n').filter(f => f.trim()) : [];
        html += `
        <div class="modern-section">
            <h2 class="modern-title">${sections.showcase.title}</h2>
            <p style="margin-bottom: 1.5rem; color: #4a5568;">${sections.showcase.description}</p>
            ${features.map((feature, index) => `
            <div class="modern-feature">
                <div style="font-weight: 600; color: #667eea; margin-bottom: 0.5rem;">✨ Feature ${index + 1}</div>
                <div style="color: #4a5568;">${feature}</div>
            </div>`).join('')}
        </div>`;
    }

    // Gallery Section
    if (sections.gallery.enabled && sections.gallery.images && sections.gallery.images.length > 0) {
        html += `
        <div class="modern-section">
            <h2 class="modern-title">Gallery</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                ${sections.gallery.images.slice(0, 6).map((image, index) => `
                <div style="aspect-ratio: 1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <img src="${image}" alt="Gallery ${index + 1}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>`).join('')}
            </div>
        </div>`;
    }

    // Video Section
    if (sections.video.enabled && sections.video.url) {
        const getYouTubeEmbedUrl = (url: string) => {
            let videoId = '';
            try {
                const urlObj = new URL(url);
                if (urlObj.hostname === 'youtu.be') {
                    videoId = urlObj.pathname.slice(1);
                } else if (urlObj.hostname.includes('youtube.com')) {
                    videoId = urlObj.searchParams.get('v') || '';
                }
                return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
            } catch (error) {
                return '';
            }
        };
        const embedUrl = getYouTubeEmbedUrl(sections.video.url);
        if (embedUrl) {
            html += `
            <div class="modern-section">
                <h2 class="modern-title">🎥 Demo Video</h2>
                <div style="aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                    <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
                </div>
                ${sections.video.caption ? `<p style="margin-top: 1rem; color: #718096; font-style: italic;">${sections.video.caption}</p>` : ''}
            </div>`;
        }
    }

    // Figma Section
    if (sections.figma.enabled && sections.figma.url) {
        let embedUrl = sections.figma.url;
        if (!embedUrl.includes('figma.com/embed') && (embedUrl.includes('figma.com/file/') || embedUrl.includes('figma.com/design/') || embedUrl.includes('figma.com/proto/'))) {
            embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(embedUrl)}`;
        }
        html += `
        <div class="modern-section">
            <h2 class="modern-title">🎨 Figma Prototype</h2>
            <div style="aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
            </div>
            ${sections.figma.caption ? `<p style="margin-top: 1rem; color: #718096; font-style: italic;">${sections.figma.caption}</p>` : ''}
        </div>`;
    }

    // Miro Section
    if (sections.miro.enabled && sections.miro.url) {
        let embedUrl = sections.miro.url;
        if (!embedUrl.includes('miro.com/app/live-embed') && embedUrl.includes('miro.com/app/board/')) {
            const boardIdMatch = embedUrl.match(/\/board\/([^\/\?]+)/);
            if (boardIdMatch) {
                const boardId = boardIdMatch[1];
                embedUrl = `https://miro.com/app/live-embed/${boardId}/?moveToViewport=-1000,-1000,2000,2000`;
            }
        }
        html += `
        <div class="modern-section">
            <h2 class="modern-title">📋 Miro Board</h2>
            <div style="aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">
                <iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" frameborder="0" scrolling="no" allowfullscreen></iframe>
            </div>
            ${sections.miro.caption ? `<p style="margin-top: 1rem; color: #718096; font-style: italic;">${sections.miro.caption}</p>` : ''}
        </div>`;
    }

    // Document Section
    if (sections.document.enabled && sections.document.url) {
        html += `
        <div class="modern-section" style="text-align: center;">
            <h2 class="modern-title">📄 Project Documentation</h2>
            <a href="${sections.document.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.2rem 2.5rem; border-radius: 50px; text-decoration: none; font-weight: 600; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); transition: all 0.3s; font-size: 1.1rem;">
                <svg style="width: 1.5rem; height: 1.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Document
            </a>
        </div>`;
    }

    // Links Section
    if (sections.links.enabled && sections.links.items && sections.links.items.trim()) {
        const links = sections.links.items.split('\n').filter(item => item.trim() && item.includes('|'));
        if (links.length > 0) {
            html += `
            <div class="modern-section">
                <h2 class="modern-title">🔗 ${sections.links.title || 'Related Links'}</h2>
                <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                    ${links.map(item => {
                        const [name, url] = item.split('|').map(s => s.trim());
                        return `
                        <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 1.2rem; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(102, 126, 234, 0.2); border-radius: 12px; text-decoration: none; color: #2d3748; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <span style="background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">${name}</span>
                            <svg style="width: 1.2rem; height: 1.2rem; color: #667eea;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>`;
                    }).join('')}
                </div>
            </div>`;
        }
    }

    html += `</div>`;
    return html;
};

export default AdminPage;