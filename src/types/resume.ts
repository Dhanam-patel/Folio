export type SectionKey =
  | 'personal'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'publications'
  | 'research'
  | 'patents'
  | 'volunteering'
  | 'leadership'
  | 'achievements'
  | 'hackathons'
  | 'awards'
  | 'extracurricular'
  | 'opensource'
  | 'memberships';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  'education',
  'experience',
  'projects',
  'skills',
  'certifications',
  'achievements',
  'leadership',
  'hackathons',
  'volunteering',
  'publications',
  'research',
  'patents',
  'opensource',
  'memberships',
  'extracurricular',
  'awards',
];

export const SECTION_LABELS: Record<SectionKey, string> = {
  personal: 'Personal Information',
  education: 'Education',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Technical Skills',
  certifications: 'Certifications',
  publications: 'Publications',
  research: 'Research',
  patents: 'Patents',
  volunteering: 'Volunteering',
  leadership: 'Leadership',
  achievements: 'Achievements',
  hackathons: 'Hackathons',
  awards: 'Awards',
  extracurricular: 'Extracurricular Activities',
  opensource: 'Open Source',
  memberships: 'Professional Memberships',
};

export interface ResumeVersion {
  id?: string;
  profileId?: string;
  name: string;
  jobDescription: string;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  aiAnalysis?: AIAnalysisResult | null;
  scores?: ResumeScores | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeScores {
  overall: number;
  ats: number;
  recruiter: number;
  keywordCoverage: number;
  skillRelevance: number;
  experienceRelevance: number;
  projectRelevance: number;
  impactStatements: number;
  readability: number;
  formatting: number;
  density: number;
  missingKeywords: string[];
  missingSkills: string[];
  suggestions: string[];
  weaknesses: string[];
  strengths: string[];
}

export interface AIAnalysisResult {
  jobAnalysis: JobAnalysis;
  profileMatch: ProfileMatch;
  strategy: ResumeStrategy;
  keywordOptimization: KeywordOptimization;
  atsReview: ATSReview;
  recruiterReview: RecruiterReview;
  qualityAudit: QualityAudit;
}

export interface JobAnalysis {
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  keywords: string[];
  technologies: string[];
  seniority: string;
  industry: string;
  companyType: string;
  roleType: string;
  summary: string;
}

export interface ProfileMatch {
  matchingSkills: string[];
  missingSkills: string[];
  relevantExperiences: string[];
  relevantProjects: string[];
  matchScore: number;
  summary: string;
  recommendations: string[];
}

export interface ResumeStrategy {
  prioritizedSections: SectionKey[];
  suggestedExperiences: string[];
  suggestedProjects: string[];
  suggestedSkills: string[];
  contentToEmphasize: string[];
  contentToMinimize: string[];
  toneRecommendations: string[];
  summary: string;
}

export interface KeywordOptimization {
  coveredKeywords: string[];
  missingKeywords: string[];
  suggestedPhrases: string[];
  densityScore: number;
  improvements: string[];
  summary: string;
}

export interface ATSReview {
  score: number;
  passedChecks: string[];
  failedChecks: string[];
  suggestions: string[];
  summary: string;
}

export interface RecruiterReview {
  score: number;
  strengths: string[];
  weaknesses: string[];
  firstImpression: string;
  callToAction: string;
  suggestions: string[];
  summary: string;
}

export interface QualityAudit {
  overallScore: number;
  impactScore: number;
  clarityScore: number;
  relevanceScore: number;
  issues: string[];
  recommendations: string[];
  finalVerdict: string;
  summary: string;
}
