import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

interface AIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (enhancedText: string) => void;
  originalText: string;
  sectionType?: string;
  placeholder?: string;
}

type TabType = 'tone' | 'rephrase';
type ToneOption = 'Professional' | 'Creative' | 'Friendly' | 'Formal' | 'Casual' | 'Persuasive' | 'Informative' | 'Inspirational' | 'Technical' | 'Whimsical';
type RephraseMode = 'Standard' | 'Fluency' | 'Formal' | 'Simple' | 'Creative' | 'Expand' | 'Shorten' | 'Academic';

const toneOptions: { value: ToneOption; label: string; description: string }[] = [
  { value: 'Professional', label: 'Professional', description: 'Business-appropriate and polished' },
  { value: 'Creative', label: 'Creative', description: 'Unique and imaginative' },
  { value: 'Friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'Formal', label: 'Formal', description: 'Serious and official' },
  { value: 'Casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'Persuasive', label: 'Persuasive', description: 'Convincing and compelling' },
  { value: 'Informative', label: 'Informative', description: 'Clear and educational' },
  { value: 'Inspirational', label: 'Inspirational', description: 'Motivating and uplifting' },
  { value: 'Technical', label: 'Technical', description: 'Precise and detailed' },
  { value: 'Whimsical', label: 'Whimsical', description: 'Playful and imaginative' },
];

const rephraseModes: { value: RephraseMode; label: string; description: string }[] = [
  { value: 'Standard', label: 'Standard', description: 'Balanced rewrite maintaining meaning' },
  { value: 'Fluency', label: 'Fluency', description: 'Improve readability and flow' },
  { value: 'Formal', label: 'Formal', description: 'More professional language' },
  { value: 'Simple', label: 'Simple', description: 'Easier to understand' },
  { value: 'Creative', label: 'Creative', description: 'More unique and interesting' },
  { value: 'Expand', label: 'Expand', description: 'Add more detail and context' },
  { value: 'Shorten', label: 'Shorten', description: 'Make more concise' },
  { value: 'Academic', label: 'Academic', description: 'Scholarly and research-oriented' },
];

const AIEnhancementModal: React.FC<AIEnhancementModalProps> = ({
  isOpen,
  onClose,
  onApply,
  originalText,
  sectionType = 'content',
  placeholder = 'Enhanced content will appear here...'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tone');
  const [selectedTone, setSelectedTone] = useState<ToneOption>('Professional');
  const [selectedMode, setSelectedMode] = useState<RephraseMode>('Standard');
  const [customInstruction, setCustomInstruction] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEnhancedText('');
      setError(null);
      setCustomInstruction('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      let prompt = '';
      let tone = '';

      if (activeTab === 'tone') {
        tone = selectedTone;
        prompt = `Rewrite this ${sectionType} with a ${selectedTone.toLowerCase()} tone.`;
      } else {
        // Rephrase mode
        const modeInstructions: Record<RephraseMode, string> = {
          'Standard': 'Rewrite this maintaining the same meaning but with different wording.',
          'Fluency': 'Improve the readability and flow of this text.',
          'Formal': 'Rewrite this in a more formal and professional style.',
          'Simple': 'Simplify this text to make it easier to understand.',
          'Creative': 'Rewrite this in a more creative and unique way.',
          'Expand': 'Expand this text with more detail and context.',
          'Shorten': 'Make this text more concise while keeping the key points.',
          'Academic': 'Rewrite this in an academic and scholarly style.',
        };
        prompt = modeInstructions[selectedMode];
      }

      const enhanced = await geminiService.generateContent(
        prompt,
        originalText,
        tone,
        customInstruction || undefined
      );

      setEnhancedText(enhanced);
    } catch (err: any) {
      console.error('AI generation failed:', err);
      setError(err.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (enhancedText.trim()) {
      onApply(enhancedText);
      onClose();
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              AI Content Enhancement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('tone')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'tone'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🎨</span>
              Change Tone
            </span>
            {activeTab === 'tone' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('rephrase')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'rephrase'
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🔄</span>
              Rephrase
            </span>
            {activeTab === 'rephrase' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Original Text */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Original Text:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-gray-700 dark:text-gray-300 text-sm">
              {originalText || 'No text provided'}
            </div>
          </div>

          {/* Options Grid */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {activeTab === 'tone' ? 'Tone:' : 'Rephrase Mode:'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {activeTab === 'tone'
                ? toneOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedTone(option.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedTone === option.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </button>
                  ))
                : rephraseModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setSelectedMode(mode.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedMode === mode.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {mode.label}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {mode.description}
                      </div>
                    </button>
                  ))}
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Additional Instructions (Optional):
            </h3>
            <textarea
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g., make it 20 words limit, focus on achievements, add specific examples..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Enhanced Text Preview */}
          {(enhancedText || isGenerating) && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Enhanced Text:
              </h3>
              {isGenerating ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[100px]">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Generating...</span>
                  </div>
                </div>
              ) : (
                <textarea
                  value={enhancedText}
                  onChange={(e) => setEnhancedText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder={placeholder}
                />
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Tip */}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>💡</span>
            <span>Tip: Try different {activeTab === 'tone' ? 'tones' : 'modes'} to find the perfect style</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            {enhancedText && !isGenerating && (
              <button
                onClick={handleRegenerate}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                Regenerate
              </button>
            )}
            {!enhancedText && !isGenerating && (
              <button
                onClick={handleGenerate}
                disabled={!originalText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>✨</span>
                Enhance
              </button>
            )}
            {enhancedText && !isGenerating && (
              <button
                onClick={handleApply}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2"
              >
                <span>✓</span>
                Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancementModal;
