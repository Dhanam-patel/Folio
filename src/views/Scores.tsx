import { TrendingUp, Target, FileCheck, Users, Zap, Award } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui';
import { ResumeScores } from '../types/resume';

export function Scores() {
  const { currentResume } = useProfile();
  const { setView } = useApp();
  const scores = currentResume.scores;

  if (!scores) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f0f4ff]">
        <div className="text-center max-w-sm animate-fade-up">
          <div className="w-16 h-16 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Zap size={28} className="text-brand-500" />
          </div>
          <h3 className="text-xl font-extrabold text-dark-900 mb-2 tracking-tight">No analysis yet</h3>
          <p className="text-sm text-dark-700/60 mb-6">
            Run the AI analysis from the Workspace to generate your resume intelligence report.
          </p>
          <button
            onClick={() => setView('workspace')}
            className="btn-blue text-sm"
          >
            <Zap size={14} /> Go to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f0f4ff]">
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <OverallScoreHeader scores={scores} />
        <ScoreGrid scores={scores} />
        <div className="grid grid-cols-2 gap-5">
          <KeywordGapPanel scores={scores} />
          <OpportunitiesPanel scores={scores} />
        </div>
        <StrengthsWeaknessesPanel scores={scores} />
      </div>
    </div>
  );
}

function OverallScoreHeader({ scores }: { scores: ResumeScores }) {
  const overall = Math.round(scores.overall || 0);
  const label = overall >= 80 ? 'Excellent' : overall >= 65 ? 'Good' : overall >= 50 ? 'Fair' : 'Needs Work';
  const ringColor = overall >= 80 ? '#10b981' : overall >= 65 ? '#f59e0b' : overall >= 50 ? '#f97316' : '#ef4444';
  const textColor = overall >= 80 ? 'text-emerald-500' : overall >= 65 ? 'text-amber-500' : overall >= 50 ? 'text-orange-500' : 'text-red-500';
  const bgLabel = overall >= 80 ? 'bg-emerald-100 text-emerald-700' : overall >= 65 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';

  return (
    <div className="bg-white rounded-3xl border border-dark-200/50 p-7 shadow-card flex items-center gap-8 animate-fade-up">
      {/* Ring score */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#f0f4ff" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="40"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - overall / 100)}`}
            transform="rotate(-90 48 48)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black ${textColor}`}>{overall}</span>
          <span className="text-[10px] text-dark-700/40 font-medium">/100</span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1.5">
          <h2 className="text-xl font-extrabold text-dark-900 tracking-tight">Overall Resume Score</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${bgLabel}`}>{label}</span>
        </div>
        <p className="text-sm text-dark-700/60 leading-relaxed">
          Composite score based on ATS compatibility, recruiter appeal, keyword coverage, and content quality.
        </p>
        {scores.suggestions?.[0] && (
          <div className="mt-3 inline-flex items-center gap-2 text-sm text-brand-700 font-semibold bg-brand-50 border border-brand-100 rounded-xl px-3 py-1.5">
            <Award size={13} />
            {scores.suggestions[0]}
          </div>
        )}
      </div>
    </div>
  );
}

const SCORE_CARDS = [
  { key: 'ats',            label: 'ATS Score',         icon: FileCheck,   desc: 'Applicant tracking system compatibility' },
  { key: 'recruiter',      label: 'Recruiter Appeal',  icon: Users,       desc: 'Human recruiter readability & impact' },
  { key: 'keywordCoverage',label: 'Keyword Coverage',  icon: Target,      desc: 'Job description keyword match rate' },
  { key: 'skillRelevance', label: 'Skill Relevance',   icon: Zap,         desc: 'Skills aligned with role requirements' },
  { key: 'impactStatements',label: 'Impact Statements',icon: TrendingUp,  desc: 'Quality of quantified achievements' },
  { key: 'readability',    label: 'Readability',       icon: FileCheck,   desc: 'Clarity and writing quality' },
] as const;

function ScoreGrid({ scores }: { scores: ResumeScores }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {SCORE_CARDS.map(({ key, label, icon: Icon, desc }) => {
        const val = Math.round(scores[key as keyof ResumeScores] as number || 0);
        const color = val >= 75 ? 'text-emerald-600' : val >= 50 ? 'text-amber-500' : 'text-red-500';
        const bg    = val >= 75 ? 'bg-emerald-500'  : val >= 50 ? 'bg-amber-400'   : 'bg-red-500';
        const ring  = val >= 75 ? 'bg-emerald-50'   : val >= 50 ? 'bg-amber-50'    : 'bg-red-50';

        return (
          <div key={key} className="bg-white border border-dark-200/50 rounded-2xl p-5 shadow-card hover:shadow-card-lg transition-shadow">
            <div className={`w-8 h-8 rounded-xl ${ring} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className="flex items-end gap-1 mb-2">
              <span className={`text-3xl font-black ${color}`}>{val}</span>
              <span className="text-xs text-dark-700/40 mb-1 font-medium">/100</span>
            </div>
            <div className="w-full bg-dark-100 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className={`h-1.5 rounded-full transition-all duration-700 ${bg}`} style={{ width: `${val}%` }} />
            </div>
            <p className="text-xs font-semibold text-dark-900 mb-0.5">{label}</p>
            <p className="text-xs text-dark-700/50">{desc}</p>
          </div>
        );
      })}
    </div>
  );
}

function KeywordGapPanel({ scores }: { scores: ResumeScores }) {
  return (
    <div className="bg-white border border-dark-200/50 rounded-2xl p-5 shadow-card">
      <h3 className="text-sm font-bold text-dark-900 mb-4 flex items-center gap-2">
        <Target size={15} className="text-brand-500" />
        Keyword Gap Analysis
      </h3>
      {scores.missingKeywords?.length > 0 ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-red-500 mb-2 uppercase tracking-wide">Missing Keywords ({scores.missingKeywords.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {scores.missingKeywords.map(kw => <Badge key={kw} color="red">{kw}</Badge>)}
            </div>
          </div>
          {scores.missingSkills?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-wide">Skill Gaps</p>
              <div className="flex flex-wrap gap-1.5">
                {scores.missingSkills.slice(0, 8).map(s => <Badge key={s} color="yellow">{s}</Badge>)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-emerald-600 font-semibold flex items-center gap-2">
          <span className="text-emerald-500">✓</span> Excellent keyword coverage!
        </p>
      )}
    </div>
  );
}

function OpportunitiesPanel({ scores }: { scores: ResumeScores }) {
  return (
    <div className="bg-brand-600 rounded-2xl p-5 text-white">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp size={15} className="text-blue-200" />
        Improvement Opportunities
      </h3>
      {scores.suggestions?.length > 0 ? (
        <ul className="space-y-2.5">
          {scores.suggestions.slice(0, 5).map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-blue-100">
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-blue-200">No improvement opportunities identified.</p>
      )}
    </div>
  );
}

function StrengthsWeaknessesPanel({ scores }: { scores: ResumeScores }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-bold text-dark-900 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">✓</span>
          Strengths
        </h3>
        {scores.strengths?.length > 0 ? (
          <ul className="space-y-2">
            {scores.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dark-700">
                <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-dark-700/50">Run analysis to identify strengths.</p>
        )}
      </div>
      <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-card">
        <h3 className="text-sm font-bold text-dark-900 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs">→</span>
          Areas to Improve
        </h3>
        {scores.weaknesses?.length > 0 ? (
          <ul className="space-y-2">
            {scores.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-dark-700">
                <span className="text-red-400 flex-shrink-0 mt-0.5">→</span>
                {w}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-dark-700/50">No weaknesses detected.</p>
        )}
      </div>
    </div>
  );
}
