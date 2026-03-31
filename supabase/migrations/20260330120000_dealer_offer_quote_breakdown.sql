-- Optional structured snapshot from OTD calculator / comparison (JSON)
ALTER TABLE public.dealer_offer_reviews
ADD COLUMN IF NOT EXISTS quote_breakdown JSONB;

COMMENT ON COLUMN public.dealer_offer_reviews.quote_breakdown IS
    'Structured OTD fields from calculator or comparison (sale price, tax, fees, variance, source).';
