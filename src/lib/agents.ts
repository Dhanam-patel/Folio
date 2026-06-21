import { Profile } from '../types/profile';
import {
  AIAnalysisResult,
  JobAnalysis,
  ProfileMatch,
  ResumeStrategy,
  KeywordOptimization,
  ATSReview,
  RecruiterReview,
  QualityAudit,
} from '../types/resume';
import { AIConfig } from '../types/ai';
import { callGemini } from './gemini';
import { callHuggingFace } from './huggingface';

async function callAI(config: AIConfig, prompt: string): Promise<string> {
  const errors: string[] = [];

  // Try Gemini first (or if hybrid)
  if (config.provider === 'gemini' || config.provider === 'hybrid') {
    if (config.geminiKey && config.geminiModel) {
      try {
        return await callGemini(config.geminiKey, config.geminiModel, prompt);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown Gemini error';
        errors.push(`Gemini: ${msg}`);
        console.error('Gemini call failed:', e);
      }
    } else {
      errors.push('Gemini: Missing API key or model');
    }
  }

  // Try HuggingFace (or as fallback)
  if (config.provider === 'huggingface' || config.provider === 'hybrid') {
    if (config.huggingfaceKey && config.huggingfaceModel) {
      try {
        return await callHuggingFace(config.huggingfaceKey, config.huggingfaceModel, prompt);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown HuggingFace error';
        errors.push(`HuggingFace: ${msg}`);
        console.error('HuggingFace call failed:', e);
      }
    } else {
      errors.push('HuggingFace: Missing API key or model');
    }
  }

  throw new Error(errors.join(' | ') || 'No AI provider configured');
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    // Try to extract JSON from markdown code blocks first
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // continue to other parsing methods
      }
    }

    // Try to find JSON object in the response
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // continue to other parsing methods
      }
    }

    // Try parsing the raw string directly
    try {
      return JSON.parse(raw);
    } catch {
      // return fallback
    }

    console.warn('Failed to parse JSON, using fallback:', raw.slice(0, 200));
    return fallback;
  } catch {
    return fallback;
  }
}

export type AgentProgress = {
  agent: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  index: number;
};

export async function runAgent1_JobAnalysis(
  config: AIConfig,
  jobDescription: string,
  onProgress: (p: AgentProgress) => void
): Promise<JobAnalysis> {
  onProgress({ agent: 'Job Description Analyzer', status: 'running', index: 0 });
  const prompt = `You are a Job Description Analyzer. Analyze this job description and extract structured data.

Job Description:
${jobDescription}

Return ONLY valid JSON (no markdown):
{
  "requiredSkills": [],
  "preferredSkills": [],
  "responsibilities": [],
  "keywords": [],
  "technologies": [],
  "seniority": "",
  "industry": "",
  "companyType": "",
  "roleType": "",
  "summary": ""
}`;
  try {
    const raw = await callAI(config, prompt);
    const result = parseJSON<JobAnalysis>(raw, {
      requiredSkills: [],
      preferredSkills: [],
      responsibilities: [],
      keywords: [],
      technologies: [],
      seniority: 'Mid-level',
      industry: 'Technology',
      companyType: 'Unknown',
      roleType: 'Unknown',
      summary: 'Could not analyze job description.',
    });
    onProgress({ agent: 'Job Description Analyzer', status: 'complete', index: 0 });
    return result;
  } catch (e) {
    onProgress({ agent: 'Job Description Analyzer', status: 'error', index: 0 });
    throw e;
  }
}

export async function runAgent2_ProfileMatch(
  config: AIConfig,
  jobAnalysis: JobAnalysis,
  profile: Profile,
  onProgress: (p: AgentProgress) => void
): Promise<ProfileMatch> {
  onProgress({ agent: 'Profile Matcher', status: 'running', index: 1 });
  const profileSummary = JSON.stringify({
    skills: profile.skills,
    experience: profile.experience.map(e => ({ role: e.role, company: e.company, technologies: e.technologies })),
    projects: profile.projects.map(p => ({ name: p.name, techStack: p.techStack, outcomes: p.outcomes })),
  });
  const prompt = `You are a Profile Matcher. Compare this candidate's profile against the job requirements.

Job Requirements:
${JSON.stringify(jobAnalysis)}

Candidate Profile:
${profileSummary}

Return ONLY valid JSON:
{
  "matchingSkills": [],
  "missingSkills": [],
  "relevantExperiences": [],
  "relevantProjects": [],
  "matchScore": 0,
  "summary": "",
  "recommendations": []
}`;
  try {
    const raw = await callAI(config, prompt);
    const result = parseJSON<ProfileMatch>(raw, {
      matchingSkills: [],
      missingSkills: [],
      relevantExperiences: [],
      relevantProjects: [],
      matchScore: 0,
      summary: 'Could not match profile.',
      recommendations: [],
    });
    onProgress({ agent: 'Profile Matcher', status: 'complete', index: 1 });
    return result;
  } catch (e) {
    onProgress({ agent: 'Profile Matcher', status: 'error', index: 1 });
    throw e;
  }
}

export async function runAgent3_Strategy(
  config: AIConfig,
  jobAnalysis: JobAnalysis,
  profileMatch: ProfileMatch,
  onProgress: (p: AgentProgress) => void
): Promise<ResumeStrategy> {
  onProgress({ agent: 'Resume Strategist', status: 'running', index: 2 });
  const prompt = `You are a Resume Strategist. Create a tailoring strategy for this candidate.

Job Analysis: ${JSON.stringify(jobAnalysis)}
Profile Match: ${JSON.stringify(profileMatch)}

Return ONLY valid JSON:
{
  "prioritizedSections": ["experience","projects","skills","education"],
  "suggestedExperiences": [],
  "suggestedProjects": [],
  "suggestedSkills": [],
  "contentToEmphasize": [],
  "contentToMinimize": [],
  "toneRecommendations": [],
  "summary": ""
}`;
  try {
    const raw = await callAI(config, prompt);
    const result = parseJSON<ResumeStrategy>(raw, {
      prioritizedSections: ['experience', 'projects', 'skills', 'education'],
      suggestedExperiences: [],
      suggestedProjects: [],
      suggestedSkills: [],
      contentToEmphasize: [],
      contentToMinimize: [],
      toneRecommendations: [],
      summary: 'Could not generate strategy.',
    });
    onProgress({ agent: 'Resume Strategist', status: 'complete', index: 2 });
    return result;
  } catch (e) {
    onProgress({ agent: 'Resume Strategist', status: 'error', index: 2 });
    throw e;
  }
}

export async function runAgent4_Keywords(
  config: AIConfig,
  jobAnalysis: JobAnalysis,
  profile: Profile,
  onProgress: (p: AgentProgress) => void
): Promise<KeywordOptimization> {
  onProgress({ agent: 'Keyword Optimizer', status: 'running', index: 3 });
  const allText = [
    ...profile.experience.flatMap(e => e.responsibilities),
    ...profile.projects.map(p => p.summary),
    Object.values(profile.skills).flat().join(' '),
  ].join(' ');
  const prompt = `You are a Keyword Optimizer. Analyze keyword coverage for ATS optimization.

Required Keywords: ${jobAnalysis.keywords.join(', ')}
Candidate Resume Text: ${allText.slice(0, 2000)}

Return ONLY valid JSON:
{
  "coveredKeywords": [],
  "missingKeywords": [],
  "suggestedPhrases": [],
  "densityScore": 0,
  "improvements": [],
  "summary": ""
}`;
  try {
    const raw = await callAI(config, prompt);
    const result = parseJSON<KeywordOptimization>(raw, {
      coveredKeywords: [],
      missingKeywords: [],
      suggestedPhrases: [],
      densityScore: 0,
      improvements: [],
      summary: 'Could not optimize keywords.',
    });
    onProgress({ agent: 'Keyword Optimizer', status: 'complete', index: 3 });
    return result;
  } catch (e) {
    onProgress({ agent: 'Keyword Optimizer', status: 'error', index: 3 });
    throw e;
  }
}

export async function runAgent5_ATS(
  config: AIConfig,
  jobAnalysis: JobAnalysis,
  keywords: KeywordOptimization,
  onProgress: (p: AgentProgress) => void
): Promise<ATSReview> {
  onProgress({ agent: 'ATS Reviewer', status: 'running', index: 4 });
  const prompt = `You are an ATS (Applicant Tracking System) expert. Review this resume's ATS compatibility.

Job Keywords: ${jobAnalysis.keywords.join(', ')}
Covered Keywords: ${keywords.coveredKeywords.join(', ')}
Missing Keywords: ${keywords.missingKeywords.join(', ')}
Density Score: ${keywords.densityScore}

Return ONLY valid JSON:
{
  "score": 0,
  "passedChecks": [],
  "failedChecks": [],
  "suggestions": [],
  "summary": ""
}`;
  try {
    const raw = await callAI(config, prompt);
    const result = parseJSON<ATSReview>(raw, {
      score: 0,
      passedChecks: [],
      failedChecks: [],
      suggestions: [],
      summary: 'Could not complete ATS review.',
    });
    onProgress({ agent: 'ATS Reviewer', status: 'complete', index: 4 });
    return result;
  } catch (e) {
    onProgress({ agent: 'ATS Reviewer', status: 'error', index: 4 });
    throw e;
  }
}

export async function runAgent6_Recruiter(
  config: AIConfig,
  profile: Profile,
  strategy: ResumeStrategy,
  onProgress: (p: AgentProgress) => void
): Promise<RecruiterReview> {
  onProgress({ agent: 'Recruiter Reviewer', status: 'running', index: 5 });
  const summary = `Name: ${profile.personal.name}, Experience: ${profile.experience.length} roles, Projects: ${profile.projects.length}`;
  const prompt = `You are an experienced technical recruiter. Review this candidate's resume appeal.

Profile Summary: ${summary}
Strategy: ${JSON.stringify(strategy)}

Return ONLY valid JSON:
{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "firstImpression": "",
  "callToAction": "",
  "suggestions": [],
  "summary": ""
}`;
  try {
    const raw = await callAI(config, prompt);
    const result = parseJSON<RecruiterReview>(raw, {
      score: 0,
      strengths: [],
      weaknesses: [],
      firstImpression: 'Could not complete recruiter review.',
      callToAction: '',
      suggestions: [],
      summary: 'Could not complete recruiter review.',
    });
    onProgress({ agent: 'Recruiter Reviewer', status: 'complete', index: 5 });
    return result;
  } catch (e) {
    onProgress({ agent: 'Recruiter Reviewer', status: 'error', index: 5 });
    throw e;
  }
}

export async function runAgent7_Quality(
  config: AIConfig,
  atsReview: ATSReview,
  recruiterReview: RecruiterReview,
  profileMatch: ProfileMatch,
  onProgress: (p: AgentProgress) => void
): Promise<QualityAudit> {
  onProgress({ agent: 'Final Quality Auditor', status: 'running', index: 6 });
  const prompt = `You are a Final Quality Auditor synthesizing all previous agent results.

ATS Score: ${atsReview.score}
Recruiter Score: ${recruiterReview.score}
Profile Match Score: ${profileMatch.matchScore}
ATS Issues: ${atsReview.failedChecks.join(', ')}
Recruiter Weaknesses: ${recruiterReview.weaknesses.join(', ')}

Return ONLY valid JSON:
{
  "overallScore": 0,
  "impactScore": 0,
  "clarityScore": 0,
  "relevanceScore": 0,
  "issues": [],
  "recommendations": [],
  "finalVerdict": "",
  "summary": ""
}`;
  try {
    const raw = await callAI(config, prompt);
    const result = parseJSON<QualityAudit>(raw, {
      overallScore: 0,
      impactScore: 0,
      clarityScore: 0,
      relevanceScore: 0,
      issues: [],
      recommendations: [],
      finalVerdict: 'Could not complete quality audit.',
      summary: 'Could not complete quality audit.',
    });
    onProgress({ agent: 'Final Quality Auditor', status: 'complete', index: 6 });
    return result;
  } catch (e) {
    onProgress({ agent: 'Final Quality Auditor', status: 'error', index: 6 });
    throw e;
  }
}

export async function runFullAnalysis(
  config: AIConfig,
  jobDescription: string,
  profile: Profile,
  onProgress: (p: AgentProgress) => void
): Promise<AIAnalysisResult> {
  const jobAnalysis = await runAgent1_JobAnalysis(config, jobDescription, onProgress);
  const profileMatch = await runAgent2_ProfileMatch(config, jobAnalysis, profile, onProgress);
  const strategy = await runAgent3_Strategy(config, jobAnalysis, profileMatch, onProgress);
  const keywordOptimization = await runAgent4_Keywords(config, jobAnalysis, profile, onProgress);
  const atsReview = await runAgent5_ATS(config, jobAnalysis, keywordOptimization, onProgress);
  const recruiterReview = await runAgent6_Recruiter(config, profile, strategy, onProgress);
  const qualityAudit = await runAgent7_Quality(config, atsReview, recruiterReview, profileMatch, onProgress);

  return {
    jobAnalysis,
    profileMatch,
    strategy,
    keywordOptimization,
    atsReview,
    recruiterReview,
    qualityAudit,
  };
}

export interface TailoredResumeContent {
  summary: string;
  experienceHighlights: { id: string; tailoredBullets: string[] }[];
  projectHighlights: { id: string; tailoredSummary: string; keyPoints: string[] }[];
  skillsToEmphasize: string[];
  suggestedFormatting: string[];
}

export type { TailoredResumeContent };

export async function generateTailoredResume(
  config: AIConfig,
  profile: Profile,
  jobDescription: string,
  analysis: AIAnalysisResult
): Promise<TailoredResumeContent> {
  const profileData = {
    personal: {
      name: profile.personal.name,
      summary: profile.personal.summary,
      professionalSummary: profile.personal.professionalSummary,
    },
    experience: profile.experience.map(e => ({
      id: e.id,
      role: e.role,
      company: e.company,
      responsibilities: e.responsibilities,
      technologies: e.technologies,
    })),
    projects: profile.projects.map(p => ({
      id: p.id,
      name: p.name,
      summary: p.summary,
      techStack: p.techStack,
      outcomes: p.outcomes,
    })),
    skills: profile.skills,
  };

  const prompt = `You are an expert resume writer. Generate a tailored resume optimized for this specific job.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
${JSON.stringify(profileData, null, 2)}

ANALYSIS INSIGHTS:
- Required Skills: ${analysis.jobAnalysis.requiredSkills.join(', ')}
- Keywords to Include: ${analysis.jobAnalysis.keywords.slice(0, 15).join(', ')}
- Matching Skills: ${analysis.profileMatch.matchingSkills.join(', ')}
- Missing Skills to Address: ${analysis.profileMatch.missingSkills.slice(0, 5).join(', ')}
- Content to Emphasize: ${analysis.strategy.contentToEmphasize.slice(0, 5).join('; ')}
- Tone Recommendations: ${analysis.strategy.toneRecommendations.slice(0, 3).join('; ')}
- Suggested Phrases: ${analysis.keywordOptimization.suggestedPhrases.slice(0, 5).join('; ')}

Return ONLY valid JSON with this exact structure:
{
  "summary": "A tailored professional summary (2-3 sentences) that highlights the most relevant qualifications for this job",
  "experienceHighlights": [
    {
      "id": "experience_id_from_profile",
      "tailoredBullets": ["bullet 1 optimized for this job", "bullet 2 optimized for this job"]
    }
  ],
  "projectHighlights": [
    {
      "id": "project_id_from_profile",
      "tailoredSummary": "One-line project summary optimized for this job",
      "keyPoints": ["key achievement 1", "key achievement 2"]
    }
  ],
  "skillsToEmphasize": ["skill1", "skill2", "skill3"],
  "suggestedFormatting": ["formatting tip 1", "formatting tip 2"]
}

IMPORTANT:
- Use the exact IDs from the profile data
- Include relevant keywords naturally
- Focus on accomplishments, not just duties
- Quantify where possible
- Keep bullets concise but impactful`;

  const raw = await callAI(config, prompt);
  const result = parseJSON<TailoredResumeContent>(raw, {
    summary: profile.personal.summary || '',
    experienceHighlights: profile.experience.map(e => ({ id: e.id, tailoredBullets: e.responsibilities })),
    projectHighlights: profile.projects.map(p => ({ id: p.id, tailoredSummary: p.summary || '', keyPoints: [p.outcomes || ''] })),
    skillsToEmphasize: [],
    suggestedFormatting: [],
  });

  return result;
}
