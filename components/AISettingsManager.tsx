import React, { useState, useEffect } from 'react';
import { AISettings, GeminiModel } from '../types';
import { api } from '../services/api';
import { geminiService } from '../services/geminiService';

interface AISettingsManagerProps {
    onClose: () => void;
}

const AISettingsManager: React.FC<AISettingsManagerProps> = ({ onClose }) => {
    const [settings, setSettings] = useState<AISettings | null>(null);
    const [models, setModels] = useState<GeminiModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [tempApiKey, setTempApiKey] = useState('');
    const [tempModel, setTempModel] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [settingsData, modelsData] = await Promise.all([
                api.getAISettings(),
                geminiService.getAvailableModels()
            ]);
            setSettings(settingsData);
            setModels(modelsData);
            // Keep empty for security, but we'll show a placeholder in the UI
            setTempApiKey('');
            setTempModel(settingsData.selectedModel);
        } catch (error) {
            console.error('Failed to fetch AI settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConnection = async () => {
        if (!tempApiKey.trim()) {
            setTestResult({ success: false, message: 'Please enter an API key first' });
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const result = await geminiService.testConnection(tempApiKey, tempModel);
            setTestResult(result);
        } catch (error) {
            setTestResult({
                success: false,
                message: 'Connection test failed. Please check your settings.'
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        // If API key is empty and already configured, user wants to keep existing key
        if (!tempApiKey.trim() && settings.isConfigured) {
            // Just update the model, keep existing API key
            setIsSaving(true);
            try {
                const updatedSettings = await api.updateAISettings({
                    ...settings,
                    selectedModel: tempModel
                    // Don't send apiKey, backend will keep existing one
                });
                setSettings(updatedSettings);
                await geminiService.refreshSettings();
                alert('AI settings updated successfully!');
                onClose();
            } catch (error) {
                console.error('Failed to save AI settings:', error);
                alert('Failed to save settings. Please try again.');
            } finally {
                setIsSaving(false);
            }
            return;
        }

        // If API key is provided, update it
        if (!tempApiKey.trim()) {
            alert('Please enter an API key');
            return;
        }

        setIsSaving(true);
        try {
            const updatedSettings = await api.updateAISettings({
                ...settings,
                apiKey: tempApiKey,
                selectedModel: tempModel
            });
            setSettings(updatedSettings);
            await geminiService.refreshSettings();
            alert('AI settings saved successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to save AI settings:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3">Loading AI settings...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">AI Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {/* API Key Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Google Gemini API Configuration
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    API Key {settings?.isConfigured && <span className="text-green-600 dark:text-green-400 text-xs ml-2">✓ Saved</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={tempApiKey}
                                        onChange={(e) => setTempApiKey(e.target.value)}
                                        placeholder={settings?.isConfigured ? "API key is saved (enter new key to update)" : "Enter your Gemini API key"}
                                        className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showApiKey ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {settings?.isConfigured ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        🔒 Your API key is securely stored. Leave empty to keep current key, or enter a new one to update.
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Get your API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Model Selection
                                </label>
                                <select
                                    value={tempModel}
                                    onChange={(e) => setTempModel(e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    {models.map((model) => (
                                        <option key={model.id} value={model.id}>
                                            {model.name} {model.isRecommended ? '(Recommended)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {models.find(m => m.id === tempModel) && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {models.find(m => m.id === tempModel)?.description}
                                    </p>
                                )}
                            </div>

                            {/* Test Connection */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !tempApiKey.trim()}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isTesting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Test Connection
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Test Result */}
                            {testResult && (
                                <div className={`p-4 rounded-lg ${
                                    testResult.success 
                                        ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                                        : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                                }`}>
                                    <div className="flex items-start gap-2">
                                        {testResult.success ? (
                                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                        <p className="text-sm">{testResult.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Status */}
                    {settings && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Current Status</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Configuration Status:</span>
                                    <span className={`font-medium ${
                                        settings.isConfigured 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {settings.isConfigured ? 'Configured' : 'Not Configured'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Selected Model:</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {models.find(m => m.id === settings.selectedModel)?.name || settings.selectedModel}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                        {new Date(settings.lastUpdated).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Usage Guidelines */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Usage Guidelines</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• AI enhancement is used for content generation and improvement</li>
                            <li>• Your API key is encrypted and stored securely</li>
                            <li>• Different models have varying capabilities and token limits</li>
                            <li>• Test your connection before saving to ensure proper setup</li>
                        </ul>
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
                            disabled={isSaving || (!tempApiKey.trim() && !settings?.isConfigured)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISettingsManager;