-- =========================================================================
-- SUPABASE FORM BUILDER & DATA COLLECTION SYSTEM SCHEMA & POLICIES
-- Usama Rasheed — Environmental Engineer & AI Solutions Expert Portfolio
-- =========================================================================
-- Run this script in your Supabase Project:
-- 1. Open your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your project -> Go to SQL Editor in the left sidebar
-- 3. Click "New query", paste the script below, and click "Run"
-- =========================================================================

-- 1. Forms Table
CREATE TABLE IF NOT EXISTS public.forms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
    sections JSONB DEFAULT '[]'::jsonb,
    questions JSONB DEFAULT '[]'::jsonb NOT NULL,
    appearance JSONB DEFAULT '{
      "accentColor": "#00C853",
      "themeMode": "dark",
      "fontStyle": "sans",
      "submitButtonText": "Submit Response",
      "cardStyle": "modern",
      "showProgressBar": true,
      "showQuestionNumbers": true,
      "backgroundPattern": "grid"
    }'::jsonb NOT NULL,
    settings JSONB DEFAULT '{
      "allowMultipleSubmissions": true,
      "successMessageTitle": "Response Received!",
      "successMessageBody": "Thank you for submitting your response. Your details have been recorded safely.",
      "closedMessage": "This form is no longer accepting responses."
    }'::jsonb NOT NULL,
    responses_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Form Responses Table
CREATE TABLE IF NOT EXISTS public.form_responses (
    id TEXT PRIMARY KEY,
    form_id TEXT NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
    form_slug TEXT,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    respondent_meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_forms_slug ON public.forms(slug);
CREATE INDEX IF NOT EXISTS idx_forms_status ON public.forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON public.forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON public.form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form_slug ON public.form_responses(form_slug);
CREATE INDEX IF NOT EXISTS idx_form_responses_created_at ON public.form_responses(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

-- 5. Policies for "forms"
-- Public can view ONLY published forms by slug
DROP POLICY IF EXISTS "Public can view published forms" ON public.forms;
CREATE POLICY "Public can view published forms" 
ON public.forms 
FOR SELECT 
USING (status = 'published');

-- Authenticated admins have full management access to forms
DROP POLICY IF EXISTS "Authenticated users full access to forms" ON public.forms;
CREATE POLICY "Authenticated users full access to forms" 
ON public.forms 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 6. Policies for "form_responses"
-- Public respondents can INSERT submissions to published forms, but CANNOT view, edit, or delete any responses!
DROP POLICY IF EXISTS "Public can insert form responses" ON public.form_responses;
CREATE POLICY "Public can insert form responses" 
ON public.form_responses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE public.forms.id = form_id 
    AND public.forms.status = 'published'
  )
);

-- Authenticated admins have full access to view, analyze, and delete responses
DROP POLICY IF EXISTS "Authenticated users full access to form responses" ON public.form_responses;
CREATE POLICY "Authenticated users full access to form responses" 
ON public.form_responses 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 7. Secure Submission Stored Procedure (Atomic transaction & validation)
CREATE OR REPLACE FUNCTION public.submit_form_response_secure(
    p_response_id TEXT,
    p_form_slug TEXT,
    p_answers JSONB,
    p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_form RECORD;
    v_new_count INTEGER;
BEGIN
    -- 1. Find form
    SELECT * INTO v_form 
    FROM public.forms 
    WHERE slug = p_form_slug;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Form not found or has been removed.');
    END IF;

    -- 2. Check form status
    IF v_form.status <> 'published' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This form is currently closed and not accepting new responses.');
    END IF;

    -- 3. Check optional response limit
    IF (v_form.settings->>'responseLimit') IS NOT NULL AND (v_form.settings->>'responseLimit')::integer > 0 THEN
        IF v_form.responses_count >= (v_form.settings->>'responseLimit')::integer THEN
            RETURN jsonb_build_object('success', false, 'error', 'This form has reached its maximum response capacity.');
        END IF;
    END IF;

    -- 4. Check optional expiration date
    IF (v_form.settings->>'expiresAt') IS NOT NULL AND (v_form.settings->>'expiresAt') <> '' THEN
        IF NOW() > (v_form.settings->>'expiresAt')::timestamptz THEN
            RETURN jsonb_build_object('success', false, 'error', 'The deadline for submitting this form has passed.');
        END IF;
    END IF;

    -- 5. Insert response
    INSERT INTO public.form_responses (
        id,
        form_id,
        form_slug,
        answers,
        respondent_meta,
        created_at
    ) VALUES (
        p_response_id,
        v_form.id,
        v_form.slug,
        p_answers,
        p_meta,
        NOW()
    );

    -- 6. Atomically increment response count on the parent form
    UPDATE public.forms 
    SET responses_count = COALESCE(responses_count, 0) + 1,
        updated_at = NOW()
    WHERE id = v_form.id
    RETURNING responses_count INTO v_new_count;

    RETURN jsonb_build_object(
        'success', true, 
        'response_id', p_response_id,
        'responses_count', v_new_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.submit_form_response_secure(TEXT, TEXT, JSONB, JSONB) TO anon, authenticated;

-- 8. Enable Realtime on both tables for instant live response notifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'form_responses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.form_responses;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'forms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.forms;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if realtime publication is managed differently
END $$;

-- Confirmation output
SELECT 'Form Builder & Data Collection schema installed successfully! Tables "forms" and "form_responses" are active.' AS status;
