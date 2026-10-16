-- ====================================================================
-- CLOUDINARY IMAGE MIGRATION & AUDIT SCRIPT
-- USAMA RASHEED PORTFOLIO (https://www.usamarasheed.tech/)
-- ====================================================================
-- This script provides verification queries and schema security checks
-- for the Cloudinary migration.
-- 
-- Note: Your existing Supabase schema uses:
--   1. `portfolio_configs` (and fallback `configs`) with `value JSONB`
--   2. `projects` with `image_url TEXT`
-- Both columns natively support Cloudinary URLs of any length, so no
-- destructive schema alterations are needed.

-- ====================================================================
-- 1. AUDIT CURRENT IMAGES (Run before & after migration)
-- ====================================================================

-- 1.1 Check Profile & Bio Images in portfolio_configs
SELECT 
    key,
    value->'images' AS profile_images,
    updated_at
FROM portfolio_configs
WHERE key = 'user_info';

-- 1.2 Check Project Images in projects table
SELECT 
    id,
    title,
    category,
    image_url,
    CASE 
        WHEN image_url LIKE '%res.cloudinary.com%' THEN 'Cloudinary (Migrated)'
        WHEN image_url LIKE '%netlify.app%' THEN 'Netlify (Needs Migration)'
        WHEN image_url LIKE '%unsplash.com%' THEN 'Unsplash'
        ELSE 'Other'
    END AS host_source,
    updated_at
FROM projects
ORDER BY created_at ASC;

-- 1.3 Check Projects stored in backup configuration
SELECT 
    key,
    jsonb_array_length(value) AS total_backup_projects,
    updated_at
FROM portfolio_configs
WHERE key = 'projects_data';

-- ====================================================================
-- 2. VERIFY / ENSURE ADMIN RLS POLICIES FOR IMAGE URL WRITES
-- ====================================================================
-- These policies ensure authenticated administrators can update
-- `portfolio_configs` and `projects` during the migration.
-- (If these already exist in your database, the IF NOT EXISTS or 
-- DROP/CREATE blocks ensure safe re-execution).

DO $$ 
BEGIN
    -- Ensure portfolio_configs has update policy for authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'portfolio_configs' AND policyname = 'Admin CRUD configs'
    ) THEN
        CREATE POLICY "Admin CRUD configs" ON portfolio_configs 
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;

    -- Ensure projects has update policy for authenticated users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'projects' AND policyname = 'Admin CRUD projects'
    ) THEN
        CREATE POLICY "Admin CRUD projects" ON projects 
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ====================================================================
-- 3. OPTIONAL AUDIT VIEW FOR CLOUDINARY STATUS
-- ====================================================================
-- You can query this view in Supabase SQL Editor anytime to see
-- the migration status across all projects:
CREATE OR REPLACE VIEW v_projects_image_status AS
SELECT 
    id,
    title,
    image_url,
    (image_url LIKE '%res.cloudinary.com%') AS is_cloudinary,
    updated_at
FROM projects;
