-- Add search profile fields to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS buying_timeline text,
ADD COLUMN IF NOT EXISTS primary_goal text,
ADD COLUMN IF NOT EXISTS trade_in_status text,
ADD COLUMN IF NOT EXISTS active_shortlist text[] DEFAULT '{}'::text[];
