-- Drop dependent views first
DROP VIEW IF EXISTS v_engagement_shortlist;
DROP VIEW IF EXISTS v_vehicle_config_profile;

-- Alter powertrain_specs
ALTER TABLE powertrain_specs DROP CONSTRAINT IF EXISTS powertrain_specs_vehicle_config_id_key;
ALTER TABLE powertrain_specs DROP CONSTRAINT IF EXISTS powertrain_specs_vehicle_config_id_fkey;
ALTER TABLE powertrain_specs DROP COLUMN IF EXISTS vehicle_config_id;

ALTER TABLE powertrain_specs ADD COLUMN IF NOT EXISTS vehicle_model_id UUID REFERENCES vehicle_models(id) ON DELETE CASCADE;
ALTER TABLE powertrain_specs ADD COLUMN IF NOT EXISTS name TEXT;

-- Recreate v_vehicle_config_profile
CREATE OR REPLACE VIEW v_vehicle_config_profile AS
SELECT
  vm.make,
  vm.model,
  vm.segment,
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

-- Recreate v_engagement_shortlist
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
