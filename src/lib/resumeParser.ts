import { Profile, EMPTY_PROFILE, PersonalInfo, Experience, Project, Education, Skills } from '../types/profile';
import { AIConfig } from '../types/ai';
import { callGemini } from './gemini';
import { callHuggingFace } from './huggingface';
import { nanoid } from './nanoid';

export interface ParsedResumeData {
  personal: Partial<PersonalInfo>;
  experience: Partial<Experience>[];
  education: Partial<Education>[];
  projects: Partial<Project>[];
  skills: Partial<Skills>;
  certifications: string[];
  achievements: string[];
  summary: string;
}

async function callAI(config: AIConfig, prompt: string): Promise<string> {
  // Prefer Gemini
  if (config.geminiKey && config.geminiModel) {
    return callGemini(config.geminiKey, config.geminiModel, prompt);
  }
  if (config.huggingfaceKey && config.huggingfaceModel) {
    return callHuggingFace(config.huggingfaceKey, config.huggingfaceModel, prompt);
  }
  throw new Error('No AI provider configured. Please set up an API key in Settings.');
}

function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // continue
      }
    }
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // continue
      }
    }
    try {
      return JSON.parse(raw);
    } catch {
      // return fallback
    }
    console.warn('Failed to parse JSON, using fallback');
    return fallback;
  } catch {
    return fallback;
  }
}

export async function parseResumeWithAI(
  config: AIConfig,
  resumeText: string
): Promise<ParsedResumeData> {
  const prompt = `You are an expert resume parser. Extract all information from this resume and return it in a structured JSON format.

RESUME TEXT:
${resumeText}

Return ONLY valid JSON with this exact structure (use null for missing fields):
{
  "personal": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State/Country",
    "linkedin": "LinkedIn URL",
    "website": "Personal website URL",
    "github": "GitHub URL",
    "summary": "Professional summary/objective from the resume"
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "startDate": "YYYY-MM or Month Year",
      "endDate": "YYYY-MM or Month Year or 'Present'",
      "responsibilities": ["bullet point 1", "bullet point 2"],
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "location": "City, State",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "gpa": "GPA value",
      "honors": ["honor1", "honor2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "summary": "Brief description",
      "techStack": ["tech1", "tech2"],
      "link": "Project URL",
      "outcomes": "Key results/impact"
    }
  ],
  "skills": {
    "languages": ["language1", "language2"],
    "frameworks": ["framework1"],
    "tools": ["tool1", "tool2"],
    "databases": ["database1"],
    "cloud": ["cloud service"],
    "other": ["other skill"]
  },
  "certifications": ["Certification 1", "Certification 2"],
  "achievements": ["Achievement 1", "Achievement 2"],
  "summary": "Overall resume summary if different from personal summary"
}

IMPORTANT:
- Extract ALL information present in the resume
- Use arrays for multiple items
- Preserve bullet points in responsibilities
- Include all technologies/tools mentioned
- If a field is not found, use null or empty array
- Preserve the exact text where possible
- Return ONLY the JSON, no other text`;

  const raw = await callAI(config, prompt);
  const fallback: ParsedResumeData = {
    personal: {},
    experience: [],
    education: [],
    projects: [],
    skills: {},
    certifications: [],
    achievements: [],
    summary: '',
  };

  return parseJSON<ParsedResumeData>(raw, fallback);
}

export function buildProfileFromParsedData(data: ParsedResumeData): Profile {
  const now = new Date().toISOString();

  const profile: Profile = {
    ...EMPTY_PROFILE,
    personal: {
      ...EMPTY_PROFILE.personal,
      name: data.personal.name || '',
      email: data.personal.email || '',
      phone: data.personal.phone || '',
      location: data.personal.location || '',
      linkedin: data.personal.linkedin || '',
      website: data.personal.website || '',
      github: data.personal.github || '',
      summary: data.personal.summary || data.summary || '',
    },
    experience: (data.experience || []).map(exp => ({
      id: nanoid(),
      role: exp.role || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || 'Present',
      responsibilities: exp.responsibilities || [],
      technologies: exp.technologies || [],
    })),
    education: (data.education || []).map(edu => ({
      id: nanoid(),
      institution: edu.institution || '',
      degree: edu.degree || '',
      field: edu.field || '',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa || '',
      honors: edu.honors || [],
      coursework: [],
    })),
    projects: (data.projects || []).map(proj => ({
      id: nanoid(),
      name: proj.name || '',
      summary: proj.summary || '',
      techStack: proj.techStack || [],
      link: proj.link || '',
      outcomes: proj.outcomes || '',
    })),
    skills: {
      languages: data.skills?.languages || [],
      frameworks: data.skills?.frameworks || [],
      tools: data.skills?.tools || [],
      databases: data.skills?.databases || [],
      cloud: data.skills?.cloud || [],
      soft: [],
      other: data.skills?.other || [],
      categories: [],
    },
    certifications: (data.certifications || []).map(cert => ({
      id: nanoid(),
      name: typeof cert === 'string' ? cert : cert.name || '',
      issuer: typeof cert === 'object' && cert.issuer || '',
      date: typeof cert === 'object' && cert.date || '',
      link: typeof cert === 'object' && cert.link || '',
    })),
    awards: (data.achievements || []).map(a => ({
      id: nanoid(),
      title: typeof a === 'string' ? a : a.title || '',
      organization: typeof a === 'object' && a.organization || '',
      date: typeof a === 'object' && a.date || '',
      description: typeof a === 'object' && a.description || '',
    })),
    updatedAt: now,
  };

  return profile;
}
