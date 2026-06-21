import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { Education } from '../../types/profile';
import { Input, Button, SectionHeader, TagInput } from '../../components/ui';
import { nanoid } from '../../lib/nanoid';

function blank(): Education {
  return { id: nanoid(), institution: '', degree: '', field: '', location: '', startDate: '', endDate: '', current: false, gpa: '', coursework: [], achievements: [], honors: '' };
}

export function EducationSection() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(profile.education[0]?.id ?? null);

  const update = (id: string, field: keyof Education, value: unknown) =>
    updateProfile({ education: profile.education.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const add = () => {
    const item = blank();
    updateProfile({ education: [...profile.education, item] });
    setExpanded(item.id);
  };

  return (
    <div>
      <SectionHeader
        title="Education"
        description="Add your academic background."
        action={<Button size="sm" onClick={add}><Plus size={13} /> Add Education</Button>}
      />

      {profile.education.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <GraduationCap size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No education added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {profile.education.map(edu => (
          <div key={edu.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-dark-50 transition-colors"
              onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
            >
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={15} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-dark-900 truncate">{edu.institution || 'New Education'}{edu.degree ? ` — ${edu.degree}` : ''}</p>
                <p className="text-xs text-dark-700/50">{edu.field || 'Field of study'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={e => { e.stopPropagation(); updateProfile({ education: profile.education.filter(x => x.id !== edu.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={13} />
                </button>
                {expanded === edu.id ? <ChevronUp size={15} className="text-dark-700/40" /> : <ChevronDown size={15} className="text-dark-700/40" />}
              </div>
            </div>
            {expanded === edu.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-dark-200/30">
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Input label="Institution *" value={edu.institution} onChange={e => update(edu.id, 'institution', e.target.value)} placeholder="MIT" />
                  <Input label="Degree" value={edu.degree} onChange={e => update(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                  <Input label="Field of Study" value={edu.field} onChange={e => update(edu.id, 'field', e.target.value)} placeholder="Computer Science" />
                  <Input label="Location" value={edu.location} onChange={e => update(edu.id, 'location', e.target.value)} placeholder="Cambridge, MA" />
                  <Input label="Start Date" type="month" value={edu.startDate} onChange={e => update(edu.id, 'startDate', e.target.value)} />
                  <Input label="End Date" type="month" value={edu.endDate} onChange={e => update(edu.id, 'endDate', e.target.value)} disabled={edu.current} />
                  <Input label="GPA" value={edu.gpa} onChange={e => update(edu.id, 'gpa', e.target.value)} placeholder="3.9/4.0" />
                  <Input label="Honors" value={edu.honors} onChange={e => update(edu.id, 'honors', e.target.value)} placeholder="Magna Cum Laude" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`cur-${edu.id}`} checked={edu.current} onChange={e => update(edu.id, 'current', e.target.checked)} className="rounded accent-brand-600" />
                  <label htmlFor={`cur-${edu.id}`} className="text-xs font-medium text-dark-700">Currently enrolled</label>
                </div>
                <TagInput label="Relevant Coursework" tags={edu.coursework} onAdd={t => update(edu.id, 'coursework', [...edu.coursework, t])} onRemove={t => update(edu.id, 'coursework', edu.coursework.filter(c => c !== t))} placeholder="Add course…" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
