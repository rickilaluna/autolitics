/**
 * Vehicle catalog UI — single import surface for pickers and future upgrades.
 *
 * - **VehicleAutocomplete** — model-level suggestions from static JSON (worksheets, calculators, client tools).
 * - **VehicleConfigCombobox** — config-level (make + model + MY + config_label) from Supabase profile view; use for admin shortlists & comparisons.
 *
 * Data access: use `vehicleCatalogApi` / `useVehicleConfigCatalog` / `useVehicleModelsCatalog` only; do not duplicate `.from('vehicle_models')` pagination in pages.
 */

export { default as VehicleAutocomplete } from '../VehicleAutocomplete';
export { default as VehicleConfigCombobox } from '../admin/VehicleConfigCombobox';
