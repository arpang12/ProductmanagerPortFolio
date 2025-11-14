import React, { useState, useEffect, useRef } from 'react';
import { MagicToolbox, SkillCategory, Tool, Skill } from '../types';
import { api } from '../services/api';
import { ulid } from 'ulid';
import { resizeImage, validateImageFile } from '../utils/imageResizer';

interface MagicToolboxManagerProps {
    onClose: () => void;
}

// Predefined tool categories for business consultants, tech, and presentations
const PRESET_CATEGORIES = {
    consulting: {
        title: 'Business Consulting',
        icon: '💼',
        color: '#3B82F6',
        skills: ['Strategic Planning', 'Market Analysis', 'Process Optimization', 'Stakeholder Management']
    },
    technical: {
        title: 'Technical Skills',
        icon: '⚙️',
        color: '#10B981',
        skills: ['Data Analysis', 'System Design', 'API Integration', 'Cloud Architecture']
    },
    presentation: {
        title: 'Presentation & Communication',
        icon: '🎯',
        color: '#F59E0B',
        skills: ['Public Speaking', 'Visual Storytelling', 'Executive Presentations', 'Workshop Facilitation']
    },
    analytics: {
        title: 'Analytics & Insights',
        icon: '📊',
        color: '#8B5CF6',
        skills: ['Business Intelligence', 'KPI Development', 'Reporting', 'Predictive Modeling']
    }
};

const PRESET_TOOLS = [
    // Consulting Tools
    { name: 'PowerPoint', icon: '📊', color: '#D24726', category: 'presentation' },
    { name: 'Excel', icon: '📈', color: '#217346', category: 'analytics' },
    { name: 'Tableau', icon: '📉', color: '#E97627', category: 'analytics' },
    { name: 'Power BI', icon: '📊', color: '#F2C811', category: 'analytics' },
    
    // Tech Tools
    { name: 'Python', icon: '🐍', color: '#3776AB', category: 'technical' },
    { name: 'SQL', icon: '🗄️', color: '#CC2927', category: 'technical' },
    { name: 'AWS', icon: '☁️', color: '#FF9900', category: 'technical' },
    { name: 'Azure', icon: '☁️', color: '#0078D4', category: 'technical' },
    { name: 'Docker', icon: '🐳', color: '#2496ED', category: 'technical' },
    { name: 'Git', icon: '🔀', color: '#F05032', category: 'technical' },
    
    // Presentation Tools
    { name: 'Figma', icon: '🎨', color: '#F24E1E', category: 'presentation' },
    { name: 'Canva', icon: '🎨', color: '#00C4CC', category: 'presentation' },
    { name: 'Miro', icon: '🗂️', color: '#FFD02F', category: 'presentation' },
    { name: 'Notion', icon: '📝', color: '#000000', category: 'presentation' },
    
    // Business Tools
    { name: 'Salesforce', icon: '☁️', color: '#00A1E0', category: 'consulting' },
    { name: 'Jira', icon: '📋', color: '#0052CC', category: 'consulting' },
    { name: 'Slack', icon: '💬', color: '#4A154B', category: 'consulting' },
    { name: 'Teams', icon: '👥', color: '#6264A7', category: 'consulting' }
];

const MagicToolboxManager: React.FC<MagicToolboxManagerProps> = ({ onClose }) => {
    const [toolboxData, setToolboxData] = useState<MagicToolbox | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'skills' | 'tools'>('skills');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingTool, setEditingTool] = useState<string | null>(null);
    const [showPresets, setShowPresets] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    
    const categoryImageInputRef = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const toolImageInputRef = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        fetchToolboxData();
    }, []);

    const fetchToolboxData = async () => {
        setIsLoading(true);
        try {
            const toolbox = await api.getMagicToolbox();
            setToolboxData(toolbox);
        } catch (error) {
            console.error('Failed to fetch toolbox data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!toolboxData) return;
        
        setIsSaving(true);
        try {
            await api.updateMagicToolbox(toolboxData);
            alert('Magic Toolbox updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to save toolbox:', error);
            alert('Failed to save toolbox. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateBasicInfo = (field: 'title' | 'subtitle', value: string) => {
        if (!toolboxData) return;
        setToolboxData({ ...toolboxData, [field]: value });
    };

    const addCategory = () => {
        if (!toolboxData) return;
        const newCategory: SkillCategory = {
            id: ulid(),
            title: 'New Category',
            icon: '⭐',
            color: '#6366F1',
            skills: []
        };
        setToolboxData({
            ...toolboxData,
            categories: [...toolboxData.categories, newCategory]
        });
        setEditingCategory(newCategory.id);
    };

    const updateCategory = (categoryId: string, updates: Partial<SkillCategory>) => {
        if (!toolboxData) return;
        setToolboxData({
            ...toolboxData,
            categories: toolboxData.categories.map(cat =>
                cat.id === categoryId ? { ...cat, ...updates } : cat
            )
        });
    };

    const deleteCategory = (categoryId: string) => {
        if (!toolboxData) return;
        if (!confirm('Delete this category?')) return;
        setToolboxData({
            ...toolboxData,
            categories: toolboxData.categories.filter(cat => cat.id !== categoryId)
        });
    };

    const addSkill = (categoryId: string) => {
        if (!toolboxData) return;
        const newSkill: Skill = {
            id: ulid(),
            name: 'New Skill',
            level: 50
        };
        setToolboxData({
            ...toolboxData,
            categories: toolboxData.categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, skills: [...cat.skills, newSkill] }
                    : cat
            )
        });
    };

    const updateSkill = (categoryId: string, skillId: string, updates: Partial<Skill>) => {
        if (!toolboxData) return;
        setToolboxData({
            ...toolboxData,
            categories: toolboxData.categories.map(cat =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        skills: cat.skills.map(skill =>
                            skill.id === skillId ? { ...skill, ...updates } : skill
                        )
                    }
                    : cat
            )
        });
    };

    const deleteSkill = (categoryId: string, skillId: string) => {
        if (!toolboxData) return;
        setToolboxData({
            ...toolboxData,
            categories: toolboxData.categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, skills: cat.skills.filter(skill => skill.id !== skillId) }
                    : cat
            )
        });
    };

    const addTool = () => {
        if (!toolboxData) return;
        const newTool: Tool = {
            id: ulid(),
            name: 'New Tool',
            icon: '🔧',
            color: '#6366F1'
        };
        setToolboxData({
            ...toolboxData,
            tools: [...toolboxData.tools, newTool]
        });
        setEditingTool(newTool.id);
    };

    const updateTool = (toolId: string, updates: Partial<Tool>) => {
        if (!toolboxData) return;
        setToolboxData({
            ...toolboxData,
            tools: toolboxData.tools.map(tool =>
                tool.id === toolId ? { ...tool, ...updates } : tool
            )
        });
    };

    const deleteTool = (toolId: string) => {
        if (!toolboxData) return;
        if (!confirm('Delete this tool?')) return;
        setToolboxData({
            ...toolboxData,
            tools: toolboxData.tools.filter(tool => tool.id !== toolId)
        });
    };

    const loadPresetCategory = (presetKey: keyof typeof PRESET_CATEGORIES) => {
        if (!toolboxData) return;
        const preset = PRESET_CATEGORIES[presetKey];
        const newCategory: SkillCategory = {
            id: ulid(),
            title: preset.title,
            icon: preset.icon,
            color: preset.color,
            skills: preset.skills.map(skillName => ({
                id: ulid(),
                name: skillName,
                level: 70
            }))
        };
        setToolboxData({
            ...toolboxData,
            categories: [...toolboxData.categories, newCategory]
        });
        setShowPresets(false);
    };

    const loadPresetTools = () => {
        if (!toolboxData) return;
        const newTools = PRESET_TOOLS.map(tool => ({
            id: ulid(),
            name: tool.name,
            icon: tool.icon,
            color: tool.color
        }));
        setToolboxData({
            ...toolboxData,
            tools: [...toolboxData.tools, ...newTools]
        });
        setShowPresets(false);
    };

    const handleCategoryImageUpload = async (categoryId: string, file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setUploadingImage(categoryId);
        try {
            const resizedImage = await resizeImage(file, {
                maxWidth: 128,
                maxHeight: 128,
                quality: 0.9,
                format: 'png'
            });
            
            updateCategory(categoryId, { iconUrl: resizedImage, icon: '' });
        } catch (error) {
            console.error('Failed to process image:', error);
            alert('Failed to process image. Please try again.');
        } finally {
            setUploadingImage(null);
        }
    };

    const handleToolImageUpload = async (toolId: string, file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setUploadingImage(toolId);
        try {
            const resizedImage = await resizeImage(file, {
                maxWidth: 128,
                maxHeight: 128,
                quality: 0.9,
                format: 'png'
            });
            
            updateTool(toolId, { iconUrl: resizedImage, icon: '' });
        } catch (error) {
            console.error('Failed to process image:', error);
            alert('Failed to process image. Please try again.');
        } finally {
            setUploadingImage(null);
        }
    };

    const removeCategoryImage = (categoryId: string) => {
        updateCategory(categoryId, { iconUrl: undefined, icon: '⭐' });
    };

    const removeToolImage = (toolId: string) => {
        updateTool(toolId, { iconUrl: undefined, icon: '🔧' });
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Loading toolbox data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!toolboxData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">Failed to load toolbox data.</p>
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Magic Toolbox Management</h2>
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
                                    value={toolboxData.title}
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
                                    value={toolboxData.subtitle}
                                    onChange={(e) => updateBasicInfo('subtitle', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'skills'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            Skill Categories
                        </button>
                        <button
                            onClick={() => setActiveTab('tools')}
                            className={`px-4 py-2 font-medium transition-colors ${
                                activeTab === 'tools'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            Tools & Technologies
                        </button>
                    </div>

                    {/* Skills Tab */}
                    {activeTab === 'skills' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Skill Categories
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowPresets(!showPresets)}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                                    >
                                        📦 Load Presets
                                    </button>
                                    <button
                                        onClick={addCategory}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                                    >
                                        + Add Category
                                    </button>
                                </div>
                            </div>

                            {/* Preset Options */}
                            {showPresets && (
                                <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                                        Choose a preset category:
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(PRESET_CATEGORIES).map(([key, preset]) => (
                                            <button
                                                key={key}
                                                onClick={() => loadPresetCategory(key as keyof typeof PRESET_CATEGORIES)}
                                                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl">{preset.icon}</span>
                                                    <span className="font-medium text-sm">{preset.title}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories List */}
                            {toolboxData.categories.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No categories yet. Add one or load presets!
                                </div>
                            ) : (
                                toolboxData.categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            {/* Icon/Image Display */}
                                            <div className="relative group">
                                                {category.iconUrl ? (
                                                    <div className="relative w-12 h-12">
                                                        <img
                                                            src={category.iconUrl}
                                                            alt={category.title}
                                                            className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600"
                                                        />
                                                        <button
                                                            onClick={() => removeCategoryImage(category.id)}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Remove image"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={category.icon}
                                                        onChange={(e) => updateCategory(category.id, { icon: e.target.value })}
                                                        className="w-12 h-12 text-center text-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                                                        placeholder="🎯"
                                                    />
                                                )}
                                                <input
                                                    ref={(el) => categoryImageInputRef.current[category.id] = el}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleCategoryImageUpload(category.id, file);
                                                    }}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => categoryImageInputRef.current[category.id]?.click()}
                                                    disabled={uploadingImage === category.id}
                                                    className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-blue-600 disabled:opacity-50"
                                                    title="Upload custom image"
                                                >
                                                    {uploadingImage === category.id ? '⏳' : '📷'}
                                                </button>
                                            </div>

                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={category.title}
                                                    onChange={(e) => updateCategory(category.id, { title: e.target.value })}
                                                    className="w-full p-2 mb-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                                                    placeholder="Category Title"
                                                />
                                                <input
                                                    type="color"
                                                    value={category.color}
                                                    onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                                                    className="w-20 h-8 rounded cursor-pointer"
                                                />
                                            </div>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="text-red-500 hover:text-red-700 text-xl"
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        {/* Skills in Category */}
                                        <div className="space-y-2 ml-14">
                                            {category.skills.map((skill) => (
                                                <div key={skill.id} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={skill.name}
                                                        onChange={(e) => updateSkill(category.id, skill.id, { name: e.target.value })}
                                                        className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
                                                        placeholder="Skill name"
                                                    />
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={skill.level}
                                                        onChange={(e) => updateSkill(category.id, skill.id, { level: parseInt(e.target.value) })}
                                                        className="w-24"
                                                    />
                                                    <span className="text-sm w-10 text-gray-600 dark:text-gray-400">
                                                        {skill.level}%
                                                    </span>
                                                    <button
                                                        onClick={() => deleteSkill(category.id, skill.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addSkill(category.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            >
                                                + Add Skill
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tools Tab */}
                    {activeTab === 'tools' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    Tools & Technologies
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={loadPresetTools}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                                    >
                                        📦 Load All Presets
                                    </button>
                                    <button
                                        onClick={addTool}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                                    >
                                        + Add Tool
                                    </button>
                                </div>
                            </div>

                            {/* Tools Grid */}
                            {toolboxData.tools.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No tools yet. Add one or load presets!
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {toolboxData.tools.map((tool) => (
                                        <div
                                            key={tool.id}
                                            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 relative group"
                                        >
                                            <button
                                                onClick={() => deleteTool(tool.id)}
                                                className="absolute top-1 right-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                ×
                                            </button>
                                            <div className="flex flex-col items-center gap-2">
                                                {/* Icon/Image Display */}
                                                <div className="relative group/icon">
                                                    {tool.iconUrl ? (
                                                        <div className="relative w-16 h-16">
                                                            <img
                                                                src={tool.iconUrl}
                                                                alt={tool.name}
                                                                className="w-16 h-16 object-cover rounded border border-gray-300 dark:border-gray-600"
                                                            />
                                                            <button
                                                                onClick={() => removeToolImage(tool.id)}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover/icon:opacity-100 transition-opacity"
                                                                title="Remove image"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={tool.icon}
                                                            onChange={(e) => updateTool(tool.id, { icon: e.target.value })}
                                                            className="w-16 h-16 text-center text-3xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                                                            placeholder="🔧"
                                                        />
                                                    )}
                                                    <input
                                                        ref={(el) => toolImageInputRef.current[tool.id] = el}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleToolImageUpload(tool.id, file);
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <button
                                                        onClick={() => toolImageInputRef.current[tool.id]?.click()}
                                                        disabled={uploadingImage === tool.id}
                                                        className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 disabled:opacity-50"
                                                        title="Upload custom image"
                                                    >
                                                        {uploadingImage === tool.id ? '⏳' : '📷'}
                                                    </button>
                                                </div>

                                                <input
                                                    type="text"
                                                    value={tool.name}
                                                    onChange={(e) => updateTool(tool.id, { name: e.target.value })}
                                                    className="w-full p-1 text-center text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                                                    placeholder="Tool name"
                                                />
                                                <input
                                                    type="color"
                                                    value={tool.color}
                                                    onChange={(e) => updateTool(tool.id, { color: e.target.value })}
                                                    className="w-full h-6 rounded cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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

export default MagicToolboxManager;