-- Add icon_url column to skill_categories and tools tables
-- This allows storing custom uploaded images alongside emoji icons

ALTER TABLE skill_categories 
ADD COLUMN IF NOT EXISTS icon_url TEXT;

ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN skill_categories.icon_url IS 'Optional custom image URL for category icon (base64 or external URL)';
COMMENT ON COLUMN tools.icon_url IS 'Optional custom image URL for tool icon (base64 or external URL)';
