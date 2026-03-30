-- Migration: Intelligence Workspace Schema Updates

-- 1. Add fields to vehicle_models
ALTER TABLE public.vehicle_models 
ADD COLUMN IF NOT EXISTS vehicle_summary TEXT,
ADD COLUMN IF NOT EXISTS strategic_role_tags TEXT[];

-- 2. Add fields to dimension_specs
ALTER TABLE public.dimension_specs
ADD COLUMN IF NOT EXISTS towing_capacity_lbs INTEGER,
ADD COLUMN IF NOT EXISTS ground_clearance_in NUMERIC(4,1);

-- 3. Modify vehicle_evaluations
-- First, drop the strict config dependency constraint
ALTER TABLE public.vehicle_evaluations DROP CONSTRAINT IF EXISTS vehicle_evaluations_vehicle_config_id_fkey;
ALTER TABLE public.vehicle_evaluations DROP CONSTRAINT IF EXISTS unique_evaluation_per_config;

-- Make vehicle_config_id nullable
ALTER TABLE public.vehicle_evaluations ALTER COLUMN vehicle_config_id DROP NOT NULL;

-- Add vehicle_model_id with fkey constraint
ALTER TABLE public.vehicle_evaluations 
ADD COLUMN IF NOT EXISTS vehicle_model_id UUID REFERENCES public.vehicle_models(id) ON DELETE CASCADE;

-- Re-establish constraints but allow either config OR model
ALTER TABLE public.vehicle_evaluations 
ADD CONSTRAINT vehicle_evaluations_vehicle_config_id_fkey FOREIGN KEY (vehicle_config_id) REFERENCES public.vehicle_configs(id) ON DELETE CASCADE;

-- Ensure an evaluation belongs to a model OR a config, but not neither
ALTER TABLE public.vehicle_evaluations
ADD CONSTRAINT check_eval_target CHECK (
    (vehicle_model_id IS NOT NULL AND vehicle_config_id IS NULL) OR 
    (vehicle_model_id IS NULL AND vehicle_config_id IS NOT NULL) OR
    (vehicle_model_id IS NOT NULL AND vehicle_config_id IS NOT NULL)
);

-- Note: We intentionally don't add a unique constraint covering BOTH since it could get messy. We'll handle logical uniqueness in code or add complex unique indexes if needed later.
CREATE UNIQUE INDEX IF NOT EXISTS unique_model_eval ON public.vehicle_evaluations (vehicle_model_id) WHERE vehicle_model_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_config_eval ON public.vehicle_evaluations (vehicle_config_id) WHERE vehicle_config_id IS NOT NULL;

-- 4. Update core Views
DROP VIEW IF EXISTS v_engagement_shortlist CASCADE;
DROP VIEW IF EXISTS v_vehicle_config_profile CASCADE;

CREATE OR REPLACE VIEW v_vehicle_config_profile AS
SELECT
  vm.make,
  vm.model,
  vm.segment,
  vm.use_case,
  vm.msrp_tier,
  vm.positioning,
  vm.powertrain_summary,
  vm.origin,
  vm.generation_label,
  vm.vehicle_summary,
  vm.strategic_role_tags,
  vm.default_image_url,
  vm.interior_image_url,
  vm.photo_url_front_34,
  vm.photo_url_rear_34,
  vm.photo_url_side_profile,
  vm.photo_url_interior_dash,
  vm.photo_url_cargo_area,
  vm.id AS vehicle_model_id,
  vm.default_best_for,
  vm.default_why_it_fits,
  vm.default_tradeoffs,
  vm.default_trim_guidance,
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
  ds.length_in,
  ds.width_in,
  ds.height_in,
  ds.wheelbase_in,
  ds.curb_weight_lbs,
  ds.legroom_2nd_row_in,
  ds.legroom_3rd_row_in,
  ds.cargo_behind_3rd_cu_ft,
  ds.max_cargo_cu_ft,
  ds.towing_capacity_lbs,
  ds.ground_clearance_in,
  ss.nhtsa_overall_stars,
  ss.iihs_tsp_status,
  er.edmunds_rating,
  er.car_and_driver_rating,
  er.key_differentiators,
  rs.source_name AS reliability_source,
  rs.score_value AS reliability_score_value,
  rs.score_scale AS reliability_score_scale,
  rs.summary_label AS reliability_summary_label,
  rs.known_issues_notes AS reliability_known_issues,
  latest_market.snapshot_date AS market_snapshot_date,
  latest_market.type AS market_type,
  latest_market.mileage_band AS market_mileage_band,
  latest_market.price_low AS market_price_low,
  latest_market.price_mid AS market_price_mid,
  latest_market.price_high AS market_price_high,
  latest_market.notes AS market_notes,
  -- Coalesce from config-level evaluation FIRST, then fallback to model-level
  COALESCE(ve_config.space_score, ve_model.space_score) AS eval_space_score,
  COALESCE(ve_config.usability_score, ve_model.usability_score) AS eval_usability_score,
  COALESCE(ve_config.efficiency_score, ve_model.efficiency_score) AS eval_efficiency_score,
  COALESCE(ve_config.durability_score, ve_model.durability_score) AS eval_durability_score,
  COALESCE(ve_config.comfort_score, ve_model.comfort_score) AS eval_comfort_score,
  COALESCE(ve_config.software_technology_score, ve_model.software_technology_score) AS eval_software_technology_score,
  COALESCE(ve_config.value_score, ve_model.value_score) AS eval_value_score,
  COALESCE(ve_config.autolitics_design_index, ve_model.autolitics_design_index) AS eval_adi_score,
  COALESCE(ve_config.overall_profile_notes, ve_model.overall_profile_notes) AS eval_overall_notes
FROM vehicle_configs vc
JOIN vehicle_models vm ON vm.id = vc.vehicle_model_id
LEFT JOIN msrp_specs ms ON ms.vehicle_config_id = vc.id
LEFT JOIN dimension_specs ds ON ds.vehicle_model_id = vm.id
LEFT JOIN safety_specs ss ON ss.vehicle_model_id = vm.id
LEFT JOIN expert_ratings er ON er.vehicle_config_id = vc.id
LEFT JOIN reliability_signals rs ON rs.vehicle_model_id = vm.id
LEFT JOIN vehicle_evaluations ve_config ON ve_config.vehicle_config_id = vc.id
LEFT JOIN vehicle_evaluations ve_model ON ve_model.vehicle_model_id = vm.id
LEFT JOIN LATERAL (
  SELECT *
  FROM market_snapshots m
  WHERE m.vehicle_config_id = vc.id
  ORDER BY m.snapshot_date DESC, m.created_at DESC
  LIMIT 1
) latest_market ON TRUE;

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
WHERE e.status IN ('intake', 'strategy', 'delivered');
