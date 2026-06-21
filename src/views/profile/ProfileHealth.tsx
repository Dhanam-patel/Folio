import { useProfile } from '../../context/ProfileContext';

export function ProfileHealth() {
  const { profile } = useProfile();

  const checks = [
    { label: 'Name', done: !!profile.personal.name },
    { label: 'Email', done: !!profile.personal.email },
    { label: 'Location', done: !!profile.personal.location },
    { label: 'Education', done: profile.education.length > 0 },
    { label: 'Experience', done: profile.experience.length > 0 },
    { label: 'Projects', done: profile.projects.length > 0 },
    { label: 'Skills', done: (profile.skills.languages.length + profile.skills.frameworks.length) > 0 },
    { label: 'LinkedIn', done: !!profile.personal.linkedin },
  ];

  const score = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
  const color = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  const bg = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="bg-dark-900 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Profile Health</span>
        <span className={`text-sm font-extrabold ${color}`}>{score}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5 mb-3 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${bg}`} style={{ width: `${score}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.done ? 'bg-emerald-400' : 'bg-white/15'}`} />
            <span className={`text-[10px] font-medium ${c.done ? 'text-white/70' : 'text-white/25'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
