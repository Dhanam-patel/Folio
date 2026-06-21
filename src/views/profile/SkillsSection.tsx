import { useProfile } from '../../context/ProfileContext';
import { Skills } from '../../types/profile';
import { SectionHeader, TagInput } from '../../components/ui';

type SkillField = keyof Omit<Skills, 'categories'>;

const SKILL_GROUPS: { key: SkillField; label: string; placeholder: string }[] = [
  { key: 'languages',  label: 'Programming Languages',   placeholder: 'Python, JavaScript, Go…' },
  { key: 'frameworks', label: 'Frameworks & Libraries',  placeholder: 'React, FastAPI, TensorFlow…' },
  { key: 'tools',      label: 'Developer Tools',         placeholder: 'Git, Docker, Kubernetes…' },
  { key: 'databases',  label: 'Databases',               placeholder: 'PostgreSQL, MongoDB, Redis…' },
  { key: 'cloud',      label: 'Cloud & DevOps',          placeholder: 'AWS, GCP, Azure…' },
  { key: 'soft',       label: 'Soft Skills',             placeholder: 'Leadership, Communication…' },
  { key: 'other',      label: 'Other / Miscellaneous',   placeholder: 'SEO, Agile, REST APIs…' },
];

export function SkillsSection() {
  const { profile, updateProfile } = useProfile();
  const skills = profile.skills;
  const update = (field: SkillField, tags: string[]) => updateProfile({ skills: { ...skills, [field]: tags } });
  const total = Object.values(skills).flat().filter(v => typeof v === 'string').length;

  return (
    <div>
      <SectionHeader
        title="Skills"
        description="Organize your technical and professional skills."
        action={<span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">{total} skills</span>}
      />
      <div className="bg-white rounded-2xl border border-dark-200/50 shadow-card p-6 space-y-5">
        {SKILL_GROUPS.map(group => (
          <TagInput
            key={group.key}
            label={group.label}
            tags={skills[group.key]}
            onAdd={t => update(group.key, [...skills[group.key], t])}
            onRemove={t => update(group.key, skills[group.key].filter(x => x !== t))}
            placeholder={group.placeholder}
          />
        ))}
        <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
          <p className="text-xs text-brand-700 font-semibold mb-0.5">Tip: Use comma or Enter to add multiple skills</p>
          <p className="text-xs text-brand-600/70">Be specific — "React.js" is better than "JavaScript frameworks".</p>
        </div>
      </div>
    </div>
  );
}
