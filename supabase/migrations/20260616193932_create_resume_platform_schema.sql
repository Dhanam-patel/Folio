
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  personal JSONB NOT NULL DEFAULT '{}',
  education JSONB NOT NULL DEFAULT '[]',
  experience JSONB NOT NULL DEFAULT '[]',
  projects JSONB NOT NULL DEFAULT '[]',
  skills JSONB NOT NULL DEFAULT '{}',
  certifications JSONB NOT NULL DEFAULT '[]',
  publications JSONB NOT NULL DEFAULT '[]',
  research JSONB NOT NULL DEFAULT '[]',
  patents JSONB NOT NULL DEFAULT '[]',
  volunteering JSONB NOT NULL DEFAULT '[]',
  leadership JSONB NOT NULL DEFAULT '[]',
  achievements JSONB NOT NULL DEFAULT '[]',
  hackathons JSONB NOT NULL DEFAULT '[]',
  awards JSONB NOT NULL DEFAULT '[]',
  extracurricular JSONB NOT NULL DEFAULT '[]',
  opensource JSONB NOT NULL DEFAULT '[]',
  memberships JSONB NOT NULL DEFAULT '[]',
  custom_sections JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_profiles" ON profiles FOR SELECT TO anon USING (true);
CREATE POLICY "insert_profiles" ON profiles FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_profiles" ON profiles FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_profiles" ON profiles FOR DELETE TO anon USING (true);

-- Resume versions
CREATE TABLE IF NOT EXISTS resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_description TEXT,
  section_order JSONB NOT NULL DEFAULT '[]',
  hidden_sections JSONB NOT NULL DEFAULT '[]',
  ai_analysis JSONB,
  scores JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_resume_versions" ON resume_versions FOR SELECT TO anon USING (true);
CREATE POLICY "insert_resume_versions" ON resume_versions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_resume_versions" ON resume_versions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_resume_versions" ON resume_versions FOR DELETE TO anon USING (true);
