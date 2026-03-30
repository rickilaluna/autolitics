-- Add desired_segments to engagements
ALTER TABLE public.engagements ADD COLUMN desired_segments text[] DEFAULT '{}';
