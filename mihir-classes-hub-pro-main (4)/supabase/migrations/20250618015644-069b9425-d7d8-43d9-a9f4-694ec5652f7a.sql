
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  board TEXT NOT NULL CHECK (board IN ('CBSE', 'State Board')),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fee_amount INTEGER NOT NULL,
  term_type TEXT NOT NULL CHECK (term_type IN ('2 months', '3 months')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  class TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  class TEXT NOT NULL,
  board TEXT NOT NULL CHECK (board IN ('CBSE', 'State Board')),
  subject TEXT NOT NULL,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fee records table
CREATE TABLE public.fee_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  student_name TEXT NOT NULL,
  class TEXT NOT NULL,
  amount INTEGER NOT NULL,
  term_type TEXT NOT NULL,
  term_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_class TEXT,
  target_board TEXT CHECK (target_board IN ('CBSE', 'State Board')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  is_general BOOLEAN NOT NULL DEFAULT true,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work assignments table
CREATE TABLE public.work_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  class TEXT NOT NULL,
  board TEXT NOT NULL CHECK (board IN ('CBSE', 'State Board')),
  subject TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since this is an admin system)
-- Students policies
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- Attendance policies
CREATE POLICY "Allow all operations on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

-- Notes policies
CREATE POLICY "Allow all operations on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);

-- Fee records policies
CREATE POLICY "Allow all operations on fee_records" ON public.fee_records FOR ALL USING (true) WITH CHECK (true);

-- Announcements policies
CREATE POLICY "Allow all operations on announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- Work assignments policies
CREATE POLICY "Allow all operations on work_assignments" ON public.work_assignments FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fee_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_assignments;
