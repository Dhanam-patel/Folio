import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Wand2 } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { ProfessionalSummary } from '../../types/profile';
import { Input, Textarea, SectionHeader, TagInput } from '../../components/ui';

export function SummarySection() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState(false);
  const p = profile.personal;
  const summary = p.professionalSummary;

  const update = (field: keyof ProfessionalSummary, value: unknown) => {
    updateProfile({
      personal: {
        ...p,
        professionalSummary: { ...summary, [field]: value },
      },
    });
  };

  const generateRawText = (): string => {
    const parts: string[] = [];
    if (summary.headline) parts.push(summary.headline);
    if (summary.yearsExperience) parts.push(`${summary.yearsExperience} of experience`);
    if (summary.expertise.length > 0) parts.push(`Expertise in ${summary.expertise.join(', ')}`);
    if (summary.objective) parts.push(summary.objective);
    if (summary.highlights.length > 0) parts.push(summary.highlights.join('. '));
    return parts.join('. ');
  };

  const syncRawText = () => {
    const raw = generateRawText();
    update('rawText', raw);
    updateProfile({
      personal: {
        ...p,
        summary: raw,
        professionalSummary: { ...summary, rawText: raw },
      },
    });
  };

  const hasContent = summary.headline || summary.objective || summary.expertise.length > 0 || summary.highlights.length > 0;
  const preview = summary.rawText || p.summary || 'No summary yet';

  return (
    <div>
      <SectionHeader
        title="Professional Summary"
        description="Craft your elevator pitch with structured fields."
      />

      <div className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
        <div
          className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-dark-50 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <FileText size={15} className="text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-dark-900">Summary Builder</p>
              {hasContent && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-dark-700/50 truncate mt-0.5">
              {preview.length > 80 ? preview.slice(0, 80) + '…' : preview || 'Click to build your summary'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                syncRawText();
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-brand-600 hover:bg-brand-50 transition-all"
              title="Generate summary"
            >
              <Wand2 size={13} />
            </button>
            {expanded ? (
              <ChevronUp size={15} className="text-dark-700/40" />
            ) : (
              <ChevronDown size={15} className="text-dark-700/40" />
            )}
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-5 space-y-4 border-t border-dark-200/30">
            <div className="pt-4">
              <Input
                label="Professional Headline"
                value={summary.headline}
                onChange={(e) => update('headline', e.target.value)}
                placeholder="Senior Software Engineer | Full-Stack Developer"
                hint="A one-line title that defines who you are"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Years of Experience"
                value={summary.yearsExperience}
                onChange={(e) => update('yearsExperience', e.target.value)}
                placeholder="5+ years"
              />
              <div className="flex items-end">
                <p className="text-xs text-dark-700/50 pb-2">
                  Helps recruiters quickly gauge seniority
                </p>
              </div>
            </div>

            <TagInput
              label="Core Expertise"
              tags={summary.expertise}
              onAdd={(t) => update('expertise', [...summary.expertise, t])}
              onRemove={(t) => update('expertise', summary.expertise.filter((x) => x !== t))}
              placeholder="React, Node.js, System Design…"
            />

            <Textarea
              label="Career Objective"
              value={summary.objective}
              onChange={(e) => update('objective', e.target.value)}
              rows={2}
              placeholder="Seeking to leverage my experience in…"
              hint="What are you looking for next?"
            />

            <TagInput
              label="Key Highlights"
              tags={summary.highlights}
              onAdd={(t) => update('highlights', [...summary.highlights, t])}
              onRemove={(t) => update('highlights', summary.highlights.filter((x) => x !== t))}
              placeholder="Led team of 8 engineers, Reduced costs by 40%…"
            />

            <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
              <p className="text-xs text-brand-700 font-semibold mb-1">
                Live Preview
              </p>
              <p className="text-xs text-brand-600/80 leading-relaxed">
                {generateRawText() || 'Your generated summary will appear here…'}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={syncRawText}
                className="btn-primary text-xs py-2 px-4"
              >
                <Wand2 size={12} /> Apply to Resume
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Textarea
          label="Or Write Custom Summary"
          value={p.summary}
          onChange={(e) => updateProfile({ personal: { ...p, summary: e.target.value } })}
          rows={4}
          placeholder="A brief summary of your professional background, skills, and goals…"
          hint="This text will appear on your resume. Use the builder above or write freely here."
        />
      </div>
    </div>
  );
}
