-- Create listing_reviews table
CREATE TABLE public.listing_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
    listing_url TEXT NOT NULL,
    vehicle_name TEXT NOT NULL,
    client_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected')),
    advisor_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create test_drive_feedback table
CREATE TABLE public.test_drive_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
    vehicle_driven TEXT NOT NULL,
    drive_date DATE NOT NULL,
    rating_comfort INTEGER CHECK (rating_comfort >= 1 AND rating_comfort <= 5),
    rating_performance INTEGER CHECK (rating_performance >= 1 AND rating_performance <= 5),
    rating_tech INTEGER CHECK (rating_tech >= 1 AND rating_tech <= 5),
    overall_impression TEXT,
    likes TEXT,
    dislikes TEXT,
    verdict TEXT CHECK (verdict IN ('top_contender', 'maybe', 'eliminate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create dealer_offer_reviews table
CREATE TABLE public.dealer_offer_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    engagement_id UUID REFERENCES public.engagements(id) ON DELETE CASCADE,
    dealership_name TEXT NOT NULL,
    vehicle_name TEXT NOT NULL,
    document_url TEXT,
    out_the_door_price NUMERIC,
    client_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
    advisor_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_drive_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_offer_reviews ENABLE ROW LEVEL SECURITY;

-- Create update_modified_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

-- Create Triggers for updated_at
CREATE TRIGGER handle_updated_at_listing_reviews BEFORE UPDATE ON public.listing_reviews FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER handle_updated_at_test_drive_feedback BEFORE UPDATE ON public.test_drive_feedback FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER handle_updated_at_dealer_offer_reviews BEFORE UPDATE ON public.dealer_offer_reviews FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- RLS Policies (Clients can read/insert their own; Admins can do all)
-- For now, allow all authenticated users (since we handle auth at the application level and RLS was relaxed in earlier phases for MVP).
CREATE POLICY "Allow authenticated users to read and insert listing_reviews" ON public.listing_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read and insert test_drive_feedback" ON public.test_drive_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to read and insert dealer_offer_reviews" ON public.dealer_offer_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);
