import { useState } from 'react';
import { Key, CheckCircle, AlertCircle, Eye, EyeOff, Download, Shield, Cpu, ExternalLink, Info, ChevronDown } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useProfile } from '../context/ProfileContext';
import { useApp } from '../context/AppContext';
import { Input, Button } from '../components/ui';
import { exportProfilePackage } from '../lib/profilePackage';
import { AIProvider } from '../types/ai';
import { GEMINI_MODELS } from '../lib/gemini';

export function Settings() {
  const { config, setProvider, setGeminiKey, setHuggingFaceKey, setGeminiModel, setHFModel, validateKeys, isValidating } = useAI();
  const { profile, resumes } = useProfile();
  const { showToast } = useApp();
  const [showGemini, setShowGemini] = useState(false);
  const [showHF, setShowHF] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const handleValidate = async () => {
    const result = await validateKeys();
    setValidationResult(result);
    if (result.valid) {
      showToast('API key validated successfully!', 'success');
    } else {
      showToast(result.error || 'Key validation failed', 'error');
    }
  };

  const handleExport = () => {
    exportProfilePackage(profile, resumes);
    showToast('Profile package exported', 'success');
  };

  const selectModel = (model: string) => {
    setGeminiModel(model);
    setShowModelDropdown(false);
    setValidationResult(null); // Reset validation when model changes
  };

  const PROVIDERS: { value: AIProvider; label: string; desc: string; icon: React.ReactNode }[] = [
    { value: 'gemini',      label: 'Google Gemini',    desc: 'Fast, powerful, free tier',  icon: <div className="w-5 h-5 rounded-md bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">G</div> },
    { value: 'huggingface', label: 'HuggingFace',      desc: 'Open source models',         icon: <div className="w-5 h-5 rounded-md bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">HF</div> },
    { value: 'hybrid',      label: 'Hybrid',           desc: 'Gemini + HF fallback',       icon: <Cpu size={12} className="text-purple-500" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f0f4ff]">
      <div className="max-w-2xl mx-auto p-8 space-y-8">

        {/* AI Config */}
        <div className="bg-white rounded-3xl border border-dark-200/50 shadow-card overflow-hidden">
          <div className="px-7 py-5 border-b border-dark-200/30 bg-dark-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-blue">
                <Key size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Provider Configuration</h2>
                <p className="text-xs text-white/40 mt-0.5">Session-only · never stored · lost on tab close</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Provider selector */}
            <div className="grid grid-cols-3 gap-3">
              {PROVIDERS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setProvider(p.value)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    config.provider === p.value
                      ? 'border-brand-400 bg-brand-50 shadow-blue'
                      : 'border-dark-200/50 hover:border-dark-200 bg-white hover:bg-dark-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">{p.icon}</div>
                  <p className={`text-xs font-bold ${config.provider === p.value ? 'text-brand-700' : 'text-dark-900'}`}>{p.label}</p>
                  <p className="text-[10px] text-dark-700/50 mt-0.5">{p.desc}</p>
                  {config.provider === p.value && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-brand-600 text-white text-[10px] rounded-md font-bold">Active</span>
                  )}
                </button>
              ))}
            </div>

            {/* Gemini config */}
            {(config.provider === 'gemini' || config.provider === 'hybrid') && (
              <div className="bg-dark-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-dark-900 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500 text-white text-[8px] font-black flex items-center justify-center">G</div>
                    Google Gemini
                  </p>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Get API Key <ExternalLink size={11} />
                  </a>
                </div>

                <div>
                  <label className="text-xs font-semibold text-dark-700 mb-2 block">Model Name</label>
                  <div className="relative">
                    <div
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="flex items-center justify-between w-full px-3 py-2.5 bg-white border border-dark-200 rounded-xl cursor-pointer hover:border-dark-300 transition-colors"
                    >
                      <span className={config.geminiModel ? 'text-sm text-dark-900' : 'text-sm text-dark-700/50'}>
                        {config.geminiModel || 'Select a model...'}
                      </span>
                      <ChevronDown size={14} className={`text-dark-700/50 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                    </div>
                    {showModelDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowModelDropdown(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-dark-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                          {GEMINI_MODELS.map(model => (
                            <button
                              key={model}
                              onClick={() => selectModel(model)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors ${
                                config.geminiModel === model ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-dark-700'
                              }`}
                            >
                              {model}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href="https://ai.google.dev/gemini-api/docs/models"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-700 font-medium"
                    >
                      <Info size={10} /> View all available models
                    </a>
                    <span className="text-dark-300">|</span>
                    <span className="text-[10px] text-dark-700/50">Click to select or type custom model below</span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      value={config.geminiModel}
                      onChange={e => {
                        setGeminiModel(e.target.value);
                        setValidationResult(null);
                      }}
                      placeholder="Or type custom model name..."
                      className="w-full px-3 py-2 text-sm bg-white border border-dark-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Input
                    label="API Key"
                    type={showGemini ? 'text' : 'password'}
                    value={config.geminiKey}
                    onChange={e => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                    hint="Free tier available with generous limits"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGemini(!showGemini)}
                    className="absolute right-3 top-8 text-dark-700/40 hover:text-dark-700"
                  >
                    {showGemini ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* HuggingFace config */}
            {(config.provider === 'huggingface' || config.provider === 'hybrid') && (
              <div className="bg-dark-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-dark-900 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500 text-white text-[8px] font-black flex items-center justify-center">HF</div>
                    HuggingFace
                  </p>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Get API Key <ExternalLink size={11} />
                  </a>
                </div>

                <div>
                  <Input
                    label="Model Name"
                    value={config.huggingfaceModel}
                    onChange={e => {
                      setHFModel(e.target.value);
                      setValidationResult(null);
                    }}
                    placeholder="mistralai/Mistral-7B-Instruct-v0.2"
                    hint="Example: mistralai/Mistral-7B-Instruct-v0.2"
                  />
                  <a
                    href="https://huggingface.co/models?pipeline_tag=text-generation&sort=downloads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-700 font-medium mt-1"
                  >
                    <Info size={10} /> Browse text generation models
                  </a>
                </div>

                <div className="relative">
                  <Input
                    label="API Key"
                    type={showHF ? 'text' : 'password'}
                    value={config.huggingfaceKey}
                    onChange={e => setHuggingFaceKey(e.target.value)}
                    placeholder="hf_..."
                    hint="Create a token with 'read' permissions"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHF(!showHF)}
                    className="absolute right-3 top-8 text-dark-700/40 hover:text-dark-700"
                  >
                    {showHF ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Button onClick={handleValidate} loading={isValidating} variant="secondary" size="sm">
                  {isValidating ? 'Validating…' : 'Validate Key'}
                </Button>
                {validationResult?.valid && (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                    <CheckCircle size={14} /> Valid
                  </span>
                )}
                {validationResult && !validationResult.valid && (
                  <span className="flex items-center gap-1.5 text-sm text-red-500 font-semibold">
                    <AlertCircle size={14} /> Invalid
                  </span>
                )}
              </div>
              {validationResult && !validationResult.valid && validationResult.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  <p className="font-semibold mb-1">Error:</p>
                  <p className="text-red-600">{validationResult.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Security notice */}
          <div className="mx-6 mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
            <Shield size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">Privacy & Security</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Keys are stored in memory only — never saved to any database or server. They are lost when you close this tab.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Management */}
        <div className="bg-white rounded-3xl border border-dark-200/50 shadow-card p-7">
          <h2 className="text-sm font-bold text-dark-900 mb-5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-dark-900 flex items-center justify-center">
              <Download size={13} className="text-white" />
            </div>
            Profile Management
          </h2>
          <div className="flex items-start justify-between p-4 bg-dark-50 rounded-2xl">
            <div>
              <p className="text-sm font-semibold text-dark-900">Export Profile Package</p>
              <p className="text-xs text-dark-700/50 mt-0.5">Complete backup of your profile and resume data as JSON.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download size={12} /> Export
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            {[
              ['Name', profile.personal.name || '—'],
              ['Version', `v${profile.version}`],
              ['Experience', `${profile.experience.length} entries`],
              ['Projects', `${profile.projects.length} projects`],
            ].map(([k, v]) => (
              <div key={k} className="bg-dark-50 rounded-xl px-3 py-2">
                <p className="text-dark-700/40 font-medium">{k}</p>
                <p className="text-dark-900 font-bold mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-dark-900 rounded-3xl p-7">
          <p className="text-white font-bold mb-1">Looma AI — Resume Intelligence Platform</p>
          <p className="text-white/40 text-xs leading-relaxed">
            Supports Google Gemini & HuggingFace · Harvard-style ATS-safe resumes · 7-agent AI analysis pipeline · Session-safe API key management
          </p>
        </div>
      </div>
    </div>
  );
}
