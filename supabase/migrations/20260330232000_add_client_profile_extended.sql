-- Extended profile fields for client dashboard
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS preferred_contact text DEFAULT 'email',
ADD COLUMN IF NOT EXISTS budget_range text,
ADD COLUMN IF NOT EXISTS body_style_preference text,
ADD COLUMN IF NOT EXISTS new_or_used text;
