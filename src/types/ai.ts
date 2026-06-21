export type AIProvider = 'gemini' | 'huggingface' | 'hybrid';

export interface AIConfig {
  provider: AIProvider;
  geminiKey: string;
  huggingfaceKey: string;
  geminiModel: string;
  huggingfaceModel: string;
  validated: boolean;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  geminiKey: '',
  huggingfaceKey: '',
  geminiModel: 'gemini-1.5-flash',
  huggingfaceModel: 'mistralai/Mistral-7B-Instruct-v0.2',
  validated: false,
};

export const GEMINI_MODELS = [
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Powerful)' },
  { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Latest)' },
];

export const HF_MODELS = [
  { id: 'mistralai/Mistral-7B-Instruct-v0.2', label: 'Mistral 7B Instruct' },
  { id: 'meta-llama/Llama-2-70b-chat-hf', label: 'LLaMA 2 70B Chat' },
  { id: 'HuggingFaceH4/zephyr-7b-beta', label: 'Zephyr 7B Beta' },
];

export interface AgentResult<T> {
  agentName: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  result: T | null;
  error: string | null;
  duration: number;
}
