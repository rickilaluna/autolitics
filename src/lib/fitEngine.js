/**
 * Internal Fit Engine
 * Calculates alignment strings (Strong, Good, Moderate) for a given vehicle spec against a client's priorities.
 */

export function calculateFit(engagement, spec) {
    const getAlignmentStrings = (priorityLevel, evalScore) => {
        if (!evalScore) return 'Moderate'; // Fallback if no evaluation data exists

        if (priorityLevel >= 4) {
            if (evalScore >= 4) return 'Strong';
            if (evalScore === 3) return 'Good';
            return 'Moderate';
        } else if (priorityLevel === 3) {
            if (evalScore >= 4) return 'Strong';
            if (evalScore === 3) return 'Good';
            return 'Moderate';
        } else {
            // Low priority means the client doesn't care if it's bad.
            if (evalScore >= 3) return 'Strong';
            return 'Good';
        }
    };

    // 1. Efficiency Alignment
    const efficiency = getAlignmentStrings(engagement?.priority_efficiency || 3, spec?.eval_efficiency_score);

    // 2. Durability Confidence
    const durability = getAlignmentStrings(engagement?.priority_durability || 3, spec?.eval_durability_score);

    // 3. Packaging Fit / Space
    const space = getAlignmentStrings(engagement?.priority_space || 3, spec?.eval_space_score);

    // 4. Interior (Average of comfort and usability if both exist, else fallback to DI)
    const intEval = (spec?.eval_comfort_score && spec?.eval_usability_score) 
        ? Math.round((spec.eval_comfort_score + spec.eval_usability_score) / 2) 
        : spec?.eval_comfort_score || spec?.eval_adi_score;
    const interior = getAlignmentStrings(engagement?.priority_interior || 3, intEval);
    
    // 5. Risk Compatibility (Tech & New Models = Software / Tech Score)
    const risk = getAlignmentStrings(engagement?.priority_risk || 3, spec?.eval_software_technology_score);

    // 6. Budget
    // Budget uses the value index score, but penalizes heavily if the MSRP is over the client's hard budget max.
    let budgetScore = spec?.eval_value_score || 3;
    if (spec?.base_msrp && engagement?.budget_max) {
        if (spec.base_msrp > engagement.budget_max * 1.15) {
            budgetScore = 1; // Unaffordable
        } else if (spec.base_msrp > engagement.budget_max) {
            budgetScore -= 1; // Stretch
        }
    }
    const budget = getAlignmentStrings(3, budgetScore);

    return {
        efficiency,
        durability,
        space,
        budget,
        interior,
        risk
    };
}

export function generateSnapshot(engagement, client, shortlist) {
    return {
        brand: "Autolitics Studio",
        generatedAt: new Date().toISOString(),
        engagementId: engagement.id,
        strategic_rationale: engagement.notes_internal,
        client: {
            names: client.primary_contact_name || client.names,
            notes: client.household_notes,
            current_vehicles: client.current_vehicles || '',
            budget: `$${engagement.budget_min?.toLocaleString()} - $${engagement.budget_max?.toLocaleString()}`,
            priorities: {
                space: engagement.priority_space,
                efficiency: engagement.priority_efficiency,
                durability: engagement.priority_durability,
                interior: engagement.priority_interior,
                risk: engagement.priority_risk
            }
        },
        recommendations: shortlist.filter(s => s.status === 'recommended').map(s => ({
            ...s,
            fit: calculateFit(engagement, s._config || s.vehicle_specs)
        })),
        benchmarks: shortlist.filter(s => s.status === 'benchmark').map(s => ({
            ...s,
            fit: calculateFit(engagement, s._config || s.vehicle_specs)
        })),
        excluded: shortlist.filter(s => s.status === 'excluded').map(s => ({
            ...s,
            fit: calculateFit(engagement, s._config || s.vehicle_specs)
        }))
    };
}
