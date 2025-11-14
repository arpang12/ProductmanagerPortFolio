import React from 'react';

interface IconDisplayProps {
    icon?: string;
    iconUrl?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Adaptive icon display component
 * Automatically handles emoji icons or custom uploaded images
 * with proper sizing and styling
 */
const IconDisplay: React.FC<IconDisplayProps> = ({
    icon,
    iconUrl,
    alt = 'Icon',
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xl',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-16 h-16 text-4xl'
    };

    const baseClasses = `flex items-center justify-center rounded ${sizeClasses[size]} ${className}`;

    if (iconUrl) {
        return (
            <div className={baseClasses}>
                <img
                    src={iconUrl}
                    alt={alt}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                />
            </div>
        );
    }

    if (icon) {
        return (
            <div className={baseClasses}>
                <span role="img" aria-label={alt}>
                    {icon}
                </span>
            </div>
        );
    }

    // Fallback
    return (
        <div className={`${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-400`}>
            <span>?</span>
        </div>
    );
};

export default IconDisplay;
