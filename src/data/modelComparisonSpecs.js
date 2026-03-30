/**
 * Spec definitions for Model Comparison Tool.
 * Each entry: key (data field), label (display), group, and for numeric: higherIsBetter (true/false).
 * Omit higherIsBetter for text/categorical (no color coding).
 */
export const SPEC_GROUPS = [
    { id: 'price', label: 'Price' },
    { id: 'powertrain', label: 'Powertrain' },
    { id: 'efficiency', label: 'Efficiency / Range' },
    { id: 'dimensions', label: 'Dimensions' },
    { id: 'safety', label: 'Safety' },
    { id: 'ratings', label: 'Ratings' },
];

export const SPEC_FIELDS = [
    { key: 'base_msrp', label: 'Base MSRP', group: 'price', higherIsBetter: false, format: 'currency' },
    { key: 'top_trim_msrp', label: 'Top Trim MSRP', group: 'price', higherIsBetter: false, format: 'currency' },
    { key: 'powertrain_category', label: 'Powertrain', group: 'powertrain' },
    { key: 'drivetrain', label: 'Drivetrain', group: 'powertrain' },
    { key: 'engine_description', label: 'Engine', group: 'powertrain' },
    { key: 'horsepower_hp', label: 'Horsepower (hp)', group: 'powertrain', higherIsBetter: true },
    { key: 'torque_lb_ft', label: 'Torque (lb‑ft)', group: 'powertrain', higherIsBetter: true },
    { key: 'transmission', label: 'Transmission', group: 'powertrain' },
    { key: 'combined_mpg', label: 'Combined MPG', group: 'efficiency', higherIsBetter: true },
    { key: 'city_mpg', label: 'City MPG', group: 'efficiency', higherIsBetter: true },
    { key: 'highway_mpg', label: 'Highway MPG', group: 'efficiency', higherIsBetter: true },
    { key: 'ev_range_miles', label: 'EV Range (mi)', group: 'efficiency', higherIsBetter: true },
    { key: 'zero_to_sixty_sec', label: '0–60 mph (sec)', group: 'powertrain', higherIsBetter: false },
    { key: 'towing_capacity_lbs', label: 'Towing (lbs)', group: 'dimensions', higherIsBetter: true },
    { key: 'length_in', label: 'Length (in.)', group: 'dimensions', higherIsBetter: false },
    { key: 'width_in', label: 'Width (in.)', group: 'dimensions' },
    { key: 'height_in', label: 'Height (in.)', group: 'dimensions' },
    { key: 'wheelbase_in', label: 'Wheelbase (in.)', group: 'dimensions' },
    { key: 'curb_weight_lbs', label: 'Curb Weight (lbs)', group: 'dimensions', higherIsBetter: false },
    { key: 'legroom_2nd_row_in', label: '2nd Row Legroom (in.)', group: 'dimensions', higherIsBetter: true },
    { key: 'legroom_3rd_row_in', label: '3rd Row Legroom (in.)', group: 'dimensions', higherIsBetter: true },
    { key: 'cargo_behind_2nd_cu_ft', label: 'Cargo Behind 2nd (cu ft)', group: 'dimensions', higherIsBetter: true },
    { key: 'cargo_behind_3rd_cu_ft', label: 'Cargo Behind 3rd (cu ft)', group: 'dimensions', higherIsBetter: true },
    { key: 'max_cargo_cu_ft', label: 'Max Cargo (cu ft)', group: 'dimensions', higherIsBetter: true },
    { key: 'trunk_volume_cu_ft', label: 'Trunk (cu ft)', group: 'dimensions', higherIsBetter: true },
    { key: 'ground_clearance_in', label: 'Ground Clearance (in.)', group: 'dimensions', higherIsBetter: true },
    { key: 'nhtsa_overall_stars', label: 'NHTSA Overall', group: 'safety', higherIsBetter: true },
    { key: 'iihs_tsp_status', label: 'IIHS TSP', group: 'safety' },
    { key: 'edmunds_rating', label: 'Edmunds Rating', group: 'ratings', higherIsBetter: true },
    { key: 'car_and_driver_rating', label: 'Car and Driver', group: 'ratings', higherIsBetter: true },
];

function formatValue(value, format) {
    if (value == null || value === '') return '—';
    if (format === 'currency') {
        const n = Number(value);
        if (Number.isNaN(n)) return String(value);
        if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
        return `$${n}`;
    }
    return String(value);
}

export function getSpecDisplayValue(data, field) {
    const raw = data[field.key];
    return formatValue(raw, field.format);
}

export function compareNumericValues(values, higherIsBetter) {
    const parsed = values.map((v, i) => ({ i, v: v != null && v !== '' ? Number(v) : NaN }));
    const valid = parsed.filter(({ v }) => !Number.isNaN(v));
    if (valid.length === 0) return values.map(() => 'default');
    const sorted = [...valid].sort((a, b) => (higherIsBetter ? b.v - a.v : a.v - b.v));
    const best = sorted[0].v;
    const worst = sorted[sorted.length - 1].v;
    return values.map((v, i) => {
        const num = parsed[i].v;
        if (Number.isNaN(num)) return 'default';
        if (num === best) return 'best';
        if (num === worst) return 'worst';
        return 'mid';
    });
}
