import React, { useState } from 'react';

interface EmbedHelpProps {
    embedType: 'figma' | 'youtube' | 'miro';
}

export const EmbedHelp: React.FC<EmbedHelpProps> = ({ embedType }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getInstructions = () => {
        switch (embedType) {
            case 'figma':
                return {
                    title: 'How to get Figma embed URL',
                    steps: [
                        'Open your Figma file',
                        'Click the "Share" button in the top right',
                        'Click "Embed" tab',
                        'Copy the embed URL (starts with https://www.figma.com/embed)',
                        'Paste it in the URL field above'
                    ],
                    example: 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F...'
                };
            case 'youtube':
                return {
                    title: 'YouTube URL formats supported',
                    steps: [
                        'Regular YouTube watch URL: https://www.youtube.com/watch?v=VIDEO_ID',
                        'YouTube share URL: https://youtu.be/VIDEO_ID',
                        'Both formats work automatically',
                        'The video will be embedded with privacy-enhanced mode'
                    ],
                    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                };
            case 'miro':
                return {
                    title: 'How to get Miro embed URL',
                    steps: [
                        'Open your Miro board',
                        'Click the "Share" button',
                        'Go to "Embed" section',
                        'Copy the embed URL (contains miro.com/app/live-embed)',
                        'Paste it in the URL field above'
                    ],
                    example: 'https://miro.com/app/live-embed/uXjVOcKGjZo=/?moveToViewport=-1234,-5678,2468,1357'
                };
            default:
                return { title: '', steps: [], example: '' };
        }
    };

    const instructions = getInstructions();

    return (
        <div className="mt-2">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-xs text-blue-500 hover:text-blue-700 underline flex items-center gap-1"
            >
                <span>ℹ️</span>
                Need help?
            </button>
            
            {isOpen && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        {instructions.title}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300 mb-3">
                        {instructions.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                    {instructions.example && (
                        <div>
                            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Example:</p>
                            <code className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded break-all">
                                {instructions.example}
                            </code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};