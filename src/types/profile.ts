export interface ProfessionalSummary {
  headline: string;
  yearsExperience: string;
  expertise: string[];
  objective: string;
  highlights: string[];
  rawText: string;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  twitter: string;
  portfolio: string;
  website: string;
  location: string;
  summary: string;
  professionalSummary: ProfessionalSummary;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  coursework: string[];
  achievements: string[];
  honors: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  type: 'full-time' | 'part-time' | 'internship' | 'contract' | 'freelance';
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  impact: string;
}

export interface Project {
  id: string;
  name: string;
  summary: string;
  description: string;
  techStack: string[];
  challenges: string;
  outcomes: string;
  metrics: string;
  repoUrl: string;
  demoUrl: string;
  awards: string;
  businessOutcome: string;
  startDate: string;
  endDate: string;
  current: boolean;
  featured: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  databases: string[];
  cloud: string[];
  soft: string[];
  other: string[];
  categories: SkillCategory[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry: string;
  credentialId: string;
  url: string;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  date: string;
  authors: string[];
  url: string;
  doi: string;
  abstract: string;
}

export interface Research {
  id: string;
  title: string;
  institution: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  outcomes: string[];
}

export interface Patent {
  id: string;
  title: string;
  number: string;
  date: string;
  status: string;
  description: string;
}

export interface Volunteering {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  impact: string;
}

export interface Leadership {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Hackathon {
  id: string;
  name: string;
  organizer: string;
  date: string;
  placement: string;
  project: string;
  description: string;
  techStack: string[];
  url: string;
}

export interface OpenSourceContribution {
  id: string;
  project: string;
  organization: string;
  description: string;
  url: string;
  contributions: string[];
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Membership {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CustomSection {
  id: string;
  name: string;
  items: CustomItem[];
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  bullets: string[];
  url: string;
}

export interface Profile {
  id?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  personal: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  publications: Publication[];
  research: Research[];
  patents: Patent[];
  volunteering: Volunteering[];
  leadership: Leadership[];
  achievements: Achievement[];
  hackathons: Hackathon[];
  awards: Achievement[];
  extracurricular: CustomItem[];
  opensource: OpenSourceContribution[];
  memberships: Membership[];
  customSections: CustomSection[];
}

export const EMPTY_PROFILE: Profile = {
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  personal: {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: '',
    website: '',
    location: '',
    summary: '',
    professionalSummary: {
      headline: '',
      yearsExperience: '',
      expertise: [],
      objective: '',
      highlights: [],
      rawText: '',
    },
  },
  education: [],
  experience: [],
  projects: [],
  skills: {
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
    cloud: [],
    soft: [],
    other: [],
    categories: [],
  },
  certifications: [],
  publications: [],
  research: [],
  patents: [],
  volunteering: [],
  leadership: [],
  achievements: [],
  hackathons: [],
  awards: [],
  extracurricular: [],
  opensource: [],
  memberships: [],
  customSections: [],
};
