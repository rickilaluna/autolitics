CREATE TABLE IF NOT EXISTS public.advisory_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    document_url TEXT NOT NULL,
    icon_type TEXT DEFAULT 'file-text' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.advisory_resources ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read active resources
CREATE POLICY "Advisory resources are viewable by authenticated users"
    ON public.advisory_resources
    FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert resources"
    ON public.advisory_resources
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role' OR auth.email() IN ('rickilaluna@gmail.com', 'zachary.portin@gmail.com', 'ebportin@gmail.com'));

CREATE POLICY "Admins can update resources"
    ON public.advisory_resources
    FOR UPDATE
    TO authenticated
    USING ((SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role' OR auth.email() IN ('rickilaluna@gmail.com', 'zachary.portin@gmail.com', 'ebportin@gmail.com'));

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.advisory_resources
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Seed some initial resources
INSERT INTO public.advisory_resources (title, description, document_url, icon_type, sort_order)
VALUES 
    ('The Autolitics Playbook', 'The comprehensive guide to mastering the modern car buying process.', '#', 'book-open', 1),
    ('Vehicle Scorecard', 'A printable scorecard to take with you on test drives to objectively compare vehicles.', '#', 'file-spreadsheet', 2),
    ('CPO vs. Extended Warranty Guide', 'A breakdown of the pros and cons of Certified Pre-Owned versus aftermarket warranties.', '#', 'shield-check', 3),
    ('Dealer Offer Comparison Template', 'An Excel template to plug in multiple dealer quotes and uncover the true lowest cost.', '#', 'calculator', 4)
ON CONFLICT DO NOTHING;
