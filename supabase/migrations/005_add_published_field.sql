-- Add is_published field to case_studies table
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Add published_at timestamp
ALTER TABLE case_studies 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Create index for faster queries on published case studies
CREATE INDEX IF NOT EXISTS idx_case_studies_published 
ON case_studies(is_published, created_at DESC);

-- Update existing case studies to be published (optional - remove if you want them unpublished by default)
-- UPDATE case_studies SET is_published = true WHERE is_published IS NULL;
