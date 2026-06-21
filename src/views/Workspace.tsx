import { useState } from 'react';
import { Zap, ChevronRight, AlertCircle, CheckCircle, Loader2, FileText, Download, Save } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAI } from '../context/AIContext';
import { useApp } from '../context/AppContext';
import { runFullAnalysis, generateTailoredResume, AgentProgress } from '../lib/agents';
import { TailoredResumeContent } from '../lib/agents';
import { AIAnalysisResult } from '../types/resume';
import { Textarea, Button, Badge, Input } from '../components/ui';

const AGENT_META = [
  { name: 'Job Description Analyzer', description: 'Extracts required skills, keywords, and role signals.' },
  { name: 'Profile Matcher',           description: 'Compares your profile against job requirements.' },
  { name: 'Resume Strategist',         description: 'Determines the optimal content and ordering strategy.' },
  { name: 'Keyword Optimizer',         description: 'Analyzes ATS keyword coverage and gaps.' },
  { name: 'ATS Reviewer',             description: 'Scores your resume against ATS standards.' },
  { name: 'Recruiter Reviewer',        description: 'Evaluates first impressions and appeal to recruiters.' },
  { name: 'Final Quality Auditor',     description: 'Synthesizes all agent results into a final verdict.' },
];

export function Workspace() {
  const { profile, currentResume, setCurrentResume, addResume } = useProfile();
  const { config } = useAI();
  const { setView, showToast } = useApp();

  const [jobDescription, setJobDescription] = useState(currentResume.jobDescription);
  const [agentProgress, setAgentProgress] = useState<AgentProgress[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(currentResume.aiAnalysis ?? null);
  const [error, setError] = useState<string | null>(null);
  const [_activeAgent, setActiveAgent] = useState<string | null>(null);

  // Tailored resume state
  const [tailoredContent, setTailoredContent] = useState<TailoredResumeContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const hasKey = !!(config.geminiKey || config.huggingfaceKey);
  const hasModel = !!(config.geminiModel || config.huggingfaceModel);

  const handleRun = async () => {
    if (!jobDescription.trim()) { showToast('Paste a job description first', 'error'); return; }
    if (!hasKey || !hasModel) {
      setView('settings');
      showToast(!hasKey ? 'Configure your API key in Settings first' : 'Set a model name in Settings first', 'error');
      return;
    }

    setIsRunning(true);
    setError(null);
    setAnalysis(null);
    setAgentProgress([]);
    setTailoredContent(null);

    try {
      const result = await runFullAnalysis(config, jobDescription, profile, (p) => {
        setActiveAgent(p.agent);
        setAgentProgress(prev => {
          const next = [...prev];
          const idx = next.findIndex(a => a.agent === p.agent);
          if (idx >= 0) next[idx] = p; else next.push(p);
          return next;
        });
      });
      setAnalysis(result);
      setCurrentResume({
        ...currentResume, jobDescription,
        aiAnalysis: result,
        scores: buildScores(result),
        updatedAt: new Date().toISOString(),
      });
      showToast('Analysis complete!', 'success');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setError(errorMessage);
      showToast(`Analysis failed: ${errorMessage}`, 'error');
    } finally {
      setIsRunning(false);
      setActiveAgent(null);
    }
  };

  const handleGenerateTailoredResume = async () => {
    if (!analysis) return;

    setIsGenerating(true);
    try {
      const content = await generateTailoredResume(config, profile, jobDescription, analysis);
      setTailoredContent(content);
      showToast('Tailored resume generated!', 'success');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      showToast(`Generation failed: ${errorMessage}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveResume = () => {
    if (!resumeName.trim()) {
      showToast('Enter a name for this resume', 'error');
      return;
    }

    // Extract job title from job description for the name
    const jobTitle = jobDescription.split('\n')[0].slice(0, 50) || 'Custom Resume';
    const name = resumeName.trim() || jobTitle;

    addResume(
      name,
      jobDescription,
      analysis,
      currentResume.scores
    );
    showToast(`Resume "${name}" saved!`, 'success');
    setShowSaveModal(false);
    setResumeName('');
  };

  const getAgentStatus = (name: string): AgentProgress['status'] =>
    agentProgress.find(a => a.agent === name)?.status ?? 'idle';

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f0f4ff]">
      {/* Left panel — Job Description */}
      <div className="w-80 border-r border-dark-200/50 bg-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-dark-200/40">
          <h3 className="text-sm font-bold text-dark-900 mb-0.5">Job Description</h3>
          <p className="text-xs text-dark-700/50">Paste the full job description to analyze.</p>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3">
          <Textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description…&#10;&#10;Include: job title, responsibilities, required skills, preferred qualifications."
            className="flex-1 resize-none text-xs leading-relaxed"
            rows={18}
          />
          {(!hasKey || !hasModel) && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-800 font-semibold">
                  {!hasKey ? 'API key required' : 'Model name required'}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {!hasKey ? 'Add your Gemini or HuggingFace API key' : 'Enter a model name (e.g., gemini-1.5-flash)'}
                </p>
                <button onClick={() => setView('settings')} className="text-xs text-amber-700 underline font-medium mt-1">Configure in Settings →</button>
              </div>
            </div>
          )}
          <Button onClick={handleRun} disabled={isRunning || !jobDescription.trim()} loading={isRunning} className="w-full justify-center py-3">
            {!isRunning && <Zap size={14} />}
            {isRunning ? 'Analyzing…' : 'Run AI Analysis'}
          </Button>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Agent Pipeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-dark-900">AI Agent Pipeline</h3>
              {isRunning && (
                <span className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                  Running
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {AGENT_META.map((agent, idx) => {
                const status = getAgentStatus(agent.name);
                return (
                  <div key={agent.name} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    status === 'running'  ? 'border-brand-300 bg-brand-50 shadow-blue' :
                    status === 'complete' ? 'border-emerald-200 bg-emerald-50' :
                    status === 'error'    ? 'border-red-200 bg-red-50' :
                    'border-dark-200/50 bg-white'
                  }`}>
                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                      {status === 'running'  && <Loader2 size={16} className="text-brand-600 animate-spin" />}
                      {status === 'complete' && <CheckCircle size={16} className="text-emerald-500" />}
                      {status === 'error'    && <AlertCircle size={16} className="text-red-500" />}
                      {status === 'idle'     && (
                        <span className="w-6 h-6 rounded-full border-2 border-dark-200 flex items-center justify-center text-[10px] font-bold text-dark-700/50">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${
                        status === 'running' ? 'text-brand-700' :
                        status === 'complete' ? 'text-emerald-700' :
                        'text-dark-800'
                      }`}>Agent {idx + 1}: {agent.name}</p>
                      <p className="text-xs text-dark-700/50 truncate">{agent.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons after analysis */}
          {analysis && (
            <div className="flex items-center gap-3">
              <Button
                onClick={handleGenerateTailoredResume}
                disabled={isGenerating}
                loading={isGenerating}
                variant="secondary"
              >
                {!isGenerating && <FileText size={14} />}
                {isGenerating ? 'Generating…' : 'Generate Tailored Resume'}
              </Button>
              <Button onClick={() => setShowSaveModal(true)} variant="secondary">
                <Save size={14} />
                Save This Resume
              </Button>
              <Button onClick={() => setView('resume')} className="ml-auto">
                <Download size={14} />
                View Resume
              </Button>
            </div>
          )}

          {/* Tailored resume preview */}
          {tailoredContent && (
            <div className="bg-white border border-brand-200 rounded-xl p-5 shadow-card">
              <h3 className="text-sm font-bold text-dark-900 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-brand-500" />
                Tailored Resume Content
              </h3>
              <div className="space-y-4">
                {tailoredContent.summary && (
                  <div>
                    <p className="text-xs font-semibold text-dark-700/60 mb-1">Professional Summary</p>
                    <p className="text-xs text-dark-700 bg-dark-50 rounded-xl p-3">{tailoredContent.summary}</p>
                  </div>
                )}
                {tailoredContent.skillsToEmphasize.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dark-700/60 mb-2">Skills to Emphasize</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tailoredContent.skillsToEmphasize.map(s => <Badge key={s} color="green">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {tailoredContent.experienceHighlights.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dark-700/60 mb-2">Experience Highlights</p>
                    <div className="space-y-2">
                      {tailoredContent.experienceHighlights.map(h => (
                        <div key={h.id} className="bg-dark-50 rounded-xl p-3">
                          <ul className="space-y-1">
                            {h.tailoredBullets.map((b, i) => (
                              <li key={i} className="text-xs text-dark-700 flex items-start gap-2">
                                <span className="text-brand-500 mt-0.5">•</span>
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tailoredContent.suggestedFormatting.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-dark-700/60 mb-2">Formatting Tips</p>
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 space-y-1">
                      {tailoredContent.suggestedFormatting.map((t, i) => (
                        <p key={i} className="text-xs text-brand-700">• {t}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {analysis && !tailoredContent && <AnalysisResults analysis={analysis} />}

          {error && !analysis && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Analysis Failed</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <p className="text-xs text-red-500 mt-2">
                  Check your API key and model name in Settings, then try again.
                </p>
              </div>
            </div>
          )}

          {!analysis && !isRunning && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-dark-700/30">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
                <Zap size={24} className="text-brand-300" />
              </div>
              <p className="text-sm font-semibold text-dark-700/50">Ready to analyze</p>
              <p className="text-xs mt-1">Paste a job description and run the AI pipeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-card-lg">
            <h3 className="text-sm font-bold text-dark-900 mb-4">Save Resume</h3>
            <p className="text-xs text-dark-700/60 mb-4">
              Save this resume version for future reference. Each saved resume keeps its job description and AI analysis.
            </p>
            <Input
              label="Resume Name"
              value={resumeName}
              onChange={e => setResumeName(e.target.value)}
              placeholder="e.g., Google SWE Application"
              hint={`Saves with job: ${jobDescription.split('\n')[0].slice(0, 40)}...`}
            />
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={handleSaveResume} className="flex-1 justify-center">
                <Save size={14} />
                Save Resume
              </Button>
              <Button variant="secondary" onClick={() => setShowSaveModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisResults({ analysis }: { analysis: AIAnalysisResult }) {
  const [open, setOpen] = useState<string | null>('overview');

  const sections = [
    { id: 'overview',   label: 'Job Overview',     content: <JobOverview analysis={analysis} /> },
    { id: 'match',      label: 'Profile Match',     content: <ProfileMatchView match={analysis.profileMatch} /> },
    { id: 'strategy',   label: 'Resume Strategy',   content: <StrategyView strategy={analysis.strategy} /> },
    { id: 'keywords',   label: 'Keyword Analysis',  content: <KeywordsView kw={analysis.keywordOptimization} /> },
    { id: 'ats',        label: 'ATS Review',        content: <ATSView ats={analysis.atsReview} /> },
    { id: 'recruiter',  label: 'Recruiter Review',  content: <RecruiterView rec={analysis.recruiterReview} /> },
    { id: 'audit',      label: 'Quality Audit',     content: <AuditView audit={analysis.qualityAudit} /> },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-dark-900">Analysis Results</h3>
      {sections.map(s => (
        <div key={s.id} className="bg-white border border-dark-200/50 rounded-xl overflow-hidden shadow-card">
          <button
            onClick={() => setOpen(open === s.id ? null : s.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-50 transition-colors"
          >
            <span className="text-sm font-semibold text-dark-800">{s.label}</span>
            <ChevronRight size={14} className={`text-dark-700/40 transition-transform ${open === s.id ? 'rotate-90' : ''}`} />
          </button>
          {open === s.id && <div className="px-4 pb-4 border-t border-dark-200/30">{s.content}</div>}
        </div>
      ))}
    </div>
  );
}

function JobOverview({ analysis }: { analysis: AIAnalysisResult }) {
  const j = analysis.jobAnalysis;
  return (
    <div className="pt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-dark-50 rounded-xl px-3 py-2"><span className="text-dark-700/50">Seniority</span><div className="font-semibold text-dark-900 mt-0.5">{j.seniority || '—'}</div></div>
        <div className="bg-dark-50 rounded-xl px-3 py-2"><span className="text-dark-700/50">Industry</span><div className="font-semibold text-dark-900 mt-0.5">{j.industry || '—'}</div></div>
        <div className="bg-dark-50 rounded-xl px-3 py-2"><span className="text-dark-700/50">Role Type</span><div className="font-semibold text-dark-900 mt-0.5">{j.roleType || '—'}</div></div>
        <div className="bg-dark-50 rounded-xl px-3 py-2"><span className="text-dark-700/50">Company</span><div className="font-semibold text-dark-900 mt-0.5">{j.companyType || '—'}</div></div>
      </div>
      <TagList title="Required Skills" tags={j.requiredSkills} color="red" />
      <TagList title="Keywords" tags={j.keywords.slice(0, 12)} color="blue" />
      <TagList title="Technologies" tags={j.technologies} color="gray" />
      {j.summary && <p className="text-xs text-dark-700/60 italic">{j.summary}</p>}
    </div>
  );
}

function ProfileMatchView({ match }: { match: AIAnalysisResult['profileMatch'] }) {
  return (
    <div className="pt-3 space-y-3">
      <ScoreBar label="Match Score" value={match.matchScore} />
      <TagList title="Matching Skills" tags={match.matchingSkills} color="green" />
      <TagList title="Missing Skills" tags={match.missingSkills} color="red" />
      <BulletList title="Recommendations" items={match.recommendations} />
      {match.summary && <p className="text-xs text-dark-700/60 italic">{match.summary}</p>}
    </div>
  );
}

function StrategyView({ strategy }: { strategy: AIAnalysisResult['strategy'] }) {
  return (
    <div className="pt-3 space-y-3">
      <BulletList title="Content to Emphasize" items={strategy.contentToEmphasize} />
      <BulletList title="Content to Minimize" items={strategy.contentToMinimize} />
      <BulletList title="Tone Recommendations" items={strategy.toneRecommendations} />
      {strategy.summary && <p className="text-xs text-dark-700/60 italic">{strategy.summary}</p>}
    </div>
  );
}

function KeywordsView({ kw }: { kw: AIAnalysisResult['keywordOptimization'] }) {
  return (
    <div className="pt-3 space-y-3">
      <ScoreBar label="Density Score" value={kw.densityScore} />
      <TagList title="Covered Keywords" tags={kw.coveredKeywords} color="green" />
      <TagList title="Missing Keywords" tags={kw.missingKeywords} color="red" />
      <BulletList title="Suggested Phrases" items={kw.suggestedPhrases} />
    </div>
  );
}

function ATSView({ ats }: { ats: AIAnalysisResult['atsReview'] }) {
  return (
    <div className="pt-3 space-y-3">
      <ScoreBar label="ATS Score" value={ats.score} />
      <BulletList title="Passed Checks" items={ats.passedChecks} icon="check" />
      <BulletList title="Failed Checks" items={ats.failedChecks} icon="x" />
      <BulletList title="Suggestions" items={ats.suggestions} />
    </div>
  );
}

function RecruiterView({ rec }: { rec: AIAnalysisResult['recruiterReview'] }) {
  return (
    <div className="pt-3 space-y-3">
      <ScoreBar label="Recruiter Score" value={rec.score} />
      {rec.firstImpression && (
        <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl">
          <p className="text-xs text-brand-600 font-semibold mb-1">First Impression</p>
          <p className="text-xs text-dark-700">{rec.firstImpression}</p>
        </div>
      )}
      <BulletList title="Strengths" items={rec.strengths} icon="check" />
      <BulletList title="Weaknesses" items={rec.weaknesses} icon="x" />
      <BulletList title="Suggestions" items={rec.suggestions} />
    </div>
  );
}

function AuditView({ audit }: { audit: AIAnalysisResult['qualityAudit'] }) {
  return (
    <div className="pt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <ScoreBar label="Overall" value={audit.overallScore} />
        <ScoreBar label="Impact" value={audit.impactScore} />
        <ScoreBar label="Clarity" value={audit.clarityScore} />
        <ScoreBar label="Relevance" value={audit.relevanceScore} />
      </div>
      <BulletList title="Issues" items={audit.issues} icon="x" />
      <BulletList title="Recommendations" items={audit.recommendations} />
      {audit.finalVerdict && (
        <div className="p-3 bg-brand-600 rounded-xl">
          <p className="text-xs text-blue-200 font-semibold mb-1">Final Verdict</p>
          <p className="text-xs text-white">{audit.finalVerdict}</p>
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const score = Math.min(100, Math.max(0, value || 0));
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500';
  const textColor = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-dark-700">{label}</span>
        <span className={`text-xs font-extrabold ${textColor}`}>{score}</span>
      </div>
      <div className="w-full bg-dark-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function TagList({ title, tags, color }: { title: string; tags: string[]; color: string }) {
  if (!tags?.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-dark-700/60 mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => <Badge key={t} color={color}>{t}</Badge>)}
      </div>
    </div>
  );
}

function BulletList({ title, items, icon }: { title: string; items: string[]; icon?: 'check' | 'x' }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-dark-700/60 mb-2">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-dark-700">
            <span className={`flex-shrink-0 mt-0.5 font-bold ${icon === 'check' ? 'text-emerald-500' : icon === 'x' ? 'text-red-400' : 'text-brand-400'}`}>
              {icon === 'check' ? '✓' : icon === 'x' ? '✗' : '•'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildScores(analysis: AIAnalysisResult) {
  return {
    overall: Math.round((analysis.qualityAudit.overallScore + analysis.atsReview.score + analysis.recruiterReview.score) / 3),
    ats: analysis.atsReview.score,
    recruiter: analysis.recruiterReview.score,
    keywordCoverage: analysis.keywordOptimization.densityScore,
    skillRelevance: analysis.profileMatch.matchScore,
    experienceRelevance: analysis.profileMatch.matchScore,
    projectRelevance: analysis.profileMatch.matchScore,
    impactStatements: analysis.qualityAudit.impactScore,
    readability: analysis.qualityAudit.clarityScore,
    formatting: 85,
    density: analysis.keywordOptimization.densityScore,
    missingKeywords: analysis.keywordOptimization.missingKeywords,
    missingSkills: analysis.profileMatch.missingSkills,
    suggestions: [...analysis.atsReview.suggestions, ...analysis.recruiterReview.suggestions].slice(0, 8),
    weaknesses: analysis.recruiterReview.weaknesses,
    strengths: analysis.recruiterReview.strengths,
  };
}
