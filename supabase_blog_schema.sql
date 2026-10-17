-- =========================================================================
-- SUPABASE BLOG SYSTEM SCHEMA & POLICIES
-- Usama Rasheed — Environmental Engineer & AI Solutions Expert Portfolio
-- =========================================================================
-- Run this script in your Supabase Project:
-- 1. Open your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your project -> Go to SQL Editor in the left sidebar
-- 3. Click "New query", paste the script below, and click "Run"
-- =========================================================================

-- 1. Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    category TEXT DEFAULT 'General',
    tags JSONB DEFAULT '[]'::jsonb,
    author JSONB DEFAULT '{"name": "Usama Rasheed", "role": "Environmental Engineer & AI Solutions Expert", "avatar": "https://myphotosss.netlify.app/5.png"}'::jsonb,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reading_time TEXT DEFAULT '5 min read',
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'scheduled', 'archived')),
    scheduled_date TIMESTAMPTZ,
    featured BOOLEAN DEFAULT false,
    seo JSONB DEFAULT '{}'::jsonb,
    views INTEGER DEFAULT 0
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON public.blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON public.blogs(featured);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Public can read all published blog articles
DROP POLICY IF EXISTS "Public can view published blogs" ON public.blogs;
CREATE POLICY "Public can view published blogs" 
ON public.blogs 
FOR SELECT 
USING (status = 'published');

-- Authenticated users (admin) can view, insert, update, delete all posts
DROP POLICY IF EXISTS "Authenticated users full access to blogs" ON public.blogs;
CREATE POLICY "Authenticated users full access to blogs" 
ON public.blogs 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow public increment of views (optional safe RPC)
CREATE OR REPLACE FUNCTION public.increment_blog_views(post_slug TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.blogs
    SET views = COALESCE(views, 0) + 1
    WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.increment_blog_views(TEXT) TO anon, authenticated;

-- Confirmation query
SELECT 'Blog schema installed successfully! Table "blogs" is ready.' AS status;
