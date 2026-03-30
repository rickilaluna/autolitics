-- Profile v2: pronouns, purchase partner, budget slider columns
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS pronouns text,
ADD COLUMN IF NOT EXISTS partner_name text,
ADD COLUMN IF NOT EXISTS partner_email text,
ADD COLUMN IF NOT EXISTS budget_min integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_max integer DEFAULT 75000;

-- Migrate any existing budget_range text values to min/max
UPDATE clients SET
  budget_min = CASE budget_range
    WHEN 'Under $20K' THEN 0
    WHEN '$20K - $35K' THEN 20000
    WHEN '$35K - $50K' THEN 35000
    WHEN '$50K - $75K' THEN 50000
    WHEN '$75K+' THEN 75000
    ELSE 0
  END,
  budget_max = CASE budget_range
    WHEN 'Under $20K' THEN 20000
    WHEN '$20K - $35K' THEN 35000
    WHEN '$35K - $50K' THEN 50000
    WHEN '$50K - $75K' THEN 75000
    WHEN '$75K+' THEN 150000
    ELSE 75000
  END
WHERE budget_range IS NOT NULL AND budget_range != '';
