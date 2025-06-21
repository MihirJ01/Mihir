
-- Add batch_time column to students table
ALTER TABLE public.students ADD COLUMN batch_time TEXT NOT NULL DEFAULT '7:30-9:30';

-- Add batch_time column to attendance table  
ALTER TABLE public.attendance ADD COLUMN batch_time TEXT NOT NULL DEFAULT '7:30-9:30';

-- Update the check constraint on students table to include batch_time validation
ALTER TABLE public.students ADD CONSTRAINT students_batch_time_check 
CHECK (batch_time IN ('7:30-9:30', '9:30-11:30', '3:00-5:00'));

-- Update the check constraint on attendance table to include batch_time validation
ALTER TABLE public.attendance ADD CONSTRAINT attendance_batch_time_check 
CHECK (batch_time IN ('7:30-9:30', '9:30-11:30', '3:00-5:00'));

-- Update existing students to have a default batch_time (you may want to set this properly for existing data)
UPDATE public.students SET batch_time = '7:30-9:30' WHERE batch_time IS NULL;

-- Update existing attendance records to have a default batch_time
UPDATE public.attendance SET batch_time = '7:30-9:30' WHERE batch_time IS NULL;
