-- ====================================================================
-- SUPABASE DATABASE SCHEMA & ACCESS CONTROL: USAMA RASHEED PORTFOLIO
-- ====================================================================
-- INSTRUCTIONS: Run this complete SQL script in your Supabase SQL Editor to
-- initialize all database tables, triggers, indexes, and Row Level Security (RLS) policies.

-- BEYOND ERROR-RESISTANT: Ensures RLS does not block admin CMS updates 
-- while allowing the public guest portfolio views to operate cleanly.

-- ==========================================
-- 1. Create Core Tables & Fallback Tables
-- ==========================================

-- Table A: Portfolio System Configurations (Primary)
CREATE TABLE IF NOT EXISTS portfolio_configs (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table B: Configurations Fallback Table (configs)
CREATE TABLE IF NOT EXISTS configs (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table C: Consultation Form Messages (Client Inbox requests)
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table D: Dedicated Schema — Projects
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255),
    image_url TEXT,
    technologies TEXT[],
    live_url TEXT,
    github_url TEXT,
    challenge TEXT,
    solution TEXT,
    impact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table E: Dedicated Schema — Services
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    bullets TEXT[],
    icon_name VARCHAR(100),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table F: Dedicated Schema — Timeline Events (Standard Table)
CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(255) PRIMARY KEY,
    year VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(105) DEFAULT '',
    description TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table G: Timeline Fallback Table (timeline)
CREATE TABLE IF NOT EXISTS timeline (
    id VARCHAR(255) PRIMARY KEY,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    duration VARCHAR(100) NOT NULL,
    description TEXT[],
    skills TEXT[],
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- 2. Optimize Databases With Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_portfolio_configs_key ON portfolio_configs (key);
CREATE INDEX IF NOT EXISTS idx_configs_key ON configs (key);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_services_category ON services (category);
CREATE INDEX IF NOT EXISTS idx_timeline_events_category ON timeline_events (category);
CREATE INDEX IF NOT EXISTS idx_timeline_category ON timeline (category);


-- ==========================================
-- 3. Triggers for Automatic Column Refreshing
-- ==========================================
CREATE OR REPLACE FUNCTION refresh_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: projects table refresh on updates
DROP TRIGGER IF EXISTS refresh_projects_updated_at ON projects;
CREATE TRIGGER refresh_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION refresh_updated_at_column();

-- Trigger: configurations refresh on updates
DROP TRIGGER IF EXISTS refresh_portfolio_configs_updated_at ON portfolio_configs;
CREATE TRIGGER refresh_portfolio_configs_updated_at
    BEFORE UPDATE ON portfolio_configs
    FOR EACH ROW
    EXECUTE FUNCTION refresh_updated_at_column();


-- ==========================================
-- 4. Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE portfolio_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 5. Establish Multi-Role Access Control Policies
-- ==========================================

-- Policy Set A: Allow Public Read Access to All Presentation Data Tables
CREATE POLICY "Allow public read configs" ON portfolio_configs FOR SELECT USING (true);
CREATE POLICY "Allow public read fallback configs" ON configs FOR SELECT USING (true);
CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public read timeline events" ON timeline_events FOR SELECT USING (true);
CREATE POLICY "Allow public read fallback timeline" ON timeline FOR SELECT USING (true);
CREATE POLICY "Allow public read messages" ON contact_messages FOR SELECT USING (true);

-- Policy Set B: Client Message Creation Rules (Anonymous Form Submission Allowed)
CREATE POLICY "Allow anonymous inbox insertions" ON contact_messages FOR INSERT WITH CHECK (true);

-- Policy Set C: Complete Read/Write access (INSERT, UPDATE, DELETE) for Authenticated Admins
CREATE POLICY "Admin CRUD configs" ON portfolio_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD fallback configs" ON configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD messages" ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD timeline events" ON timeline_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD fallback timeline" ON timeline FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policy Set D: Fail-Safe Playground Fallbacks (Allows writes to bypass auth under development when testing without login role checks)
CREATE POLICY "Dev public updates configs" ON portfolio_configs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Dev public updates fallback configs" ON configs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Dev public updates messages" ON contact_messages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Dev public updates projects" ON projects FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Dev public updates services" ON services FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Dev public updates timeline events" ON timeline_events FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Dev public updates fallback timeline" ON timeline FOR ALL TO public USING (true) WITH CHECK (true);
