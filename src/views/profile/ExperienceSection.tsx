import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { Experience } from '../../types/profile';
import { Input, Select, Button, SectionHeader, TagInput, BulletListInput } from '../../components/ui';
import { nanoid } from '../../lib/nanoid';

const TYPE_OPTIONS = [
  { value: 'full-time',  label: 'Full-time' },
  { value: 'part-time',  label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract',   label: 'Contract' },
  { value: 'freelance',  label: 'Freelance' },
];

function blank(): Experience {
  return { id: nanoid(), company: '', role: '', location: '', startDate: '', endDate: '', current: false, type: 'full-time', responsibilities: [''], achievements: [], technologies: [], impact: '' };
}

export function ExperienceSection() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(profile.experience[0]?.id ?? null);

  const update = (id: string, field: keyof Experience, value: unknown) =>
    updateProfile({ experience: profile.experience.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const add = () => {
    const item = blank();
    updateProfile({ experience: [...profile.experience, item] });
    setExpanded(item.id);
  };

  return (
    <div>
      <SectionHeader
        title="Experience"
        description="Add your professional work history."
        action={<Button size="sm" onClick={add}><Plus size={13} /> Add Experience</Button>}
      />

      {profile.experience.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Briefcase size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No experience added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {profile.experience.map(exp => (
          <div key={exp.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-dark-50 transition-colors"
              onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
            >
              <div className="w-8 h-8 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                <Briefcase size={15} className="text-accent-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-dark-900 truncate">{exp.role || 'New Role'}{exp.company ? ` @ ${exp.company}` : ''}</p>
                <p className="text-xs text-dark-700/50">{exp.type} · {exp.startDate || '—'} – {exp.current ? 'Present' : (exp.endDate || '—')}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={e => { e.stopPropagation(); updateProfile({ experience: profile.experience.filter(x => x.id !== exp.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={13} />
                </button>
                {expanded === exp.id ? <ChevronUp size={15} className="text-dark-700/40" /> : <ChevronDown size={15} className="text-dark-700/40" />}
              </div>
            </div>
            {expanded === exp.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-dark-200/30">
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Input label="Company *" value={exp.company} onChange={e => update(exp.id, 'company', e.target.value)} placeholder="Google" />
                  <Input label="Role *" value={exp.role} onChange={e => update(exp.id, 'role', e.target.value)} placeholder="Software Engineer" />
                  <Input label="Location" value={exp.location} onChange={e => update(exp.id, 'location', e.target.value)} placeholder="Mountain View, CA" />
                  <Select label="Type" value={exp.type} options={TYPE_OPTIONS} onChange={e => update(exp.id, 'type', e.target.value as Experience['type'])} />
                  <Input label="Start Date" type="month" value={exp.startDate} onChange={e => update(exp.id, 'startDate', e.target.value)} />
                  <Input label="End Date" type="month" value={exp.endDate} onChange={e => update(exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`cur-${exp.id}`} checked={exp.current} onChange={e => update(exp.id, 'current', e.target.checked)} className="rounded accent-brand-600" />
                  <label htmlFor={`cur-${exp.id}`} className="text-xs font-medium text-dark-700">Currently working here</label>
                </div>
                <BulletListInput label="Responsibilities & Achievements" items={exp.responsibilities} onChange={v => update(exp.id, 'responsibilities', v)} placeholder="Describe a key responsibility or achievement…" />
                <TagInput label="Technologies Used" tags={exp.technologies} onAdd={t => update(exp.id, 'technologies', [...exp.technologies, t])} onRemove={t => update(exp.id, 'technologies', exp.technologies.filter(x => x !== t))} placeholder="React, Python, AWS…" />
                <Input label="Impact / Key Metric" value={exp.impact} onChange={e => update(exp.id, 'impact', e.target.value)} placeholder="e.g. Reduced latency by 40%, increased revenue by $2M" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
