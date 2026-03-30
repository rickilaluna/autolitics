-- Add SUV Explorer taxonomy to vehicle_models

-- 0. Drop dependent views first
DROP VIEW IF EXISTS v_engagement_shortlist CASCADE;
DROP VIEW IF EXISTS v_vehicle_config_profile CASCADE;

-- 1. Add new columns to vehicle_models
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS use_case TEXT;
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS msrp_tier TEXT;
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS positioning TEXT;
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS powertrain_summary TEXT;
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS origin TEXT;

-- 2. Recreate v_vehicle_config_profile to include the new columns
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
  vm.default_image_url,
  vm.interior_image_url,
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
  latest_market.notes AS market_notes
FROM vehicle_configs vc
JOIN vehicle_models vm ON vm.id = vc.vehicle_model_id
LEFT JOIN msrp_specs ms ON ms.vehicle_config_id = vc.id
LEFT JOIN dimension_specs ds ON ds.vehicle_model_id = vm.id
LEFT JOIN safety_specs ss ON ss.vehicle_model_id = vm.id
LEFT JOIN expert_ratings er ON er.vehicle_config_id = vc.id
LEFT JOIN reliability_signals rs ON rs.vehicle_model_id = vm.id
LEFT JOIN LATERAL (
  SELECT *
  FROM market_snapshots m
  WHERE m.vehicle_config_id = vc.id
  ORDER BY m.snapshot_date DESC, m.created_at DESC
  LIMIT 1
) latest_market ON TRUE;

-- 3. Recreate v_engagement_shortlist
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
