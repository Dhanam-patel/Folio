import { useState, useRef } from 'react';
import { Upload, Plus, FileJson, ArrowRight, CheckCircle, Layers, Zap, Target, FileText, BarChart3, Star, FileSearch, Loader2, AlertCircle, Settings, ExternalLink, FileUp, Link as LinkIcon, Mail, Github, Linkedin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useProfile } from '../context/ProfileContext';
import { useAI } from '../context/AIContext';
import { EMPTY_PROFILE, Profile } from '../types/profile';
import { parseProfilePackage } from '../lib/profilePackage';
import { parseResumeWithAI, buildProfileFromParsedData, ParsedResumeData } from '../lib/resumeParser';
import { parsePDF, categorizeLinks, ParsedPDFResult } from '../lib/pdfParser';
import { Input, Textarea, Button, Badge } from '../components/ui';
import { DHANAM_PROFILE } from '../lib/demoProfile';

type Mode = 'hero' | 'create' | 'upload' | 'resume-import';

const FEATURES = [
  { icon: <Zap size={18} />, title: '7-Agent AI Pipeline', desc: 'Job analysis, ATS review, recruiter scoring and more.' },
  { icon: <Target size={18} />, title: 'Keyword Intelligence', desc: 'Close gaps between your profile and any job description.' },
  { icon: <FileText size={18} />, title: 'Harvard Resume', desc: 'ATS-safe, clean typography, print-ready PDF output.' },
  { icon: <BarChart3 size={18} />, title: 'Resume Scores', desc: 'Overall, ATS, recruiter, readability — all scored.' },
];

const STATS = [
  { value: '7', label: 'AI Agents', sub: 'Collaborative pipeline' },
  { value: '10×', label: 'Faster', sub: 'Resume tailoring' },
  { value: '98%', label: 'ATS-Safe', sub: 'Harvard format' },
];

export function Onboarding() {
  const [mode, setMode] = useState<Mode>('hero');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { setView, showToast } = useApp();
  const { setProfile } = useProfile();
  const { config } = useAI();

  // Resume import state
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [pdfResult, setPdfResult] = useState<ParsedPDFResult | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResumeData | null>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);

  const hasAIConfig = !!(config.geminiKey || config.huggingfaceKey);

  const handleCreate = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    const profile: Profile = { ...EMPTY_PROFILE, id: undefined, personal: { ...EMPTY_PROFILE.personal, name: name.trim(), email: email.trim() } };
    setProfile(profile);
    showToast('Profile created! Fill in your details.', 'success');
    setView('profile');
  };

  const handleLoadDemo = () => {
    setProfile(DHANAM_PROFILE);
    showToast('Demo profile loaded', 'success');
    setView('profile');
  };

  const handleFile = async (file: File) => {
    setError('');
    try {
      const text = await file.text();
      const { profile } = parseProfilePackage(text);
      setProfile(profile);
      setUploadSuccess(true);
      setTimeout(() => { showToast('Profile imported successfully', 'success'); setView('profile'); }, 700);
    } catch {
      setError('Invalid profile package. Upload a valid .json file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      setParseError('Please paste your resume content or upload a PDF');
      return;
    }
    if (!hasAIConfig) {
      setParseError('Please configure your AI key in Settings first');
      return;
    }

    setIsParsing(true);
    setParseError('');

    try {
      const parsedData = await parseResumeWithAI(config, resumeText);
      setParsedResumeData(parsedData);

      // Auto-populate links from PDF if available
      if (pdfResult) {
        const categorized = categorizeLinks(pdfResult.links);
        if (categorized.linkedin.length > 0) {
          parsedData.personal.linkedin = categorized.linkedin[0];
        }
        if (categorized.github.length > 0) {
          parsedData.personal.github = categorized.github[0];
        }
        if (categorized.emails.length > 0 && !parsedData.personal.email) {
          parsedData.personal.email = categorized.emails[0];
        }
        if (categorized.websites.length > 0 && !parsedData.personal.website) {
          parsedData.personal.website = categorized.websites[0];
        }
      }

      const profile = buildProfileFromParsedData(parsedData);
      setProfile(profile);
      showToast('Resume parsed successfully! Review and save your profile.', 'success');
      setView('profile');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to parse resume';
      setParseError(msg);
      showToast(`Parsing failed: ${msg}`, 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handlePDFUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setParseError('Please upload a PDF file');
      return;
    }

    setIsParsing(true);
    setParseError('');
    setPdfResult(null);

    try {
      const result = await parsePDF(file);
      setPdfResult(result);
      setResumeText(result.text);
      showToast(`PDF parsed! ${result.metadata.pageCount} pages, ${result.links.length} links found. Review and parse with AI.`, 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to parse PDF';
      setParseError(msg);
      showToast(`PDF parsing failed: ${msg}`, 'error');
    } finally {
      setIsParsing(false);
    }
  };

  if (mode === 'create') {
    return (
      <div className="flex-1 min-h-screen bg-grid bg-brand-50/50 flex items-center justify-center p-8">
        <div className="bg-white border border-dark-200/50 rounded-3xl p-8 w-full max-w-md shadow-card-lg animate-fade-up">
          <button onClick={() => setMode('hero')} className="text-xs text-dark-700/50 hover:text-dark-700 mb-6 flex items-center gap-1 font-medium">
            ← Back
          </button>
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center mb-5 shadow-blue">
            <Plus size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-dark-900 mb-1 tracking-tight">Create profile</h2>
          <p className="text-sm text-dark-700/60 mb-6">Start building your professional profile from scratch.</p>
          <div className="space-y-4">
            <Input label="Full Name *" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Johnson" autoFocus />
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" />
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button onClick={handleCreate} className="btn-blue w-full justify-center py-3 mt-2 text-sm">
              Create Profile <ArrowRight size={15} />
            </button>
            <div className="flex items-center gap-2 my-1">
              <hr className="flex-1 border-dark-200/40" />
              <span className="text-xs text-dark-700/40 font-medium">or</span>
              <hr className="flex-1 border-dark-200/40" />
            </div>
            <button onClick={handleLoadDemo} className="w-full text-sm text-brand-600 hover:text-brand-700 font-semibold py-2.5 border border-brand-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl transition-all">
              Load demo profile (Dhanam Patel)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'upload') {
    return (
      <div className="flex-1 min-h-screen bg-grid bg-brand-50/50 flex items-center justify-center p-8">
        <div className="bg-white border border-dark-200/50 rounded-3xl p-8 w-full max-w-md shadow-card-lg animate-fade-up">
          <button onClick={() => setMode('hero')} className="text-xs text-dark-700/50 hover:text-dark-700 mb-6 flex items-center gap-1 font-medium">
            ← Back
          </button>
          <div className="w-10 h-10 bg-dark-900 rounded-xl flex items-center justify-center mb-5">
            <Upload size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-dark-900 mb-1 tracking-tight">Import profile</h2>
          <p className="text-sm text-dark-700/60 mb-6">Restore a previously exported profile package.</p>
          {uploadSuccess ? (
            <div className="flex flex-col items-center py-10 text-emerald-500">
              <CheckCircle size={44} className="mb-3" />
              <p className="font-bold text-dark-900">Profile imported!</p>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-brand-200 hover:border-brand-400 rounded-2xl p-10 flex flex-col items-center cursor-pointer transition-all group bg-brand-50/30 hover:bg-brand-50"
            >
              <FileJson size={32} className="text-brand-300 group-hover:text-brand-500 mb-3 transition-colors" />
              <p className="text-sm font-semibold text-dark-700 mb-1">Drop your profile package here</p>
              <p className="text-xs text-dark-700/50">or click to browse · .json files only</p>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}
          {error && <p className="text-xs text-red-500 font-medium mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  if (mode === 'resume-import') {
    return (
      <div className="flex-1 min-h-screen bg-grid bg-brand-50/50 flex items-center justify-center p-8">
        <div className="bg-white border border-dark-200/50 rounded-3xl p-8 w-full max-w-2xl shadow-card-lg animate-fade-up">
          <button onClick={() => setMode('hero')} className="text-xs text-dark-700/50 hover:text-dark-700 mb-6 flex items-center gap-1 font-medium">
            ← Back
          </button>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center mb-5 shadow-md">
            <FileSearch size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-dark-900 mb-1 tracking-tight">Import from Resume</h2>
          <p className="text-sm text-dark-700/60 mb-6">
            Paste your existing resume content and our AI will extract your profile details automatically.
          </p>

          {!hasAIConfig && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">AI Provider Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  Configure your Gemini or HuggingFace API key in Settings to use this feature.
                </p>
                <button
                  onClick={() => setView('settings')}
                  className="inline-flex items-center gap-1 text-xs text-amber-800 font-semibold mt-2 hover:underline"
                >
                  <Settings size={12} />
                  Open Settings <ExternalLink size={10} />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* PDF Upload Section */}
            <div>
              <label className="text-xs font-semibold text-dark-700 mb-2 block">Upload PDF Resume</label>
              <div
                onClick={() => pdfFileRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handlePDFUpload(file);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all group bg-emerald-50/30 hover:bg-emerald-50"
              >
                <FileUp size={28} className="text-emerald-400 group-hover:text-emerald-600 mb-2" />
                <p className="text-sm font-semibold text-dark-700 mb-1">Drop PDF or click to upload</p>
                <p className="text-xs text-dark-700/50">PDF files only · we'll extract text and links</p>
                <input
                  ref={pdfFileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePDFUpload(e.target.files[0])}
                />
              </div>
            </div>

            {/* PDF Result Preview */}
            {pdfResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">
                    PDF Parsed ({pdfResult.metadata.pageCount} pages)
                  </span>
                </div>
                <div className="space-y-2">
                  {pdfResult.metadata.author && (
                    <p className="text-xs text-dark-700"><span className="font-medium">Author:</span> {pdfResult.metadata.author}</p>
                  )}
                  {pdfResult.links.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-dark-700 mb-1.5 flex items-center gap-1.5">
                        <LinkIcon size={12} />
                        Found {pdfResult.links.length} link{pdfResult.links.length !== 1 ? 's' : ''}:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const categorized = categorizeLinks(pdfResult.links);
                          return (
                            <>
                              {categorized.linkedin.map(l => (
                                <Badge key={l} color="blue"><Linkedin size={10} className="mr-1" />LinkedIn</Badge>
                              ))}
                              {categorized.github.map(l => (
                                <Badge key={l} color="gray"><Github size={10} className="mr-1" />GitHub</Badge>
                              ))}
                              {categorized.emails.map(e => (
                                <Badge key={e} color="red"><Mail size={10} className="mr-1" />{e}</Badge>
                              ))}
                              {categorized.websites.slice(0, 2).map(w => (
                                <Badge key={w} color="green">{new URL(w).hostname}</Badge>
                              ))}
                              {categorized.other.length > 0 && (
                                <Badge color="gray">+{categorized.other.length} more</Badge>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Input */}
            <div>
              <label className="text-xs font-semibold text-dark-700 mb-2 block">Or paste resume text</label>
              <Textarea
                value={resumeText}
                onChange={e => {
                  setResumeText(e.target.value);
                  setPdfResult(null); // Clear PDF result when manually editing
                }}
                placeholder="Paste your resume content here...&#10;&#10;Include:&#10;- Contact information (name, email, phone, location)&#10;- Professional summary/objective&#10;- Work experience with responsibilities&#10;- Education&#10;- Skills and technologies&#10;- Projects, certifications, achievements"
                rows={10}
                className="text-xs leading-relaxed"
              />
            </div>

            {parseError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={14} className="text-red-500" />
                <p className="text-xs text-red-600 font-medium">{parseError}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleParseResume}
                disabled={isParsing || !resumeText.trim() || !hasAIConfig}
                loading={isParsing}
                className="flex-1 justify-center py-3"
              >
                {isParsing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Parsing Resume...
                  </>
                ) : (
                  <>
                    <FileSearch size={14} />
                    Parse Resume with AI
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 my-2">
              <hr className="flex-1 border-dark-200/40" />
              <span className="text-xs text-dark-700/40 font-medium">or</span>
              <hr className="flex-1 border-dark-200/40" />
            </div>

            <button
              onClick={handleLoadDemo}
              className="w-full text-sm text-brand-600 hover:text-brand-700 font-semibold py-2.5 border border-brand-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl transition-all"
            >
              Load demo profile instead (Dhanam Patel)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HERO
  return (
    <div className="flex-1 min-h-screen bg-[#f0f4ff] overflow-y-auto">
      {/* Nav bar */}
      <nav className="flex items-center justify-between px-10 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-blue">
            <Layers size={15} className="text-white" />
          </div>
          <span className="font-bold text-dark-900 text-base tracking-tight">Looma AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMode('resume-import')} className="text-sm font-medium text-dark-700 hover:text-dark-900 px-4 py-2 rounded-xl hover:bg-white transition-all">
            Import Resume
          </button>
          <button onClick={() => setMode('upload')} className="text-sm font-medium text-dark-700 hover:text-dark-900 px-4 py-2 rounded-xl hover:bg-white transition-all">
            Import Backup
          </button>
          <button onClick={() => setMode('create')} className="btn-primary text-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-10 pt-12 pb-16">
        {/* Bold CTA at the very top */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white border border-brand-100 rounded-full px-3.5 py-1.5 text-xs font-semibold text-brand-700 mb-6 shadow-card">
            <Star size={11} className="fill-brand-500 text-brand-500" />
            AI-Powered Resume Intelligence
          </div>
          <h1 className="text-[72px] font-black text-dark-900 leading-[1.0] tracking-tighter mb-6">
            Resume
            <br />
            <span className="text-brand-600">Intelligence</span>
          </h1>
          <p className="text-lg text-dark-700/70 leading-relaxed mb-10 max-w-lg mx-auto">
            The AI platform that helps ambitious professionals build recruiter-ready, ATS-optimized resumes tailored to every job.
          </p>

          {/* PRIMARY CTA - Create or Import Profile */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <p className="text-sm font-bold text-dark-900 uppercase tracking-wider">Get Started Now</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMode('create')}
                className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white font-bold py-5 px-10 rounded-2xl shadow-blue-lg hover:shadow-xl transition-all text-base"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <div className="text-left">
                  <div className="text-lg font-extrabold">Create Profile</div>
                  <div className="text-xs text-blue-200 font-medium">Start from scratch</div>
                </div>
                <ArrowRight size={20} className="ml-2" />
              </button>

              <div className="h-px w-6 bg-dark-300/30" />

              <button
                onClick={() => setMode('resume-import')}
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileSearch size={20} />
                </div>
                <div className="text-left">
                  <div className="text-lg font-extrabold">Import Resume</div>
                  <div className="text-xs text-emerald-200 font-medium">AI extracts your data</div>
                </div>
              </button>

              <div className="h-px w-6 bg-dark-300/30" />

              <button
                onClick={() => setMode('upload')}
                className="flex items-center gap-3 bg-dark-900 hover:bg-dark-800 text-white font-bold py-5 px-10 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Upload size={20} />
                </div>
                <div className="text-left">
                  <div className="text-lg font-extrabold">Import Backup</div>
                  <div className="text-xs text-dark-400 font-medium">Restore .json file</div>
                </div>
                <FileJson size={20} className="ml-2" />
              </button>
            </div>
            <button
              onClick={handleLoadDemo}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-4"
            >
              Or explore with a demo profile →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 items-start">
          <div className="animate-fade-up">
            <div className="bg-white rounded-2xl border border-dark-200/50 shadow-card p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4">Why Looma AI?</h3>
              <ul className="space-y-3">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-dark-900 text-sm">{f.title}</p>
                      <p className="text-xs text-dark-700/60">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative animate-fade-up">
            <div className="bg-white rounded-3xl p-7 shadow-card-lg border border-dark-200/30">
              {/* Mock resume card */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">D</div>
                  <div>
                    <div className="h-3 w-28 bg-dark-900 rounded-full" />
                    <div className="h-2 w-20 bg-dark-200/60 rounded-full mt-1.5" />
                  </div>
                </div>
                <div className="h-px bg-dark-200/30" />
                <div className="space-y-1.5">
                  <div className="h-2 w-16 bg-brand-200 rounded-full" />
                  <div className="h-2.5 w-full bg-dark-100 rounded-full" />
                  <div className="h-2.5 w-5/6 bg-dark-100 rounded-full" />
                  <div className="h-2.5 w-4/6 bg-dark-100 rounded-full" />
                </div>
                <div className="h-px bg-dark-200/30" />
                <div className="space-y-1.5">
                  <div className="h-2 w-20 bg-brand-200 rounded-full" />
                  <div className="h-2.5 w-full bg-dark-100 rounded-full" />
                  <div className="h-2.5 w-3/4 bg-dark-100 rounded-full" />
                </div>
              </div>
              {/* Score overlay */}
              <div className="absolute -top-4 -right-4 bg-brand-600 text-white rounded-2xl px-4 py-3 shadow-blue-lg text-center">
                <div className="text-2xl font-black leading-none">92</div>
                <div className="text-[10px] font-semibold text-blue-200 uppercase tracking-wide">ATS Score</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-accent-500 text-white rounded-2xl px-4 py-2.5 shadow-md">
                <div className="text-xs font-bold">7 Agents</div>
                <div className="text-[10px] text-orange-100">Analyzing now…</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-10 pb-12">
        <div className="grid grid-cols-3 gap-4">
          {STATS.map(s => (
            <div key={s.value} className="bg-white rounded-2xl p-6 shadow-card border border-dark-200/40 text-center">
              <div className="text-4xl font-black text-brand-600 mb-1">{s.value}</div>
              <div className="text-sm font-bold text-dark-900">{s.label}</div>
              <div className="text-xs text-dark-700/50">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-10 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-dark-900 tracking-tight mb-2">Performance That Scales with Intelligence</h2>
          <p className="text-dark-700/60 text-base">Everything you need to land your next role, powered by AI.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className={`rounded-2xl p-6 border transition-all ${i === 0 ? 'bg-brand-600 border-brand-500 text-white col-span-2' : 'bg-white border-dark-200/50 shadow-card hover:shadow-card-lg hover:border-brand-200'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${i === 0 ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-600'}`}>
                {f.icon}
              </div>
              <h3 className={`font-bold text-sm mb-1 ${i === 0 ? 'text-white' : 'text-dark-900'}`}>{f.title}</h3>
              <p className={`text-xs leading-relaxed ${i === 0 ? 'text-blue-100' : 'text-dark-700/60'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-10 pb-16">
        <div className="bg-dark-900 rounded-3xl p-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-1">Ready to build your best resume?</h3>
            <p className="text-dark-200/50 text-sm">Trusted by professionals targeting top-tier roles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLoadDemo} className="text-sm font-medium text-white/60 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all">
              View Demo
            </button>
            <button onClick={() => setMode('create')} className="btn-primary">
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
