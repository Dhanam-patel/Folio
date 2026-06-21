import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Code2, Star } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { Project } from '../../types/profile';
import { Input, Textarea, Button, SectionHeader, TagInput } from '../../components/ui';
import { nanoid } from '../../lib/nanoid';

function blank(): Project {
  return { id: nanoid(), name: '', summary: '', description: '', techStack: [], challenges: '', outcomes: '', metrics: '', repoUrl: '', demoUrl: '', awards: '', businessOutcome: '', startDate: '', endDate: '', current: false, featured: false };
}

export function ProjectsSection() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(profile.projects[0]?.id ?? null);

  const update = (id: string, field: keyof Project, value: unknown) =>
    updateProfile({ projects: profile.projects.map(p => p.id === id ? { ...p, [field]: value } : p) });

  const add = () => {
    const item = blank();
    updateProfile({ projects: [...profile.projects, item] });
    setExpanded(item.id);
  };

  return (
    <div>
      <SectionHeader
        title="Projects"
        description="Showcase your technical projects and outcomes."
        action={<Button size="sm" onClick={add}><Plus size={13} /> Add Project</Button>}
      />

      {profile.projects.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Code2 size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No projects added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {profile.projects.map(proj => (
          <div key={proj.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-dark-50 transition-colors"
              onClick={() => setExpanded(expanded === proj.id ? null : proj.id)}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${proj.featured ? 'bg-accent-500/15' : 'bg-brand-50'}`}>
                <Code2 size={15} className={proj.featured ? 'text-accent-500' : 'text-brand-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-dark-900 truncate">{proj.name || 'New Project'}</p>
                  {proj.featured && <Star size={12} className="text-accent-500 fill-accent-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-dark-700/50 truncate">{proj.techStack.slice(0, 4).join(', ') || 'No tech stack yet'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={e => { e.stopPropagation(); update(proj.id, 'featured', !proj.featured); }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${proj.featured ? 'text-accent-500 bg-accent-50' : 'text-dark-700/20 hover:text-accent-500 hover:bg-accent-50'}`}
                  title="Mark as featured"
                >
                  <Star size={12} className={proj.featured ? 'fill-accent-500' : ''} />
                </button>
                <button onClick={e => { e.stopPropagation(); updateProfile({ projects: profile.projects.filter(p => p.id !== proj.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={13} />
                </button>
                {expanded === proj.id ? <ChevronUp size={15} className="text-dark-700/40" /> : <ChevronDown size={15} className="text-dark-700/40" />}
              </div>
            </div>
            {expanded === proj.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-dark-200/30">
                <div className="pt-4">
                  <Input label="Project Name *" value={proj.name} onChange={e => update(proj.id, 'name', e.target.value)} placeholder="My Awesome Project" />
                </div>
                <Textarea label="Summary (resume bullet)" value={proj.summary} onChange={e => update(proj.id, 'summary', e.target.value)} rows={2} placeholder="One-line impact summary for your resume…" />
                <Textarea label="Description" value={proj.description} onChange={e => update(proj.id, 'description', e.target.value)} rows={3} placeholder="What did you build? Why? How?" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Repository URL" value={proj.repoUrl} onChange={e => update(proj.id, 'repoUrl', e.target.value)} placeholder="https://github.com/…" />
                  <Input label="Demo URL" value={proj.demoUrl} onChange={e => update(proj.id, 'demoUrl', e.target.value)} placeholder="https://…" />
                  <Input label="Start Date" type="month" value={proj.startDate} onChange={e => update(proj.id, 'startDate', e.target.value)} />
                  <Input label="End Date" type="month" value={proj.endDate} onChange={e => update(proj.id, 'endDate', e.target.value)} disabled={proj.current} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`cur-${proj.id}`} checked={proj.current} onChange={e => update(proj.id, 'current', e.target.checked)} className="rounded accent-brand-600" />
                  <label htmlFor={`cur-${proj.id}`} className="text-xs font-medium text-dark-700">In progress</label>
                </div>
                <TagInput label="Tech Stack" tags={proj.techStack} onAdd={t => update(proj.id, 'techStack', [...proj.techStack, t])} onRemove={t => update(proj.id, 'techStack', proj.techStack.filter(x => x !== t))} placeholder="React, Python, Docker…" />
                <Input label="Key Metrics" value={proj.metrics} onChange={e => update(proj.id, 'metrics', e.target.value)} placeholder="e.g. 10k users, 99.9% uptime, 50ms latency" />
                <Textarea label="Challenges Solved" value={proj.challenges} onChange={e => update(proj.id, 'challenges', e.target.value)} rows={2} placeholder="What technical challenges did you overcome?" />
                <Textarea label="Outcomes & Impact" value={proj.outcomes} onChange={e => update(proj.id, 'outcomes', e.target.value)} rows={2} placeholder="What was the end result?" />
                <Input label="Awards / Recognition" value={proj.awards} onChange={e => update(proj.id, 'awards', e.target.value)} placeholder="Winner at HackX 2024…" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
