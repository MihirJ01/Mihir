
-- Update term type constraints to include 4 months for CBSE
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_term_type_check;
ALTER TABLE public.students ADD CONSTRAINT students_term_type_check 
CHECK (term_type IN ('2 months', '3 months', '4 months'));

-- Update fee_records table to include 4 months term type
ALTER TABLE public.fee_records DROP CONSTRAINT IF EXISTS fee_records_term_type_check;
ALTER TABLE public.fee_records ADD CONSTRAINT fee_records_term_type_check 
CHECK (term_type IN ('2 months', '3 months', '4 months'));

-- Create work_submissions table for tracking student work completion
CREATE TABLE IF NOT EXISTS public.work_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.work_assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'pending', 'late')),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS for work_submissions
ALTER TABLE public.work_submissions ENABLE ROW LEVEL SECURITY;

-- Add realtime for work_submissions
ALTER TABLE public.work_submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_submissions;

-- Update existing students' term types based on their board
UPDATE public.students 
SET term_type = '4 months' 
WHERE board = 'CBSE' AND term_type = '3 months';

UPDATE public.students 
SET term_type = '3 months' 
WHERE board = 'State Board' AND term_type = '2 months';
