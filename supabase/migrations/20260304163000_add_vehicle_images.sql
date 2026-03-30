ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS interior_image_url TEXT;

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
  latest_market.notes AS market_notes,
  vm.default_image_url,
  vm.interior_image_url
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
