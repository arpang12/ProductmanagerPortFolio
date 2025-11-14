import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./api";

// Dynamic AI instance that uses stored settings
let ai: GoogleGenerativeAI | null = null;
let currentSettings: { apiKey: string; model: string } | null = null;

// Initialize AI instance with stored settings
const initializeAI = async (): Promise<void> => {
    try {
        const settings = await api.getAISettings();
        if (settings.isConfigured && settings.apiKey && settings.apiKey !== '***hidden***') {
            ai = new GoogleGenerativeAI(settings.apiKey);
            currentSettings = { apiKey: settings.apiKey, model: settings.selectedModel };
        }
    } catch (error) {
        console.warn("AI initialization skipped in development mode:", error.message);
    }
};

export const geminiService = {
    /**
     * Generates or enhances content using the Gemini API via Supabase Edge Function.
     */
    generateContent: async (
        prompt: string,
        existingText?: string,
        tone?: string,
        customInstruction?: string
    ): Promise<string> => {
        const isDevelopmentMode = !import.meta.env.VITE_SUPABASE_URL || 
                                 import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
        
        if (isDevelopmentMode) {
            // Return mock enhanced content in development mode
            const mockEnhancement = existingText 
                ? `Enhanced: ${existingText} (This is a mock AI enhancement for development mode)`
                : `Generated content for: "${prompt}" (This is mock AI-generated content for development mode)`;
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return mockEnhancement;
        }
        
        try {
            // Use Supabase Edge Function for AI generation
            const result = await api.enhanceContent(prompt, existingText, tone, customInstruction);
            return result;
        } catch (error: any) {
            console.error("Error calling AI enhancement service:", error);
            
            // Pass through the actual error message if available
            if (error.message) {
                throw new Error(error.message);
            } else if (typeof error === 'string') {
                throw new Error(error);
            } else {
                throw new Error("AI content generation failed. Please check your AI Settings and try again.");
            }
        }
    },

    /**
     * Test AI connection with current settings
     */
    testConnection: async (apiKey: string, model: string): Promise<{ success: boolean; message: string }> => {
        try {
            const testAI = new GoogleGenerativeAI(apiKey);
            const generativeModel = testAI.getGenerativeModel({ model });
            
            const result = await generativeModel.generateContent("Say 'Hello, AI is working!' in a friendly way.");
            const response = await result.response;
            const text = response.text();
            
            if (text && text.length > 0) {
                return {
                    success: true,
                    message: `Connection successful! AI responded: "${text.substring(0, 50)}..."`
                };
            } else {
                return {
                    success: false,
                    message: "AI responded but with empty content. Please check your model selection."
                };
            }
        } catch (error: any) {
            let errorMessage = "Connection failed. ";
            
            if (error.message?.includes('API_KEY')) {
                errorMessage += "Invalid API key. Please check your Gemini API key.";
            } else if (error.message?.includes('QUOTA')) {
                errorMessage += "API quota exceeded. Please check your usage limits.";
            } else if (error.message?.includes('MODEL')) {
                errorMessage += "Selected model is not available. Please choose a different model.";
            } else if (error.message?.includes('PERMISSION')) {
                errorMessage += "Permission denied. Please check your API key permissions.";
            } else {
                errorMessage += error.message || "Unknown error occurred.";
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    },

    /**
     * Get available Gemini models
     */
    getAvailableModels: async () => {
        return await api.getAvailableModels();
    },

    /**
     * Refresh AI settings (call this after updating settings)
     */
    refreshSettings: async (): Promise<void> => {
        ai = null;
        currentSettings = null;
        await initializeAI();
    },

    /**
     * Check if AI service is configured
     */
    isConfigured: (): boolean => {
        return !!(ai && currentSettings);
    },

    /**
     * Get current model being used
     */
    getCurrentModel: (): string | null => {
        return currentSettings?.model || null;
    }
};

// Initialize on module load
initializeAI();
