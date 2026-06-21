import React, { createContext, useContext, useState } from 'react';
import { AIConfig, DEFAULT_AI_CONFIG, AIProvider } from '../types/ai';
import { validateGeminiKey } from '../lib/gemini';
import { validateHuggingFaceKey } from '../lib/huggingface';

interface AIContextValue {
  config: AIConfig;
  setProvider: (p: AIProvider) => void;
  setGeminiKey: (key: string) => void;
  setHuggingFaceKey: (key: string) => void;
  setGeminiModel: (m: string) => void;
  setHFModel: (m: string) => void;
  validateKeys: () => Promise<{ valid: boolean; error?: string }>;
  isValidating: boolean;
  hasValidKey: boolean;
  getActiveProviderStatus: () => { provider: string; hasKey: boolean; hasModel: boolean }[];
}

const AIContext = createContext<AIContextValue | null>(null);

export function AIProvider_({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidKey, setHasValidKey] = useState(false);

  const setProvider = (provider: AIProvider) => setConfig(c => ({ ...c, provider, validated: false }));
  const setGeminiKey = (geminiKey: string) => setConfig(c => ({ ...c, geminiKey, validated: false }));
  const setHuggingFaceKey = (huggingfaceKey: string) => setConfig(c => ({ ...c, huggingfaceKey, validated: false }));
  const setGeminiModel = (geminiModel: string) => setConfig(c => ({ ...c, geminiModel }));
  const setHFModel = (huggingfaceModel: string) => setConfig(c => ({ ...c, huggingfaceModel }));

  const getActiveProviderStatus = () => {
    const status: { provider: string; hasKey: boolean; hasModel: boolean }[] = [];
    if (config.provider === 'gemini' || config.provider === 'hybrid') {
      status.push({
        provider: 'Gemini',
        hasKey: !!config.geminiKey,
        hasModel: !!config.geminiModel,
      });
    }
    if (config.provider === 'huggingface' || config.provider === 'hybrid') {
      status.push({
        provider: 'HuggingFace',
        hasKey: !!config.huggingfaceKey,
        hasModel: !!config.huggingfaceModel,
      });
    }
    return status;
  };

  const validateKeys = async (): Promise<{ valid: boolean; error?: string }> => {
    setIsValidating(true);
    try {
      if (config.provider === 'gemini' || config.provider === 'hybrid') {
        if (config.geminiKey && config.geminiModel) {
          const result = await validateGeminiKey(config.geminiKey, config.geminiModel);
          if (result.valid) {
            setConfig(c => ({ ...c, validated: true }));
            setHasValidKey(true);
            return { valid: true };
          }
          return { valid: false, error: result.error };
        }
      }

      if (config.provider === 'huggingface' || config.provider === 'hybrid') {
        if (config.huggingfaceKey && config.huggingfaceModel) {
          const result = await validateHuggingFaceKey(config.huggingfaceKey, config.huggingfaceModel);
          if (result.valid) {
            setConfig(c => ({ ...c, validated: true }));
            setHasValidKey(true);
            return { valid: true };
          }
          return { valid: false, error: result.error };
        }
      }

      return { valid: false, error: 'No API key configured' };
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AIContext.Provider value={{
      config, setProvider, setGeminiKey, setHuggingFaceKey,
      setGeminiModel, setHFModel, validateKeys, isValidating, hasValidKey, getActiveProviderStatus,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be inside AIProvider_');
  return ctx;
}
