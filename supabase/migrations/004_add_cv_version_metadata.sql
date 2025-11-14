-- Add metadata columns to cv_versions table for file uploads
-- These columns store information about uploaded CV files

ALTER TABLE cv_versions 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN cv_versions.file_name IS 'Original filename of uploaded CV';
COMMENT ON COLUMN cv_versions.file_size IS 'File size in bytes';
COMMENT ON COLUMN cv_versions.upload_date IS 'Timestamp when file was uploaded';
