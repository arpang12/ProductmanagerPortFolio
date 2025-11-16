-- Add unique constraint for case_study_sections
-- This is required for the upsert operation in updateCaseStudy()

-- First, remove any duplicate sections that might exist
-- (Keep the most recent one based on updated_at)
DELETE FROM case_study_sections a
USING case_study_sections b
WHERE a.section_id < b.section_id
  AND a.case_study_id = b.case_study_id
  AND a.section_type = b.section_type;

-- Now add the unique constraint
ALTER TABLE case_study_sections 
ADD CONSTRAINT case_study_sections_case_study_section_type_unique 
UNIQUE (case_study_id, section_type);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_case_study_sections_lookup 
ON case_study_sections(case_study_id, section_type);

-- Add comment for documentation
COMMENT ON CONSTRAINT case_study_sections_case_study_section_type_unique 
ON case_study_sections IS 
'Ensures each case study has only one section of each type. Required for upsert operations.';
