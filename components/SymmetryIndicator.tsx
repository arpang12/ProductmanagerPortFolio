import React from 'react';
import { useDataSymmetry } from '../hooks/useDataSymmetry';

interface SymmetryIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

const SymmetryIndicator: React.FC<SymmetryIndicatorProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { symmetryStatus, checkSymmetry, ensureSymmetry } = useDataSymmetry();

  if (symmetryStatus.isChecking) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-600">Checking sync...</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Sync Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          symmetryStatus.isSymmetric 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-red-500'
        }`}></div>
        <span className={`text-sm font-medium ${
          symmetryStatus.isSymmetric 
            ? 'text-green-700' 
            : 'text-red-700'
        }`}>
          {symmetryStatus.isSymmetric ? 'Synced' : 'Sync Issues'}
        </span>
        
        {/* Sync Button */}
        <button
          onClick={checkSymmetry}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title="Check sync status"
        >
          🔄
        </button>
      </div>

      {/* Detailed Status */}
      {showDetails && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Auth: {symmetryStatus.authenticatedCount} items</span>
            <span>Public: {symmetryStatus.publicCount} items</span>
          </div>
          
          {symmetryStatus.lastChecked && (
            <div className="text-gray-500 mt-1">
              Last checked: {symmetryStatus.lastChecked.toLocaleTimeString()}
            </div>
          )}

          {/* Issues */}
          {symmetryStatus.differences.length > 0 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <div className="font-medium text-red-800 mb-1">Sync Issues:</div>
              {symmetryStatus.differences.map((diff, index) => (
                <div key={index} className="text-red-700 text-xs">
                  • {diff}
                </div>
              ))}
              <button
                onClick={ensureSymmetry}
                className="mt-2 text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
              >
                Fix Sync Issues
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymmetryIndicator;