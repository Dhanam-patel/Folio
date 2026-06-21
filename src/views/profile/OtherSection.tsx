import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Award, Users, Code2, BookOpen, Lightbulb, Globe, Heart, Shield, Briefcase } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { Certification, Achievement, Hackathon, Leadership, Volunteering, Publication, Research, Patent, OpenSourceContribution, Membership } from '../../types/profile';
import { Input, Textarea, Button, SectionHeader, TagInput } from '../../components/ui';
import { nanoid } from '../../lib/nanoid';

type OtherTab = 'certifications' | 'achievements' | 'hackathons' | 'leadership' | 'volunteering' | 'publications' | 'research' | 'patents' | 'opensource' | 'memberships';

const TABS: { id: OtherTab; label: string; icon: React.ReactNode }[] = [
  { id: 'certifications', label: 'Certifications', icon: <Award size={14} /> },
  { id: 'achievements',   label: 'Awards', icon: <Award size={14} /> },
  { id: 'hackathons',     label: 'Hackathons', icon: <Code2 size={14} /> },
  { id: 'leadership',     label: 'Leadership', icon: <Users size={14} /> },
  { id: 'volunteering',   label: 'Volunteering', icon: <Heart size={14} /> },
  { id: 'publications',   label: 'Publications', icon: <BookOpen size={14} /> },
  { id: 'research',       label: 'Research', icon: <Lightbulb size={14} /> },
  { id: 'patents',        label: 'Patents', icon: <Shield size={14} /> },
  { id: 'opensource',     label: 'Open Source', icon: <Globe size={14} /> },
  { id: 'memberships',    label: 'Memberships', icon: <Briefcase size={14} /> },
];

export function OtherSection() {
  const [tab, setTab] = useState<OtherTab>('certifications');

  return (
    <div>
      <SectionHeader title="Additional Sections" description="Certifications, awards, leadership, publications, and more." />
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              tab === t.id ? 'bg-brand-600 text-white shadow-blue' : 'bg-white text-dark-700 border border-dark-200/50 hover:bg-dark-50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'certifications' && <CertificationsPanel />}
      {tab === 'achievements'   && <AchievementsPanel />}
      {tab === 'hackathons'     && <HackathonsPanel />}
      {tab === 'leadership'     && <LeadershipPanel />}
      {tab === 'volunteering'   && <VolunteeringPanel />}
      {tab === 'publications'   && <PublicationsPanel />}
      {tab === 'research'       && <ResearchPanel />}
      {tab === 'patents'        && <PatentsPanel />}
      {tab === 'opensource'     && <OpenSourcePanel />}
      {tab === 'memberships'    && <MembershipsPanel />}
    </div>
  );
}

function CertificationsPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.certifications;

  const update = (id: string, field: keyof Certification, value: string) =>
    updateProfile({ certifications: items.map(c => c.id === id ? { ...c, [field]: value } : c) });

  const add = () => {
    const item: Certification = { id: nanoid(), name: '', issuer: '', date: '', expiry: '', credentialId: '', url: '' };
    updateProfile({ certifications: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Certification</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Award size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No certifications added yet.</p>
        </div>
      )}
      {items.map(cert => (
        <div key={cert.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === cert.id ? null : cert.id)}>
            <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center">
              <Award size={14} className="text-accent-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{cert.name || 'New Certification'}</p>
              <p className="text-xs text-dark-700/50">{cert.issuer}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ certifications: items.filter(c => c.id !== cert.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === cert.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === cert.id && (
            <div className="px-5 pb-4 grid grid-cols-2 gap-3 border-t border-dark-200/30 pt-4">
              <Input label="Name" value={cert.name} onChange={e => update(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" />
              <Input label="Issuer" value={cert.issuer} onChange={e => update(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
              <Input label="Date" type="month" value={cert.date} onChange={e => update(cert.id, 'date', e.target.value)} />
              <Input label="Expiry" type="month" value={cert.expiry} onChange={e => update(cert.id, 'expiry', e.target.value)} />
              <Input label="Credential ID" value={cert.credentialId} onChange={e => update(cert.id, 'credentialId', e.target.value)} placeholder="ABC123" />
              <Input label="URL" value={cert.url} onChange={e => update(cert.id, 'url', e.target.value)} placeholder="https://…" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AchievementsPanel() {
  const { profile, updateProfile } = useProfile();
  const items = profile.achievements;

  const update = (id: string, field: keyof Achievement, value: string) =>
    updateProfile({ achievements: items.map(a => a.id === id ? { ...a, [field]: value } : a) });

  const add = () => updateProfile({ achievements: [...items, { id: nanoid(), title: '', issuer: '', date: '', description: '' }] });

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Achievement</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Award size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No achievements added yet.</p>
        </div>
      )}
      {items.map(a => (
        <div key={a.id} className="bg-white border border-dark-200/50 rounded-2xl p-5 shadow-card">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Title" value={a.title} onChange={e => update(a.id, 'title', e.target.value)} placeholder="Dean's List" className="col-span-2" />
            <Input label="Issuer" value={a.issuer} onChange={e => update(a.id, 'issuer', e.target.value)} placeholder="University" />
            <Input label="Date" type="month" value={a.date} onChange={e => update(a.id, 'date', e.target.value)} />
            <Textarea label="Description" value={a.description} onChange={e => update(a.id, 'description', e.target.value)} rows={2} className="col-span-2" />
            <div className="col-span-2 flex justify-end">
              <button onClick={() => updateProfile({ achievements: items.filter(x => x.id !== a.id) })} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HackathonsPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.hackathons;

  const update = (id: string, field: keyof Hackathon, value: unknown) =>
    updateProfile({ hackathons: items.map(h => h.id === id ? { ...h, [field]: value } : h) });

  const add = () => {
    const item: Hackathon = { id: nanoid(), name: '', organizer: '', date: '', placement: '', project: '', description: '', techStack: [], url: '' };
    updateProfile({ hackathons: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Hackathon</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Code2 size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No hackathons added yet.</p>
        </div>
      )}
      {items.map(h => (
        <div key={h.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <Code2 size={14} className="text-brand-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{h.name || 'New Hackathon'}</p>
              <p className="text-xs text-dark-700/50">{h.placement ? `${h.placement} · ` : ''}{h.date}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ hackathons: items.filter(x => x.id !== h.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === h.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === h.id && (
            <div className="px-5 pb-4 grid grid-cols-2 gap-3 border-t border-dark-200/30 pt-4">
              <Input label="Hackathon Name" value={h.name} onChange={e => update(h.id, 'name', e.target.value)} placeholder="HackMIT 2024" />
              <Input label="Organizer" value={h.organizer} onChange={e => update(h.id, 'organizer', e.target.value)} placeholder="MIT" />
              <Input label="Date" type="month" value={h.date} onChange={e => update(h.id, 'date', e.target.value)} />
              <Input label="Placement" value={h.placement} onChange={e => update(h.id, 'placement', e.target.value)} placeholder="1st Place, Finalist…" />
              <Input label="Project Name" value={h.project} onChange={e => update(h.id, 'project', e.target.value)} className="col-span-2" />
              <Textarea label="Description" value={h.description} onChange={e => update(h.id, 'description', e.target.value)} rows={2} className="col-span-2" />
              <TagInput label="Tech Stack" tags={h.techStack} onAdd={t => update(h.id, 'techStack', [...h.techStack, t])} onRemove={t => update(h.id, 'techStack', h.techStack.filter(x => x !== t))} placeholder="React, Node.js…" className="col-span-2" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LeadershipPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.leadership;

  const update = (id: string, field: keyof Leadership, value: unknown) =>
    updateProfile({ leadership: items.map(l => l.id === id ? { ...l, [field]: value } : l) });

  const add = () => {
    const item: Leadership = { id: nanoid(), title: '', organization: '', startDate: '', endDate: '', current: false, description: '', achievements: [] };
    updateProfile({ leadership: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Leadership Role</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Users size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No leadership roles added yet.</p>
        </div>
      )}
      {items.map(l => (
        <div key={l.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <Users size={14} className="text-brand-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{l.title || 'New Leadership Role'}</p>
              <p className="text-xs text-dark-700/50">{l.organization}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ leadership: items.filter(x => x.id !== l.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === l.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === l.id && (
            <div className="px-5 pb-4 space-y-3 border-t border-dark-200/30 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Title" value={l.title} onChange={e => update(l.id, 'title', e.target.value)} placeholder="President, Tech Lead…" />
                <Input label="Organization" value={l.organization} onChange={e => update(l.id, 'organization', e.target.value)} placeholder="Club, Non-profit…" />
                <Input label="Start Date" type="month" value={l.startDate} onChange={e => update(l.id, 'startDate', e.target.value)} />
                <Input label="End Date" type="month" value={l.endDate} onChange={e => update(l.id, 'endDate', e.target.value)} disabled={l.current} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id={`cur-l-${l.id}`} checked={l.current} onChange={e => update(l.id, 'current', e.target.checked)} className="rounded accent-brand-600" />
                <label htmlFor={`cur-l-${l.id}`} className="text-xs font-medium text-dark-700">Currently active</label>
              </div>
              <Textarea label="Description" value={l.description} onChange={e => update(l.id, 'description', e.target.value)} rows={2} placeholder="Describe your role and responsibilities…" />
              <TagInput label="Key Achievements" tags={l.achievements} onAdd={t => update(l.id, 'achievements', [...l.achievements, t])} onRemove={t => update(l.id, 'achievements', l.achievements.filter(x => x !== t))} placeholder="Increased membership 50%, Organized 10+ events…" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VolunteeringPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.volunteering;

  const update = (id: string, field: keyof Volunteering, value: unknown) =>
    updateProfile({ volunteering: items.map(v => v.id === id ? { ...v, [field]: value } : v) });

  const add = () => {
    const item: Volunteering = { id: nanoid(), organization: '', role: '', startDate: '', endDate: '', current: false, description: '', impact: '' };
    updateProfile({ volunteering: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Volunteer Role</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Heart size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No volunteer work added yet.</p>
        </div>
      )}
      {items.map(v => (
        <div key={v.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === v.id ? null : v.id)}>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Heart size={14} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{v.role || 'New Volunteer Role'}</p>
              <p className="text-xs text-dark-700/50">{v.organization}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ volunteering: items.filter(x => x.id !== v.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === v.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === v.id && (
            <div className="px-5 pb-4 space-y-3 border-t border-dark-200/30 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Role" value={v.role} onChange={e => update(v.id, 'role', e.target.value)} placeholder="Volunteer Tutor, Mentor…" />
                <Input label="Organization" value={v.organization} onChange={e => update(v.id, 'organization', e.target.value)} placeholder=" charity, Non-profit…" />
                <Input label="Start Date" type="month" value={v.startDate} onChange={e => update(v.id, 'startDate', e.target.value)} />
                <Input label="End Date" type="month" value={v.endDate} onChange={e => update(v.id, 'endDate', e.target.value)} disabled={v.current} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id={`cur-v-${v.id}`} checked={v.current} onChange={e => update(v.id, 'current', e.target.checked)} className="rounded accent-brand-600" />
                <label htmlFor={`cur-v-${v.id}`} className="text-xs font-medium text-dark-700">Ongoing</label>
              </div>
              <Textarea label="Description" value={v.description} onChange={e => update(v.id, 'description', e.target.value)} rows={2} placeholder="What did you do?" />
              <Input label="Impact" value={v.impact} onChange={e => update(v.id, 'impact', e.target.value)} placeholder="Tutored 20 students, Raised $5k… " />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PublicationsPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.publications;

  const update = (id: string, field: keyof Publication, value: unknown) =>
    updateProfile({ publications: items.map(p => p.id === id ? { ...p, [field]: value } : p) });

  const add = () => {
    const item: Publication = { id: nanoid(), title: '', journal: '', date: '', authors: [], url: '', doi: '', abstract: '' };
    updateProfile({ publications: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Publication</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <BookOpen size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No publications added yet.</p>
        </div>
      )}
      {items.map(p => (
        <div key={p.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <BookOpen size={14} className="text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{p.title || 'New Publication'}</p>
              <p className="text-xs text-dark-700/50">{p.journal}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ publications: items.filter(x => x.id !== p.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === p.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === p.id && (
            <div className="px-5 pb-4 space-y-3 border-t border-dark-200/30 pt-4">
              <Input label="Title" value={p.title} onChange={e => update(p.id, 'title', e.target.value)} placeholder="Publication title" className="col-span-2" />
              <Input label="Journal / Conference" value={p.journal} onChange={e => update(p.id, 'journal', e.target.value)} placeholder="Nature, IEEE, ACM…" />
              <Input label="Date" type="month" value={p.date} onChange={e => update(p.id, 'date', e.target.value)} />
              <Input label="URL" value={p.url} onChange={e => update(p.id, 'url', e.target.value)} placeholder="https://…" />
              <Input label="DOI" value={p.doi} onChange={e => update(p.id, 'doi', e.target.value)} placeholder="10.xxxx/xxxxx" />
              <TagInput label="Co-Authors" tags={p.authors} onAdd={t => update(p.id, 'authors', [...p.authors, t])} onRemove={t => update(p.id, 'authors', p.authors.filter(x => x !== t))} placeholder="Author names…" className="col-span-2" />
              <Textarea label="Abstract" value={p.abstract} onChange={e => update(p.id, 'abstract', e.target.value)} rows={3} placeholder="Brief summary of the publication…" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResearchPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.research;

  const update = (id: string, field: keyof Research, value: unknown) =>
    updateProfile({ research: items.map(r => r.id === id ? { ...r, [field]: value } : r) });

  const add = () => {
    const item: Research = { id: nanoid(), title: '', institution: '', role: '', startDate: '', endDate: '', current: false, description: '', outcomes: [] };
    updateProfile({ research: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Research</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Lightbulb size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No research experience added yet.</p>
        </div>
      )}
      {items.map(r => (
        <div key={r.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Lightbulb size={14} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{r.title || 'New Research'}</p>
              <p className="text-xs text-dark-700/50">{r.institution}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ research: items.filter(x => x.id !== r.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === r.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === r.id && (
            <div className="px-5 pb-4 space-y-3 border-t border-dark-200/30 pt-4">
              <Input label="Research Title" value={r.title} onChange={e => update(r.id, 'title', e.target.value)} placeholder="Machine Learning for X…" />
              <Input label="Institution" value={r.institution} onChange={e => update(r.id, 'institution', e.target.value)} placeholder="University Lab, Research Institute…" />
              <Input label="Role" value={r.role} onChange={e => update(r.id, 'role', e.target.value)} placeholder="Research Assistant, Lead Investigator…" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" type="month" value={r.startDate} onChange={e => update(r.id, 'startDate', e.target.value)} />
                <Input label="End Date" type="month" value={r.endDate} onChange={e => update(r.id, 'endDate', e.target.value)} disabled={r.current} />
              </div>
              <Textarea label="Description" value={r.description} onChange={e => update(r.id, 'description', e.target.value)} rows={2} placeholder="Describe your research focus and methodology…" />
              <TagInput label="Key Outcomes" tags={r.outcomes} onAdd={t => update(r.id, 'outcomes', [...r.outcomes, t])} onRemove={t => update(r.id, 'outcomes', r.outcomes.filter(x => x !== t))} placeholder="Published paper, Patent filed, Dataset created…" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PatentsPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.patents;

  const update = (id: string, field: keyof Patent, value: string) =>
    updateProfile({ patents: items.map(p => p.id === id ? { ...p, [field]: value } : p) });

  const add = () => {
    const item: Patent = { id: nanoid(), title: '', number: '', date: '', status: '', description: '' };
    updateProfile({ patents: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Patent</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Shield size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No patents added yet.</p>
        </div>
      )}
      {items.map(p => (
        <div key={p.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Shield size={14} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{p.title || 'New Patent'}</p>
              <p className="text-xs text-dark-700/50">{p.status}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ patents: items.filter(x => x.id !== p.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === p.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === p.id && (
            <div className="px-5 pb-4 grid grid-cols-2 gap-3 border-t border-dark-200/30 pt-4">
              <Input label="Title" value={p.title} onChange={e => update(p.id, 'title', e.target.value)} placeholder="Patent title" className="col-span-2" />
              <Input label="Patent Number" value={p.number} onChange={e => update(p.id, 'number', e.target.value)} placeholder="US12345678" />
              <Input label="Date" type="month" value={p.date} onChange={e => update(p.id, 'date', e.target.value)} />
              <Input label="Status" value={p.status} onChange={e => update(p.id, 'status', e.target.value)} placeholder="Pending, Granted, Filed…" />
              <Textarea label="Description" value={p.description} onChange={e => update(p.id, 'description', e.target.value)} rows={2} placeholder="Brief description of the invention…" className="col-span-2" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function OpenSourcePanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.opensource;

  const update = (id: string, field: keyof OpenSourceContribution, value: unknown) =>
    updateProfile({ opensource: items.map(o => o.id === id ? { ...o, [field]: value } : o) });

  const add = () => {
    const item: OpenSourceContribution = { id: nanoid(), project: '', organization: '', description: '', url: '', contributions: [], startDate: '', endDate: '', current: false };
    updateProfile({ opensource: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Contribution</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Globe size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No open source contributions added yet.</p>
        </div>
      )}
      {items.map(o => (
        <div key={o.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Globe size={14} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{o.project || 'New Contribution'}</p>
              <p className="text-xs text-dark-700/50">{o.organization}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ opensource: items.filter(x => x.id !== o.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === o.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === o.id && (
            <div className="px-5 pb-4 space-y-3 border-t border-dark-200/30 pt-4">
              <Input label="Project" value={o.project} onChange={e => update(o.id, 'project', e.target.value)} placeholder="React, TensorFlow, VS Code…" />
              <Input label="Organization" value={o.organization} onChange={e => update(o.id, 'organization', e.target.value)} placeholder="Meta, Google, Microsoft…" />
              <Input label="URL" value={o.url} onChange={e => update(o.id, 'url', e.target.value)} placeholder="https://github.com/…" />
              <Textarea label="Description" value={o.description} onChange={e => update(o.id, 'description', e.target.value)} rows={2} placeholder="What did you contribute?" />
              <TagInput label="Contributions" tags={o.contributions} onAdd={t => update(o.id, 'contributions', [...o.contributions, t])} onRemove={t => update(o.id, 'contributions', o.contributions.filter(x => x !== t))} placeholder="Bug fixes, Features, Documentation…" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" type="month" value={o.startDate} onChange={e => update(o.id, 'startDate', e.target.value)} />
                <Input label="End Date" type="month" value={o.endDate} onChange={e => update(o.id, 'endDate', e.target.value)} disabled={o.current} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MembershipsPanel() {
  const { profile, updateProfile } = useProfile();
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = profile.memberships;

  const update = (id: string, field: keyof Membership, value: unknown) =>
    updateProfile({ memberships: items.map(m => m.id === id ? { ...m, [field]: value } : m) });

  const add = () => {
    const item: Membership = { id: nanoid(), organization: '', role: '', startDate: '', endDate: '', current: false, description: '' };
    updateProfile({ memberships: [...items, item] });
    setExpanded(item.id);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={add}><Plus size={13} /> Add Membership</Button></div>
      {items.length === 0 && (
        <div className="border-2 border-dashed border-brand-200 bg-brand-50/50 rounded-2xl p-10 text-center">
          <Briefcase size={28} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-dark-700/50 font-medium">No memberships added yet.</p>
        </div>
      )}
      {items.map(m => (
        <div key={m.id} className="bg-white border border-dark-200/50 rounded-2xl overflow-hidden shadow-card">
          <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-dark-50" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Briefcase size={14} className="text-indigo-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark-900">{m.organization || 'New Membership'}</p>
              <p className="text-xs text-dark-700/50">{m.role}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={e => { e.stopPropagation(); updateProfile({ memberships: items.filter(x => x.id !== m.id) }); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-700/30 hover:text-red-500 hover:bg-red-50">
                <Trash2 size={13} />
              </button>
              {expanded === m.id ? <ChevronUp size={14} className="text-dark-700/40" /> : <ChevronDown size={14} className="text-dark-700/40" />}
            </div>
          </div>
          {expanded === m.id && (
            <div className="px-5 pb-4 space-y-3 border-t border-dark-200/30 pt-4">
              <Input label="Organization" value={m.organization} onChange={e => update(m.id, 'organization', e.target.value)} placeholder="ACM, IEEE, Tau Beta Pi…" />
              <Input label="Role" value={m.role} onChange={e => update(m.id, 'role', e.target.value)} placeholder="Member, Student Chair, President…" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" type="month" value={m.startDate} onChange={e => update(m.id, 'startDate', e.target.value)} />
                <Input label="End Date" type="month" value={m.endDate} onChange={e => update(m.id, 'endDate', e.target.value)} disabled={m.current} />
              </div>
              <Textarea label="Description" value={m.description} onChange={e => update(m.id, 'description', e.target.value)} rows={2} placeholder="Any notable activities or involvement…" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
