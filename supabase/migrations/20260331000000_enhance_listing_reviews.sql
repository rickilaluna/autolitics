-- Enhanced listing review fields
ALTER TABLE listing_reviews
ADD COLUMN IF NOT EXISTS vin text,
ADD COLUMN IF NOT EXISTS mileage integer,
ADD COLUMN IF NOT EXISTS asking_price numeric,
ADD COLUMN IF NOT EXISTS dealership_name text,
ADD COLUMN IF NOT EXISTS dealership_location text;
