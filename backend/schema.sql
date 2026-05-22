-- schema.sql
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    file_url TEXT,
    extracted_text TEXT,
    skills JSONB DEFAULT '[]',
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_role TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed'
    overall_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_questions table
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    round_type TEXT NOT NULL, -- 'HR', 'Technical', 'Situational', 'Behavioral'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_answers table (with feedback)
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_audio_url TEXT,
    feedback_strengths TEXT[],
    feedback_weaknesses TEXT[],
    score_communication INTEGER,
    score_technical INTEGER,
    score_confidence INTEGER,
    improved_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scorecards table
CREATE TABLE IF NOT EXISTS public.scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE UNIQUE,
    communication_score INTEGER,
    technical_score INTEGER,
    relevance_score INTEGER,
    confidence_score INTEGER,
    overall_score INTEGER,
    hiring_recommendation TEXT,
    improvement_roadmap TEXT[],
    weak_skills TEXT[],
    suggested_resources JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - optional but recommended
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecards ENABLE ROW LEVEL SECURITY;

-- Basic policies (assuming service role acts as admin, users read own data)
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
-- Add more specific policies if using Supabase Auth, but we are using Clerk, 
-- so the backend FastAPI will connect using the SERVICE_ROLE key which bypasses RLS.
