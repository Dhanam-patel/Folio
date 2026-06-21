import React, { createContext, useContext, useState, useCallback } from 'react';
import { Profile, EMPTY_PROFILE } from '../types/profile';
import { ResumeVersion, DEFAULT_SECTION_ORDER, SectionKey } from '../types/resume';
import { supabase } from '../lib/supabase';
import { nanoid } from '../lib/nanoid';

interface ProfileContextValue {
  profile: Profile;
  setProfile: (p: Profile) => void;
  updateProfile: (partial: Partial<Profile>) => void;
  saveProfile: () => Promise<string | null>;
  currentResume: ResumeVersion;
  setCurrentResume: (r: ResumeVersion) => void;
  resumes: ResumeVersion[];
  setResumes: (r: ResumeVersion[]) => void;
  addResume: (name: string, jobDescription: string, aiAnalysis?: ResumeVersion['aiAnalysis'], scores?: ResumeVersion['scores']) => ResumeVersion;
  deleteResume: (id: string) => void;
  saveResume: () => Promise<void>;
  isLoading: boolean;
  isDirty: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const DEFAULT_RESUME: ResumeVersion = {
  id: 'default',
  name: 'Default Resume',
  jobDescription: '',
  sectionOrder: DEFAULT_SECTION_ORDER,
  hiddenSections: [],
  aiAnalysis: null,
  scores: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(EMPTY_PROFILE);
  const [currentResume, setCurrentResumeState] = useState<ResumeVersion>(DEFAULT_RESUME);
  const [resumes, setResumes] = useState<ResumeVersion[]>([DEFAULT_RESUME]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const setProfile = useCallback((p: Profile) => {
    setProfileState(p);
    setIsDirty(true);
  }, []);

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    setProfileState(prev => ({ ...prev, ...partial, updatedAt: new Date().toISOString() }));
    setIsDirty(true);
  }, []);

  const setCurrentResume = useCallback((r: ResumeVersion) => {
    setCurrentResumeState(r);
    setResumes(prev => {
      const idx = prev.findIndex(rv => rv.id === r.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = r;
        return next;
      }
      return [...prev, r];
    });
  }, []);

  const addResume = useCallback((
    name: string,
    jobDescription: string,
    aiAnalysis?: ResumeVersion['aiAnalysis'],
    scores?: ResumeVersion['scores']
  ): ResumeVersion => {
    const newResume: ResumeVersion = {
      id: nanoid(),
      name,
      jobDescription,
      sectionOrder: DEFAULT_SECTION_ORDER,
      hiddenSections: [],
      aiAnalysis: aiAnalysis ?? null,
      scores: scores ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setResumes(prev => [...prev, newResume]);
    setCurrentResumeState(newResume);
    return newResume;
  }, []);

  const deleteResume = useCallback((id: string) => {
    setResumes(prev => {
      const filtered = prev.filter(r => r.id !== id);
      if (currentResume.id === id && filtered.length > 0) {
        setCurrentResumeState(filtered[0]);
      }
      return filtered;
    });
  }, [currentResume.id]);

  const saveProfile = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const data = {
        version: profile.version,
        updated_at: now,
        personal: profile.personal,
        education: profile.education,
        experience: profile.experience,
        projects: profile.projects,
        skills: profile.skills,
        certifications: profile.certifications,
        publications: profile.publications,
        research: profile.research,
        patents: profile.patents,
        volunteering: profile.volunteering,
        leadership: profile.leadership,
        achievements: profile.achievements,
        hackathons: profile.hackathons,
        awards: profile.awards,
        extracurricular: profile.extracurricular,
        opensource: profile.opensource,
        memberships: profile.memberships,
        custom_sections: profile.customSections,
      };

      let id = profile.id;
      if (id) {
        await supabase.from('profiles').update(data).eq('id', id);
      } else {
        const { data: inserted } = await supabase.from('profiles').insert(data).select('id').single();
        id = inserted?.id ?? null;
        if (id) setProfileState(prev => ({ ...prev, id }));
      }
      setIsDirty(false);
      return id ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const saveResume = useCallback(async () => {
    if (!profile.id) return;
    const data = {
      profile_id: profile.id,
      name: currentResume.name,
      job_description: currentResume.jobDescription,
      section_order: currentResume.sectionOrder,
      hidden_sections: currentResume.hiddenSections,
      ai_analysis: currentResume.aiAnalysis,
      scores: currentResume.scores,
      updated_at: new Date().toISOString(),
    };
    if (currentResume.id) {
      await supabase.from('resume_versions').update(data).eq('id', currentResume.id);
    } else {
      const { data: inserted } = await supabase.from('resume_versions').insert(data).select('id').single();
      if (inserted?.id) {
        setCurrentResumeState(prev => ({ ...prev, id: inserted.id }));
      }
    }
  }, [profile.id, currentResume]);

  return (
    <ProfileContext.Provider value={{
      profile, setProfile, updateProfile, saveProfile,
      currentResume, setCurrentResume,
      resumes, setResumes, addResume, deleteResume,
      saveResume, isLoading, isDirty,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be inside ProfileProvider');
  return ctx;
}

export function useSectionConfig() {
  const { currentResume, setCurrentResume } = useProfile();

  const toggleSection = (key: SectionKey) => {
    const hidden = currentResume.hiddenSections.includes(key)
      ? currentResume.hiddenSections.filter(s => s !== key)
      : [...currentResume.hiddenSections, key];
    setCurrentResume({ ...currentResume, hiddenSections: hidden, updatedAt: new Date().toISOString() });
  };

  const reorderSections = (newOrder: SectionKey[]) => {
    setCurrentResume({ ...currentResume, sectionOrder: newOrder, updatedAt: new Date().toISOString() });
  };

  return { toggleSection, reorderSections };
}
