import React, { useState, useEffect } from 'react';
import { MyJourney, JourneyItem } from '../types';
import { api } from '../services/api';
import { ulid } from 'ulid';

interface JourneyManagerProps {
    onClose: () => void;
}

const JourneyManager: React.FC<JourneyManagerProps> = ({ onClose }) => {
    const [journeyData, setJourneyData] = useState<MyJourney | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<string | null>(null);

    useEffect(() => {
        fetchJourneyData();
    }, []);

    const fetchJourneyData = async () => {
        setIsLoading(true);
        try {
            const journey = await api.getMyJourney();
            setJourneyData(journey);
        } catch (error) {
            console.error('Failed to fetch journey data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!journeyData) return;
        
        setIsSaving(true);
        try {
            await api.updateMyJourney(journeyData);
            alert('My Journey updated successfully!');
            // Refetch the data to show what was saved
            await fetchJourneyData();
            // Don't close immediately - let user see the saved data
            // onClose();
        } catch (error) {
            console.error('Failed to save journey:', error);
            alert('Failed to save journey. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateBasicInfo = (field: 'title' | 'subtitle', value: string) => {
        if (!journeyData) return;
        setJourneyData({ ...journeyData, [field]: value });
    };

    const addNewItem = () => {
        if (!journeyData) return;
        
        const newItem: JourneyItem = {
            id: ulid(),
            title: 'New Position',
            company: 'Company Name',
            period: '2024 - Present',
            description: 'Description of your role and achievements...',
            isActive: false
        };
        
        setJourneyData({
            ...journeyData,
            items: [...journeyData.items, newItem]
        });
        setEditingItem(newItem.id);
    };

    const updateItem = (itemId: string, updates: Partial<JourneyItem>) => {
        if (!journeyData) return;
        
        setJourneyData({
            ...journeyData,
            items: journeyData.items.map(item => 
                item.id === itemId ? { ...item, ...updates } : item
            )
        });
    };

    const deleteItem = (itemId: string) => {
        if (!journeyData) return;
        
        setJourneyData({
            ...journeyData,
            items: journeyData.items.filter(item => item.id !== itemId)
        });
    };

    const moveItem = (itemId: string, direction: 'up' | 'down') => {
        if (!journeyData) return;
        
        const items = [...journeyData.items];
        const index = items.findIndex(item => item.id === itemId);
        
        if (direction === 'up' && index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
        } else if (direction === 'down' && index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
        }
        
        setJourneyData({ ...journeyData, items });
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Loading journey data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!journeyData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">Failed to load journey data.</p>
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Journey Management</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* Basic Info */}
                    <div className="mb-8 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={journeyData.title}
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
                                value={journeyData.subtitle}
                                onChange={(e) => updateBasicInfo('subtitle', e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Journey Items */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Career Milestones
                            </h3>
                            <button
                                onClick={addNewItem}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Milestone
                            </button>
                        </div>

                        <div className="space-y-4">
                            {journeyData.items.map((item, index) => (
                                <div key={item.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    {editingItem === item.id ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                                    placeholder="Position Title"
                                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={item.company}
                                                    onChange={(e) => updateItem(item.id, { company: e.target.value })}
                                                    placeholder="Company Name"
                                                    className="p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={item.period}
                                                onChange={(e) => updateItem(item.id, { period: e.target.value })}
                                                placeholder="Time Period (e.g., 2020 - 2023)"
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                            />
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                                placeholder="Description of your role and achievements..."
                                                rows={3}
                                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                                            />
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isActive}
                                                        onChange={(e) => updateItem(item.id, { isActive: e.target.checked })}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Current Position</span>
                                                </label>
                                                <button
                                                    onClick={() => setEditingItem(null)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {item.title}
                                                    </h4>
                                                    {item.isActive && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                                                    {item.company} • {item.period}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 ml-4">
                                                <button
                                                    onClick={() => moveItem(item.id, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => moveItem(item.id, 'down')}
                                                    disabled={index === journeyData.items.length - 1}
                                                    className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem(item.id)}
                                                    className="p-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
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

export default JourneyManager;