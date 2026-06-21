import { Profile, EMPTY_PROFILE } from '../types/profile';
import { ResumeVersion } from '../types/resume';

export interface ProfilePackage {
  __type: 'resume-intelligence-profile';
  __version: string;
  exportedAt: string;
  profile: Profile;
  resumes: ResumeVersion[];
}

export function exportProfilePackage(profile: Profile, resumes: ResumeVersion[]): void {
  const pkg: ProfilePackage = {
    __type: 'resume-intelligence-profile',
    __version: '1.0',
    exportedAt: new Date().toISOString(),
    profile,
    resumes,
  };
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.personal.name.replace(/\s+/g, '_') || 'profile'}_package.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseProfilePackage(raw: string): { profile: Profile; resumes: ResumeVersion[] } {
  const parsed = JSON.parse(raw);

  if (parsed.__type !== 'resume-intelligence-profile') {
    throw new Error('Invalid profile package format.');
  }

  const profile: Profile = {
    ...EMPTY_PROFILE,
    ...parsed.profile,
    personal: {
      ...EMPTY_PROFILE.personal,
      ...parsed.profile?.personal,
      professionalSummary: {
        ...EMPTY_PROFILE.personal.professionalSummary,
        ...parsed.profile?.personal?.professionalSummary,
      },
    },
    version: (parsed.profile?.version ?? 1) + 1,
    updatedAt: new Date().toISOString(),
  };

  const resumes: ResumeVersion[] = Array.isArray(parsed.resumes) ? parsed.resumes : [];

  return { profile, resumes };
}

export function mergeProfiles(base: Profile, incoming: Profile): Profile {
  return {
    ...base,
    ...incoming,
    personal: {
      ...base.personal,
      ...incoming.personal,
      professionalSummary: {
        ...base.personal.professionalSummary,
        ...incoming.personal.professionalSummary,
      },
    },
    education: deduplicateById([...base.education, ...incoming.education]),
    experience: deduplicateById([...base.experience, ...incoming.experience]),
    projects: deduplicateById([...base.projects, ...incoming.projects]),
    skills: {
      languages: unique([...base.skills.languages, ...incoming.skills.languages]),
      frameworks: unique([...base.skills.frameworks, ...incoming.skills.frameworks]),
      tools: unique([...base.skills.tools, ...incoming.skills.tools]),
      databases: unique([...base.skills.databases, ...incoming.skills.databases]),
      cloud: unique([...base.skills.cloud, ...incoming.skills.cloud]),
      soft: unique([...base.skills.soft, ...incoming.skills.soft]),
      other: unique([...base.skills.other, ...incoming.skills.other]),
      categories: deduplicateById([...base.skills.categories, ...incoming.skills.categories]),
    },
    certifications: deduplicateById([...base.certifications, ...incoming.certifications]),
    achievements: deduplicateById([...base.achievements, ...incoming.achievements]),
    hackathons: deduplicateById([...base.hackathons, ...incoming.hackathons]),
    awards: deduplicateById([...base.awards, ...incoming.awards]),
    leadership: deduplicateById([...base.leadership, ...incoming.leadership]),
    volunteering: deduplicateById([...base.volunteering, ...incoming.volunteering]),
    publications: deduplicateById([...base.publications, ...incoming.publications]),
    research: deduplicateById([...base.research, ...incoming.research]),
    patents: deduplicateById([...base.patents, ...incoming.patents]),
    opensource: deduplicateById([...base.opensource, ...incoming.opensource]),
    memberships: deduplicateById([...base.memberships, ...incoming.memberships]),
    version: base.version + 1,
    updatedAt: new Date().toISOString(),
  };
}

function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function unique(arr: string[]): string[] {
  return [...new Set(arr)];
}
