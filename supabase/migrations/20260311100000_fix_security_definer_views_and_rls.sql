-- Fix Supabase Security Advisor issues per supabase-errors.md
-- 1. Recreate views with security_invoker so they use caller's permissions (lint 0010)
-- 2. Enable RLS on public tables that expose to PostgREST (lint 0013)

-- ---------------------------------------------------------------------------
-- 1. Security Definer Views → Security Invoker
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS public.v_engagement_shortlist CASCADE;
DROP VIEW IF EXISTS public.v_vehicle_config_profile CASCADE;

CREATE VIEW public.v_vehicle_config_profile WITH (security_invoker = on) AS
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
  ds.cargo_behind_2nd_cu_ft,
  ds.cargo_behind_3rd_cu_ft,
  ds.max_cargo_cu_ft,
  ds.trunk_volume_cu_ft,
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
  COALESCE(ve_config.space_score, ve_model.space_score) AS eval_space_score,
  COALESCE(ve_config.usability_score, ve_model.usability_score) AS eval_usability_score,
  COALESCE(ve_config.efficiency_score, ve_model.efficiency_score) AS eval_efficiency_score,
  COALESCE(ve_config.durability_score, ve_model.durability_score) AS eval_durability_score,
  COALESCE(ve_config.comfort_score, ve_model.comfort_score) AS eval_comfort_score,
  COALESCE(ve_config.software_technology_score, ve_model.software_technology_score) AS eval_software_technology_score,
  COALESCE(ve_config.value_score, ve_model.value_score) AS eval_value_score,
  COALESCE(ve_config.autolitics_design_index, ve_model.autolitics_design_index) AS eval_adi_score,
  COALESCE(ve_config.overall_profile_notes, ve_model.overall_profile_notes) AS eval_overall_notes
FROM public.vehicle_configs vc
JOIN public.vehicle_models vm ON vm.id = vc.vehicle_model_id
LEFT JOIN public.msrp_specs ms ON ms.vehicle_config_id = vc.id
LEFT JOIN public.dimension_specs ds ON ds.vehicle_model_id = vm.id
LEFT JOIN public.safety_specs ss ON ss.vehicle_model_id = vm.id
LEFT JOIN public.expert_ratings er ON er.vehicle_config_id = vc.id
LEFT JOIN public.reliability_signals rs ON rs.vehicle_model_id = vm.id
LEFT JOIN public.vehicle_evaluations ve_config ON ve_config.vehicle_config_id = vc.id
LEFT JOIN public.vehicle_evaluations ve_model ON ve_model.vehicle_model_id = vm.id
LEFT JOIN LATERAL (
  SELECT *
  FROM public.market_snapshots m
  WHERE m.vehicle_config_id = vc.id
  ORDER BY m.snapshot_date DESC, m.created_at DESC
  LIMIT 1
) latest_market ON TRUE;

CREATE VIEW public.v_engagement_shortlist WITH (security_invoker = on) AS
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
FROM public.engagements e
JOIN public.clients c ON c.id = e.client_id
JOIN public.shortlist_items si ON si.engagement_id = e.id
JOIN public.v_vehicle_config_profile v ON v.vehicle_config_id = si.vehicle_config_id
WHERE e.status IN ('intake', 'strategy', 'delivered');

-- ---------------------------------------------------------------------------
-- 2. Enable RLS on 16 public tables (lint 0013)
-- ---------------------------------------------------------------------------
ALTER TABLE public.msrp_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dimension_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reliability_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_section_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.powertrain_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users full access (service_role bypasses RLS)
-- Drop if exists so migration is idempotent; then create.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'msrp_specs', 'source_records', 'dimension_specs', 'safety_specs',
    'expert_ratings', 'feature_notes', 'market_snapshots', 'reliability_signals',
    'engagements', 'clients', 'shortlist_items', 'deliverable_versions',
    'deliverable_section_overrides', 'powertrain_specs', 'vehicle_configs', 'vehicle_models'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "rls_allow_authenticated" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "rls_allow_authenticated" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;
