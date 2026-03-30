-- Drop old tables from the previous version of the schema
DROP TABLE IF EXISTS shortlist_items CASCADE;
DROP TABLE IF EXISTS vehicle_specs CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS deliverable_versions CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
-- ============================================================
-- Autolitics Studio — Supabase/Postgres Schema (V1.5)
-- Decision Intelligence Builder
-- Config-per-model-year architecture (Representative Config)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================
-- ENUMS
-- =============================
DO $$ BEGIN
  CREATE TYPE feature_availability AS ENUM ('standard', 'optional', 'not_available', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE market_type AS ENUM ('used', 'cpo', 'new');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE source_confidence AS ENUM ('high', 'medium', 'low', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================
-- SOURCE RECORDS
-- =============================
CREATE TABLE IF NOT EXISTS source_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher TEXT NOT NULL,
  url TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- =============================
-- VEHICLE MODELS
-- =============================
CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  segment TEXT,
  body_style TEXT,
  generation_label TEXT,
  generation_notes TEXT,
  default_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (make, model)
);

-- =============================
-- VEHICLE CONFIGS (Comparison Unit)
-- =============================
CREATE TABLE IF NOT EXISTS vehicle_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_model_id UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
  model_year INTEGER NOT NULL,
  config_label TEXT NOT NULL DEFAULT 'Representative',
  powertrain_category TEXT,
  drivetrain TEXT,
  seating_standard INTEGER,
  seating_max INTEGER,
  config_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_model_id, model_year, config_label)
);

-- =============================
-- MSRP / TRIM RANGE
-- =============================
CREATE TABLE IF NOT EXISTS msrp_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  base_msrp INTEGER,
  top_trim_msrp INTEGER,
  trim_levels_json JSONB,
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_config_id)
);

-- =============================
-- POWERTRAIN / EFFICIENCY
-- =============================
CREATE TABLE IF NOT EXISTS powertrain_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  engine_description TEXT,
  horsepower_hp INTEGER,
  torque_lb_ft INTEGER,
  transmission TEXT,
  city_mpg INTEGER,
  highway_mpg INTEGER,
  combined_mpg INTEGER,
  ev_range_miles INTEGER,
  zero_to_sixty_sec NUMERIC(4,1),
  towing_capacity_lbs INTEGER,
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_config_id)
);

-- =============================
-- DIMENSIONS / PACKAGING
-- =============================
CREATE TABLE IF NOT EXISTS dimension_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  length_in NUMERIC(6,1),
  width_in NUMERIC(6,1),
  height_in NUMERIC(6,1),
  wheelbase_in NUMERIC(6,1),
  curb_weight_lbs INTEGER,
  legroom_2nd_row_in NUMERIC(5,1),
  legroom_3rd_row_in NUMERIC(5,1),
  cargo_behind_3rd_cu_ft NUMERIC(6,1),
  max_cargo_cu_ft NUMERIC(6,1),
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_config_id)
);

-- =============================
-- SAFETY RATINGS
-- =============================
CREATE TABLE IF NOT EXISTS safety_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  nhtsa_overall_stars INTEGER CHECK (nhtsa_overall_stars BETWEEN 0 AND 5),
  iihs_tsp_status TEXT CHECK (iihs_tsp_status IN ('TSP+', 'TSP', 'None', 'Not Rated')),
  standard_safety_notes TEXT,
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_config_id)
);

-- =============================
-- RELIABILITY SIGNALS
-- =============================
CREATE TABLE IF NOT EXISTS reliability_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  score_value NUMERIC(5,2),
  score_scale TEXT,
  summary_label TEXT,
  notes TEXT,
  known_issues_notes TEXT,
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================
-- EXPERT RATINGS
-- =============================
CREATE TABLE IF NOT EXISTS expert_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  edmunds_rating NUMERIC(3,1),
  car_and_driver_rating NUMERIC(3,1),
  key_differentiators TEXT,
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_config_id)
);

-- =============================
-- FEATURE AVAILABILITY
-- =============================
CREATE TABLE IF NOT EXISTS feature_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  availability feature_availability NOT NULL DEFAULT 'unknown',
  notes TEXT,
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vehicle_config_id, feature_key)
);

-- =============================
-- MARKET SNAPSHOTS
-- =============================
CREATE TABLE IF NOT EXISTS market_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type market_type NOT NULL DEFAULT 'used',
  region TEXT,
  mileage_band TEXT,
  price_low INTEGER,
  price_mid INTEGER,
  price_high INTEGER,
  notes TEXT,
  source_id UUID REFERENCES source_records(id) ON DELETE SET NULL,
  confidence source_confidence NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================
-- PROFILE VIEW (One Row Per Config)
-- =============================
CREATE OR REPLACE VIEW v_vehicle_config_profile AS
SELECT
  vm.make,
  vm.model,
  vm.segment,
  vm.generation_label,
  vc.id AS vehicle_config_id,
  vc.model_year,
  vc.config_label,
  vc.powertrain_category,
  vc.drivetrain,
  vc.seating_standard,
  vc.seating_max,
  vc.config_notes,
  ms.base_msrp,
  ms.top_trim_msrp,
  pt.engine_description,
  pt.horsepower_hp,
  pt.torque_lb_ft,
  pt.transmission,
  pt.city_mpg,
  pt.highway_mpg,
  pt.combined_mpg,
  pt.ev_range_miles,
  pt.zero_to_sixty_sec,
  pt.towing_capacity_lbs,
  ds.length_in,
  ds.width_in,
  ds.height_in,
  ds.wheelbase_in,
  ds.curb_weight_lbs,
  ds.legroom_2nd_row_in,
  ds.legroom_3rd_row_in,
  ds.cargo_behind_3rd_cu_ft,
  ds.max_cargo_cu_ft,
  ss.nhtsa_overall_stars,
  ss.iihs_tsp_status,
  er.edmunds_rating,
  er.car_and_driver_rating,
  er.key_differentiators,
  latest_market.snapshot_date AS market_snapshot_date,
  latest_market.type AS market_type,
  latest_market.mileage_band AS market_mileage_band,
  latest_market.price_low AS market_price_low,
  latest_market.price_mid AS market_price_mid,
  latest_market.price_high AS market_price_high,
  latest_market.notes AS market_notes
FROM vehicle_configs vc
JOIN vehicle_models vm ON vm.id = vc.vehicle_model_id
LEFT JOIN msrp_specs ms ON ms.vehicle_config_id = vc.id
LEFT JOIN powertrain_specs pt ON pt.vehicle_config_id = vc.id
LEFT JOIN dimension_specs ds ON ds.vehicle_config_id = vc.id
LEFT JOIN safety_specs ss ON ss.vehicle_config_id = vc.id
LEFT JOIN expert_ratings er ON er.vehicle_config_id = vc.id
LEFT JOIN LATERAL (
  SELECT *
  FROM market_snapshots m
  WHERE m.vehicle_config_id = vc.id
  ORDER BY m.snapshot_date DESC, m.created_at DESC
  LIMIT 1
) latest_market ON TRUE;


-- ============================================================
-- CLIENTS / ENGAGEMENTS / DELIVERABLES (V1)
-- Internal tool first. Client portal later.
-- ============================================================

DO $$ BEGIN
  CREATE TYPE engagement_status AS ENUM ('intake', 'strategy', 'delivered', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE shortlist_item_status AS ENUM ('recommended', 'benchmark', 'excluded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE deliverable_visibility AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================
-- CLIENTS
-- =============================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_contact_name TEXT NOT NULL,
  secondary_contact_name TEXT,
  primary_email TEXT,
  secondary_email TEXT,
  location TEXT,

  -- Household context (lightweight; keep privacy-conscious)
  household_notes TEXT, -- e.g., "2 kids (11mo, 4yr), 120lb dog"
  current_vehicles TEXT, -- e.g., "2008 RAV4; 2017 Mercedes GLC"

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================
-- ENGAGEMENTS
-- =============================
CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status engagement_status NOT NULL DEFAULT 'intake',

  -- Decision parameters
  budget_min INTEGER,
  budget_max INTEGER,
  purchase_type market_type NOT NULL DEFAULT 'used', -- used/cpo/new
  timeline_notes TEXT,
  ownership_horizon TEXT,

  -- Priority weights (internal; do NOT expose numeric weights to clients)
  priority_space SMALLINT CHECK (priority_space BETWEEN 1 AND 5),
  priority_efficiency SMALLINT CHECK (priority_efficiency BETWEEN 1 AND 5),
  priority_durability SMALLINT CHECK (priority_durability BETWEEN 1 AND 5),
  priority_interior SMALLINT CHECK (priority_interior BETWEEN 1 AND 5),
  priority_risk SMALLINT CHECK (priority_risk BETWEEN 1 AND 5),

  must_have_features JSONB, -- e.g., ["camera_360", "blind_spot", "adaptive_cruise"]
  notes_internal TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================
-- SHORTLIST ITEMS (per engagement)
-- Links engagements to vehicle_configs (recommended + benchmarks)
-- =============================
CREATE TABLE IF NOT EXISTS shortlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
  vehicle_config_id UUID NOT NULL REFERENCES vehicle_configs(id) ON DELETE RESTRICT,
  status shortlist_item_status NOT NULL DEFAULT 'recommended',

  -- Atelier-facing narrative (client-safe copy)
  best_for_tag TEXT, -- e.g., "Best Overall Fit", "Best Value", "Comfort-Forward"
  why_it_fits_bullets JSONB, -- array of strings
  tradeoffs_bullets JSONB,   -- array of strings
  trim_guidance_notes TEXT,  -- "360 cam trim-dependent; target Limited/Platinum" etc.

  -- Internal scoring signals (not client-visible)
  internal_rank SMALLINT,
  internal_alignment JSONB, -- e.g., {"space":"strong","efficiency":"strong","risk":"low"}

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (engagement_id, vehicle_config_id)
);

-- =============================
-- DELIVERABLE VERSIONS
-- Stores immutable snapshots for publish and PDF export.
-- =============================
CREATE TABLE IF NOT EXISTS deliverable_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT 'Vehicle Strategy Brief',
  subtitle TEXT NOT NULL DEFAULT 'Shortlist & Recommendation',

  visibility deliverable_visibility NOT NULL DEFAULT 'draft',
  version_number INTEGER NOT NULL DEFAULT 1,

  -- JSON snapshot of all rendered content inputs (immutable once published)
  snapshot JSONB NOT NULL,

  -- Render artifacts
  published_at TIMESTAMPTZ,
  pdf_url TEXT,
  web_share_slug TEXT, -- optional, for client portal later

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (engagement_id, version_number)
);

-- =============================
-- DELIVERABLE SECTION OVERRIDES (optional)
-- Use only if you need per-section manual tweaks without changing full snapshot.
-- In V1 you can skip this; keep for future flexibility.
-- =============================
CREATE TABLE IF NOT EXISTS deliverable_section_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_version_id UUID NOT NULL REFERENCES deliverable_versions(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, -- e.g., "executive_summary", "cpo_strategy"
  override_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (deliverable_version_id, section_key)
);

-- =============================
-- HELPER VIEW: ACTIVE SHORTLIST FOR AN ENGAGEMENT
-- =============================
CREATE OR REPLACE VIEW v_engagement_shortlist AS
SELECT
  e.id AS engagement_id,
  e.status AS engagement_status,
  c.primary_contact_name,
  c.secondary_contact_name,
  c.primary_email,
  c.location,
  e.budget_min,
  e.budget_max,
  e.purchase_type,
  si.status AS shortlist_status,
  si.best_for_tag,
  si.why_it_fits_bullets,
  si.tradeoffs_bullets,
  si.trim_guidance_notes,
  si.internal_rank,
  si.internal_alignment,
  v.*
FROM engagements e
JOIN clients c ON c.id = e.client_id
JOIN shortlist_items si ON si.engagement_id = e.id
JOIN v_vehicle_config_profile v ON v.vehicle_config_id = si.vehicle_config_id
WHERE e.status IN ('intake','strategy','delivered');

-- ============================================================
-- NOTES
-- - Numeric priority weights and internal_rank/internal_alignment are for admin use only.
-- - Client-facing deliverables should show alignment labels (Strong/Good/Moderate) not numeric totals.
-- - deliverable_versions.snapshot should contain only the content needed to render the deliverable.
-- ============================================================
