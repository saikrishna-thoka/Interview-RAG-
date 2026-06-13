-- supabase/migrations/20260613000000_init_schema.sql
-- Database initialization for InterviewRAG AI SaaS

-- Create Users profile table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  candidate_name TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'In Progress', -- In Progress, Completed
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'Technical',
  difficulty TEXT,
  sequence_number INTEGER NOT NULL
);

-- Create Answers table
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  evaluation JSONB DEFAULT '{}'::jsonb,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  technical_score INTEGER NOT NULL,
  communication_score INTEGER NOT NULL,
  confidence_score INTEGER NOT NULL,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Subscription Plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price NUMERIC NOT NULL,
  question_limit INTEGER NOT NULL,
  resume_limit INTEGER NOT NULL
);

-- Create Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, trial, expired
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Seed subscription plans
INSERT INTO public.subscription_plans (name, price, question_limit, resume_limit)
VALUES 
  ('Free Starter', 0.00, 10, 1)
ON CONFLICT (name) DO UPDATE 
SET price = EXCLUDED.price, question_limit = EXCLUDED.question_limit, resume_limit = EXCLUDED.resume_limit;

INSERT INTO public.subscription_plans (name, price, question_limit, resume_limit)
VALUES 
  ('Pro Developer', 19.00, 20, 100)
ON CONFLICT (name) DO UPDATE 
SET price = EXCLUDED.price, question_limit = EXCLUDED.question_limit, resume_limit = EXCLUDED.resume_limit;


-- Automatic Auth Trigger Function: populates public.users on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );

  -- Insert default Free Starter subscription
  INSERT INTO public.subscriptions (user_id, plan_id, expires_at)
  VALUES (
    new.id,
    (SELECT id FROM public.subscription_plans WHERE name = 'Free Starter' LIMIT 1),
    now() + interval '30 days'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ROW LEVEL SECURITY (RLS) POLICIES --

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
-- Keep subscription plans public
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY "Users can select own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Resumes policies
CREATE POLICY "Users can access own resumes" ON public.resumes FOR ALL USING (auth.uid() = user_id);

-- 3. Interviews policies
CREATE POLICY "Users can access own interviews" ON public.interviews FOR ALL USING (auth.uid() = user_id);

-- 4. Questions policies
CREATE POLICY "Users can access own questions" ON public.questions FOR ALL USING (auth.uid() = user_id);

-- 5. Answers policies
CREATE POLICY "Users can access own answers" ON public.answers FOR ALL USING (auth.uid() = user_id);

-- 6. Reports policies
CREATE POLICY "Users can access own reports" ON public.reports FOR ALL USING (auth.uid() = user_id);

-- 7. Subscriptions policies
CREATE POLICY "Users can access own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- 8. Subscription plans policies (public read-only)
CREATE POLICY "Anyone can select plans" ON public.subscription_plans FOR SELECT TO authenticated, anon USING (true);
