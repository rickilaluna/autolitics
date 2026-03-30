-- Migration: Move base rationale fields from vehicle_configs to vehicle_models

-- 1. Add fields to vehicle_models
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS default_best_for text;
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS default_why_it_fits text[];
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS default_tradeoffs text[];
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS default_trim_guidance text;

-- Recreate view
DROP VIEW IF EXISTS v_engagement_shortlist CASCADE;
DROP VIEW IF EXISTS v_vehicle_config_profile CASCADE;

-- 2. Drop the old fields from vehicle_configs
ALTER TABLE vehicle_configs DROP COLUMN IF EXISTS default_best_for;
ALTER TABLE vehicle_configs DROP COLUMN IF EXISTS default_why_it_fits;
ALTER TABLE vehicle_configs DROP COLUMN IF EXISTS default_tradeoffs;
ALTER TABLE vehicle_configs DROP COLUMN IF EXISTS default_trim_guidance;

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
