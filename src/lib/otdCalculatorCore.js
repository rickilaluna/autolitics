/**
 * Shared OTD math and status logic (used by OTD Calculator + Dealer Comparison).
 */

export const OTD_SAVED_QUOTES_KEY = 'autolitics_otd_saved_quotes';

export const STATES = [
    { code: 'CA', name: 'California' },
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
];

/**
 * @param {Array<{ State: string, County: string, City?: string, TaxRate: number }>} caTaxData
 */
export function resolveCalculatedCaTaxRate(caTaxData, county, city) {
    if (!county) return 8.25;
    let rateRecord;
    if (city) {
        rateRecord = caTaxData.find(
            (d) => d.State === 'California' && d.County === county && d.City === city
        );
    }
    if (!rateRecord) {
        rateRecord = caTaxData.find(
            (d) => d.State === 'California' && d.County === county && !d.City
        );
    }
    return rateRecord ? rateRecord.TaxRate : 8.25;
}

function normCityName(s) {
    if (!s) return '';
    return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

function titleCaseFromZipRaw(raw) {
    return (raw || '')
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Match ZIP city to CA tax rows, or fall back to county from Census ZCTA→county map
 * (covers cities missing from the CDTFA-style table, e.g. Beverly Hills, generic "Los Angeles").
 *
 * @param {object} opts
 * @param {string} opts.zip5
 * @param {string} opts.zipCityRaw — USPS/ZIP file city string (often ALL CAPS)
 * @param {Array<{ State: string, County: string, City?: string|null, TaxRate: number }>} opts.caTaxData
 * @param {Record<string, string>} opts.zipToCountyMap — ZIP5 → county name (matches caTaxData County)
 * @returns {{ county: string, city: string } | null}
 */
export function resolveCaLocationFromZip(opts) {
    const { zip5, zipCityRaw, caTaxData, zipToCountyMap } = opts;
    if (!zip5 || zip5.length !== 5) return null;

    const zc = titleCaseFromZipRaw(zipCityRaw);
    const n = normCityName(zc);
    if (n) {
        const exact = caTaxData.find(
            (d) => d.State === 'California' && d.City && normCityName(d.City) === n
        );
        if (exact) return { county: exact.County, city: exact.City || '' };
    }

    const county = zipToCountyMap[zip5];
    if (county) return { county, city: '' };

    return null;
}

/**
 * @param {object} input
 * @param {number} input.salePrice
 * @param {string} input.state
 * @param {string|number} [input.docFee] — empty string uses defaults
 * @param {string|number} [input.regEstimate]
 * @param {string|number} [input.taxRateOverride]
 * @param {number} input.calculatedCaTaxRate — effective CA rate when override empty
 * @param {number} input.quotedOtd — raw quoted number (already debounced in calculator if desired)
 * @param {string|number} [input.addons]
 * @param {string|number} [input.marketAdjustment]
 * @param {boolean} [input.excludeExtras]
 */
export function computeOtdResults(input) {
    const {
        salePrice,
        state,
        docFee: docFeeRaw,
        regEstimate: regRaw,
        taxRateOverride: taxOverrideRaw,
        calculatedCaTaxRate,
        quotedOtd,
        addons: addonsRaw,
        marketAdjustment: adjRaw,
        excludeExtras = false,
    } = input;

    let docFee = Number(docFeeRaw);
    if (docFeeRaw === '' || docFeeRaw === undefined || docFeeRaw === null) {
        docFee = state === 'CA' ? 85 : 0;
    }

    let regFee = Number(regRaw);
    if (regRaw === '' || regRaw === undefined || regRaw === null) {
        regFee = state === 'CA' ? salePrice * 0.0115 : 0;
    }

    let taxRate = Number(taxOverrideRaw);
    if (taxOverrideRaw === '' || taxOverrideRaw === undefined || taxOverrideRaw === null) {
        taxRate = state === 'CA' ? calculatedCaTaxRate : 0;
    }

    const calculatedTax = (salePrice + docFee) * (taxRate / 100);
    const cleanOtd = salePrice + docFee + regFee + calculatedTax;

    const rangeLow = Math.max(0, cleanOtd - 150);
    const rangeHigh = cleanOtd + 250;

    const baseQuoted = Number(quotedOtd) || 0;
    const knownAddons = Number(addonsRaw) || 0;
    const knownAdj = Number(adjRaw) || 0;
    const totalKnownExtras = knownAddons + knownAdj;

    const activeQuote = excludeExtras ? Math.max(0, baseQuoted - totalKnownExtras) : baseQuoted;
    const diff = activeQuote - cleanOtd;
    const unexplainedDiff = excludeExtras ? diff : diff - totalKnownExtras;

    const stackTotal = Math.max(cleanOtd, activeQuote);

    let status = 'CLEAN';
    let statusTitle = 'Appears Clean';
    let statusMessage =
        'This quote appears reasonably clean based on the vehicle price and expected taxes/fees.';
    let statusColor = 'text-green-400';
    let statusBg = 'bg-green-400/10';
    let statusBorder = 'border-green-400/20';

    if (diff > 1000) {
        status = 'RED_FLAG';
        statusTitle = 'Higher Than Expected';
        statusMessage =
            'This quote appears above a typical clean out-the-door total based on the vehicle price, estimated tax, and standard fees. The difference is likely driven by markup, add-ons, or elevated dealer fees.';
        statusColor = 'text-red-400';
        statusBg = 'bg-red-400/10';
        statusBorder = 'border-red-400/20';
    } else if (diff > 300) {
        status = 'HIGH';
        statusTitle = 'Slightly Elevated';
        statusMessage =
            'This quote may include elevated fees or small dealer-installed extras. Review itemization carefully.';
        statusColor = 'text-yellow-400';
        statusBg = 'bg-yellow-400/10';
        statusBorder = 'border-yellow-400/20';
    } else if (diff < -300 && activeQuote > 0) {
        status = 'UNUSUALLY_LOW';
        statusTitle = 'Unusually Low';
        statusMessage =
            'This quote is substantially lower than expected for standard fees. Verify that taxes and registration are fully included.';
        statusColor = 'text-blue-400';
        statusBg = 'bg-blue-400/10';
        statusBorder = 'border-blue-400/20';
    }

    const barItems = [
        { label: 'Vehicle', value: salePrice, color: 'bg-[#FAF8F5]', textColor: 'text-white' },
        { label: 'Tax', value: calculatedTax, color: 'bg-[#8A9DB0]', textColor: 'text-white' },
        { label: 'DMV', value: regFee, color: 'bg-[#C9A84C]', textColor: 'text-white' },
        { label: 'Doc Fee', value: docFee, color: 'bg-[#564996]', textColor: 'text-white' },
    ];
    if (diff > 0) {
        barItems.push({
            label: 'Variance',
            value: diff,
            color: 'bg-red-400',
            textColor: 'text-red-400',
            borderColor: 'border-red-400/20',
        });
    }
    const visibleBars = barItems.filter((b) => b.value > 0);

    return {
        valid: salePrice > 0 && baseQuoted > 0,
        salePrice,
        docFee,
        regFee,
        taxRate,
        calculatedTax,
        cleanOtd,
        rangeLow,
        rangeHigh,
        quoted: baseQuoted,
        activeQuote,
        diff,
        totalKnownExtras,
        unexplainedDiff,
        stackTotal,
        status,
        statusTitle,
        statusMessage,
        statusColor,
        statusBg,
        statusBorder,
        visibleBars,
    };
}
