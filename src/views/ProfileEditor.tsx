import { useState } from 'react';
import { User, GraduationCap, Briefcase, Code2, Wrench, Star, ChevronRight } from 'lucide-react';
import { PersonalSection } from './profile/PersonalSection';
import { EducationSection } from './profile/EducationSection';
import { ExperienceSection } from './profile/ExperienceSection';
import { ProjectsSection } from './profile/ProjectsSection';
import { SkillsSection } from './profile/SkillsSection';
import { OtherSection } from './profile/OtherSection';
import { ProfileHealth } from './profile/ProfileHealth';

type ProfileTab = 'personal' | 'education' | 'experience' | 'projects' | 'skills' | 'other';

const TABS: { id: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { id: 'personal',   label: 'Personal',   icon: <User size={15} /> },
  { id: 'education',  label: 'Education',  icon: <GraduationCap size={15} /> },
  { id: 'experience', label: 'Experience', icon: <Briefcase size={15} /> },
  { id: 'projects',   label: 'Projects',   icon: <Code2 size={15} /> },
  { id: 'skills',     label: 'Skills',     icon: <Wrench size={15} /> },
  { id: 'other',      label: 'More',       icon: <Star size={15} /> },
];

export function ProfileEditor() {
  const [tab, setTab] = useState<ProfileTab>('personal');

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f0f4ff]">
      {/* Left tab rail */}
      <div className="w-48 bg-white border-r border-dark-200/50 flex-shrink-0 py-5 flex flex-col">
        <div className="px-4 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-dark-700/40">Sections</p>
        </div>
        <nav className="space-y-0.5 px-2 flex-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                tab === t.id
                  ? 'bg-brand-600 text-white font-semibold shadow-blue'
                  : 'text-dark-700/60 hover:bg-dark-100 hover:text-dark-900'
              }`}
            >
              <span className={tab === t.id ? 'text-blue-200' : 'text-dark-700/40'}>{t.icon}</span>
              <span className="flex-1">{t.label}</span>
              {tab === t.id && <ChevronRight size={12} className="text-blue-200 flex-shrink-0" />}
            </button>
          ))}
        </nav>
        <div className="mt-4 px-3 pb-2">
          <ProfileHealth />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">
          {tab === 'personal'   && <PersonalSection />}
          {tab === 'education'  && <EducationSection />}
          {tab === 'experience' && <ExperienceSection />}
          {tab === 'projects'   && <ProjectsSection />}
          {tab === 'skills'     && <SkillsSection />}
          {tab === 'other'      && <OtherSection />}
        </div>
      </div>
    </div>
  );
}
