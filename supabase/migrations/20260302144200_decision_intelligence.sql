-- clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    names TEXT NOT NULL,
    email TEXT,
    household_notes TEXT,
    current_vehicle TEXT,
    budget_min INTEGER,
    budget_max INTEGER,
    new_or_used TEXT,
    ownership_horizon TEXT,
    risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 5),
    efficiency_priority INTEGER CHECK (efficiency_priority BETWEEN 1 AND 5),
    durability_priority INTEGER CHECK (durability_priority BETWEEN 1 AND 5),
    space_priority INTEGER CHECK (space_priority BETWEEN 1 AND 5),
    interior_priority INTEGER CHECK (interior_priority BETWEEN 1 AND 5),
    must_have_features TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
);

-- engagements table
CREATE TABLE IF NOT EXISTS public.engagements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'intake' CHECK (status IN ('intake', 'strategy', 'delivered', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    published_version_id UUID -- will reference deliverable_versions once created
);

-- deliverable_versions table
CREATE TABLE IF NOT EXISTS public.deliverable_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
    json_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    published BOOLEAN DEFAULT false,
    pdf_url TEXT
);

-- vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    generation_notes TEXT,
    default_images TEXT[],
    active_year_range TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- vehicle_specs table
CREATE TABLE IF NOT EXISTS public.vehicle_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    model_year TEXT,
    trim TEXT,
    powertrain_description TEXT,
    drivetrain TEXT,
    length_in NUMERIC,
    legroom_2nd_in NUMERIC,
    legroom_3rd_in NUMERIC,
    cargo_behind_3rd_cuft NUMERIC,
    cargo_max_cuft NUMERIC,
    mpg_city NUMERIC,
    mpg_hwy NUMERIC,
    mpg_combined NUMERIC,
    reliability_score TEXT,
    has_360_camera TEXT,
    source_url TEXT,
    source_date TEXT,
    confidence_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- shortlist_items table
CREATE TABLE IF NOT EXISTS public.shortlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
    vehicle_spec_id UUID REFERENCES public.vehicle_specs(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('recommended', 'benchmark', 'excluded')),
    rationale_fit_bullets TEXT[],
    rationale_tradeoffs_bullets TEXT[],
    best_for_tag TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS setup (Assuming simple RLS where authenticated users have full access, 
-- and perhaps unauthenticated/client users can view their own deliverables in the future)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist_items ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted access to authenticated admins (placeholder policy, normally we'd check JWT claims or a profiles table)
CREATE POLICY "Enable all access for authenticated users" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.engagements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.deliverable_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.vehicle_specs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users" ON public.shortlist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable public read access for a deliverable if it is published? We might need this later.
CREATE POLICY "Enable read access for public deliverables" ON public.deliverable_versions FOR SELECT TO anon USING (published = true);
-- Also need the related engagement and client data for the public page, but let's just make it simple if we want.
