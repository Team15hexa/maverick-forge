-- Create enum types
CREATE TYPE public.fresher_status AS ENUM ('active', 'inactive', 'completed', 'dropped');
CREATE TYPE public.queue_status AS ENUM ('operational', 'warning', 'critical', 'maintenance');

-- Create freshers table
CREATE TABLE public.freshers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  batch TEXT NOT NULL,
  status fresher_status NOT NULL DEFAULT 'active',
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_results table
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fresher_id UUID REFERENCES public.freshers(id) ON DELETE CASCADE NOT NULL,
  quiz_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INTEGER NOT NULL DEFAULT 5,
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  time_taken INTEGER, -- in seconds
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_queues table
CREATE TABLE public.system_queues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_name TEXT NOT NULL,
  status queue_status NOT NULL DEFAULT 'operational',
  pending_count INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activities table for tracking actions
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  fresher_id UUID REFERENCES public.freshers(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.freshers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for freshers (users can view their own data, admins can view all)
CREATE POLICY "Users can view their own fresher profile" 
ON public.freshers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all freshers" 
ON public.freshers 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update their own fresher profile" 
ON public.freshers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for quiz_results
CREATE POLICY "Users can view their own quiz results" 
ON public.quiz_results 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.freshers WHERE freshers.id = quiz_results.fresher_id AND freshers.user_id = auth.uid()));

CREATE POLICY "Admins can view all quiz results" 
ON public.quiz_results 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert their own quiz results" 
ON public.quiz_results 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.freshers WHERE freshers.id = quiz_results.fresher_id AND freshers.user_id = auth.uid()));

-- Create policies for system_queues (admin only)
CREATE POLICY "Admins can manage system queues" 
ON public.system_queues 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create policies for activities (admin only)
CREATE POLICY "Admins can view all activities" 
ON public.activities 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_freshers_updated_at
BEFORE UPDATE ON public.freshers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate completion rate
CREATE OR REPLACE FUNCTION public.get_completion_rate(fresher_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_quizzes INTEGER;
  completed_quizzes INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_quizzes 
  FROM public.quiz_results 
  WHERE fresher_id = fresher_uuid;
  
  SELECT COUNT(*) INTO completed_quizzes 
  FROM public.quiz_results 
  WHERE fresher_id = fresher_uuid AND completed = true;
  
  IF total_quizzes = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed_quizzes::NUMERIC / total_quizzes::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get average quiz score
CREATE OR REPLACE FUNCTION public.get_average_score(fresher_uuid UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(score), 2), 0)
    FROM public.quiz_results 
    WHERE fresher_id = fresher_uuid AND completed = true
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Insert some initial system queues
INSERT INTO public.system_queues (queue_name, status, pending_count, processed_count, error_count) VALUES
  ('Training Queue', 'operational', 12, 45, 0),
  ('Assessment Queue', 'warning', 8, 23, 2),
  ('Certification Queue', 'operational', 5, 67, 1),
  ('Support Queue', 'critical', 15, 12, 5);

-- Insert some sample freshers (you can remove this later)
INSERT INTO public.freshers (name, email, department, batch, status, phone) VALUES
  ('John Doe', 'john.doe@company.com', 'Engineering', 'Batch-2024-A', 'active', '+1234567890'),
  ('Jane Smith', 'jane.smith@company.com', 'Design', 'Batch-2024-A', 'active', '+1234567891'),
  ('Mike Johnson', 'mike.johnson@company.com', 'Marketing', 'Batch-2024-B', 'completed', '+1234567892'),
  ('Sarah Wilson', 'sarah.wilson@company.com', 'Engineering', 'Batch-2024-A', 'active', '+1234567893'),
  ('David Brown', 'david.brown@company.com', 'Sales', 'Batch-2024-B', 'inactive', '+1234567894');

-- Insert some sample quiz results
INSERT INTO public.quiz_results (fresher_id, score, total_questions, correct_answers, time_taken, completed) 
SELECT 
  f.id,
  FLOOR(RANDOM() * 101)::INTEGER,
  5,
  FLOOR(RANDOM() * 6)::INTEGER,
  FLOOR(RANDOM() * 600 + 60)::INTEGER,
  true
FROM public.freshers f
CROSS JOIN generate_series(1, 3);

-- Enable realtime for all tables
ALTER TABLE public.freshers REPLICA IDENTITY FULL;
ALTER TABLE public.quiz_results REPLICA IDENTITY FULL;
ALTER TABLE public.system_queues REPLICA IDENTITY FULL;
ALTER TABLE public.activities REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.freshers;
ALTER publication supabase_realtime ADD TABLE public.quiz_results;
ALTER publication supabase_realtime ADD TABLE public.system_queues;
ALTER publication supabase_realtime ADD TABLE public.activities;