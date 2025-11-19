import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ProfileSettingsManager: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [publicUrl, setPublicUrl] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await api.getProfileSettings();
            if (profile) {
                setUsername(profile.username || '');
                setIsPublic(profile.is_portfolio_public ?? true);
                setName(profile.name || '');
                setEmail(profile.email || '');
                updatePublicUrl(profile.username);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            
            // Check if it's an authentication error
            if (error.message?.includes('not authenticated') || error.message?.includes('Auth session missing')) {
                setMessage({ 
                    type: 'error', 
                    text: 'Please log in to manage your profile settings. Redirecting to login...' 
                });
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 2000);
            } else {
                // For any other error, show a generic message with retry option
                setMessage({ 
                    type: 'error', 
                    text: `Failed to load profile settings: ${error.message}. The system will try to create your profile automatically.` 
                });
                
                // Try to create initial profile for any error (not just "No rows returned")
                try {
                    await createInitialProfile();
                } catch (createError) {
                    console.error('Failed to create initial profile:', createError);
                    setMessage({ 
                        type: 'error', 
                        text: 'Unable to set up your profile. Please try refreshing the page or contact support.' 
                    });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const createInitialProfile = async () => {
        try {
            console.log('🔧 Attempting to create initial profile...');
            
            // Try to create a basic profile using updateProfileSettings
            // This will trigger the profile creation logic in the API
            const defaultUsername = `user${Date.now().toString().slice(-6)}`;
            
            setMessage({ 
                type: 'error', 
                text: 'Creating your profile, please wait...' 
            });
            
            await api.updateProfileSettings({
                username: defaultUsername,
                is_portfolio_public: true
            });
            
            console.log('✅ Profile created successfully');
            
            // Reload profile after creation
            setLoading(true);
            setMessage(null);
            await loadProfile();
            
            setMessage({ 
                type: 'success', 
                text: 'Profile created successfully! You can now update your username and settings.' 
            });
        } catch (error) {
            console.error('Error creating initial profile:', error);
            setMessage({ 
                type: 'error', 
                text: `Failed to create profile: ${error.message}. Please try refreshing the page.` 
            });
        }
    };

    const updatePublicUrl = (user: string) => {
        if (user) {
            const baseUrl = window.location.origin;
            setPublicUrl(`${baseUrl}/u/${user}`);
        }
    };

    const handleUsernameChange = (value: string) => {
        // Only allow lowercase letters, numbers, hyphens, underscores
        const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        setUsername(sanitized);
        updatePublicUrl(sanitized);
    };

    const handleSave = async () => {
        if (!username.trim()) {
            setMessage({ type: 'error', text: 'Username is required' });
            return;
        }

        if (username.length < 3) {
            setMessage({ type: 'error', text: 'Username must be at least 3 characters' });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            await api.updateProfileSettings({
                username: username.trim(),
                is_portfolio_public: isPublic
            });
            setMessage({ type: 'success', text: 'Profile settings saved successfully!' });
            updatePublicUrl(username.trim());
        } catch (error: any) {
            console.error('Error saving profile:', error);
            if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
                setMessage({ type: 'error', text: 'Username already taken. Please choose another.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
            }
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openPublicUrl = () => {
        window.open(publicUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Public Profile Settings
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage your public portfolio URL and visibility
                        </p>
                    </div>
                    <div className="text-4xl">🌐</div>
                </div>
                
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-blue-800 dark:text-blue-300">
                            Loading your profile settings...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Public Profile Settings
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your public portfolio URL and visibility
                    </p>
                </div>
                <div className="text-4xl">🌐</div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}>
                    <div className="flex items-center">
                        <span className="mr-2">{message.type === 'success' ? '✅' : '❌'}</span>
                        {message.text}
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Profile Info (Read-only) */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Account Information
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Name:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Email:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>
                        </div>
                    </div>
                </div>

                {/* Username */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Username <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 text-lg">/u/</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="yourusername"
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            maxLength={30}
                        />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Only lowercase letters, numbers, hyphens, and underscores. Min 3 characters.
                    </p>
                </div>

                {/* Public URL Preview */}
                {username && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <label className="block text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            Your Public Portfolio URL
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={publicUrl}
                                readOnly
                                className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-lg text-blue-600 dark:text-blue-400 font-mono text-sm"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={openPublicUrl}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-external-link-alt"></i>
                                Open
                            </button>
                        </div>
                    </div>
                )}

                {/* Public/Private Toggle */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                Portfolio Visibility
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isPublic 
                                    ? 'Your portfolio is public. Anyone can view it without login.' 
                                    : 'Your portfolio is private. Only you can access it.'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                                isPublic ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                    isPublic ? 'translate-x-9' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{isPublic ? '🌍' : '🔒'}</span>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                    {isPublic ? 'Public Portfolio' : 'Private Portfolio'}
                                </h4>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    {isPublic ? (
                                        <>
                                            <li>✅ Visible to everyone without login</li>
                                            <li>✅ Shareable URL for recruiters and clients</li>
                                            <li>✅ SEO-friendly and discoverable</li>
                                            <li>✅ You can still edit via admin panel</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>🔒 Only you can access your portfolio</li>
                                            <li>🔒 Public URL returns "Not Found"</li>
                                            <li>🔒 Not visible to search engines</li>
                                            <li>🔒 You can make it public anytime</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={loadProfile}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Reset Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !username.trim()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                    <i className="fas fa-lightbulb"></i>
                    Tips for Your Public Portfolio
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                    <li>• Choose a professional username (e.g., your name or brand)</li>
                    <li>• Keep it short and memorable</li>
                    <li>• Share your public URL on LinkedIn, resume, and email signature</li>
                    <li>• You can change your username anytime</li>
                    <li>• Toggle visibility to private if you need to hide your portfolio temporarily</li>
                </ul>
            </div>
        </div>
    );
};

export default ProfileSettingsManager;
