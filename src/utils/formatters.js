// ─── formatters.js ───────────────────────────────────────────────
// Utility functions for data formatting and display logic.

/**
 * Format a CO₂ value with locale number formatting.
 * @param {number} kg  Monthly kg CO₂
 * @returns {string}   e.g. "1,234 kg CO₂"
 */
export function formatCO2(kg) {
  return `${Number(kg).toLocaleString('en-IN', { maximumFractionDigits: 1 })} kg CO₂`;
}

/**
 * Format a percentage reduction.
 * @param {number} pct
 * @returns {string}   e.g. "28.4%"
 */
export function formatPct(pct) {
  return `${Number(pct).toFixed(1)}%`;
}

/**
 * Get a carbon rating object based on annual CO₂ emissions.
 * @param {number} annualKg  Annual kg CO₂
 * @returns {{ label, color, emoji, description }}
 */
export function getRating(annualKg) {
  if (annualKg < 2000)
    return { label: 'Excellent', color: '#10b981', emoji: '🌿', badgeClass: 'badge-green',
             description: 'Well below global average. Keep it up!' };
  if (annualKg < 4000)
    return { label: 'Good', color: '#3b82f6', emoji: '👍', badgeClass: 'badge-blue',
             description: 'Near or below global average. Minor improvements will help.' };
  if (annualKg < 7000)
    return { label: 'Average', color: '#f59e0b', emoji: '⚡', badgeClass: 'badge-yellow',
             description: 'Above global average. Actionable changes recommended.' };
  return { label: 'High Impact', color: '#ef4444', emoji: '🔥', badgeClass: 'badge-red',
           description: 'Significantly above average. Immediate changes needed.' };
}

/**
 * Returns a chart color for a given breakdown category.
 */
export function getCategoryColor(category) {
  const colors = {
    transport:   '#10b981',
    electricity: '#3b82f6',
    diet:        '#8b5cf6',
    waste:       '#f59e0b',
    flights:     '#ef4444',
  };
  return colors[category] || '#6b7280';
}

/**
 * Human-readable category labels.
 */
export const CATEGORY_LABELS = {
  transport:   '🚗 Transport',
  electricity: '⚡ Electricity',
  diet:        '🥗 Diet',
  waste:       '🗑️ Waste',
  flights:     '✈️ Flights',
};

/**
 * Transport type options for form dropdowns.
 */
export const TRANSPORT_OPTIONS = [
  { value: 'car_petrol',   label: '🚗 Car (Petrol)'   },
  { value: 'car_diesel',   label: '🚗 Car (Diesel)'   },
  { value: 'car_electric', label: '⚡ Car (Electric)'  },
  { value: 'motorcycle',   label: '🏍️ Motorcycle'     },
  { value: 'bus',          label: '🚌 Bus'             },
  { value: 'train',        label: '🚆 Train'           },
  { value: 'cycle',        label: '🚴 Bicycle'         },
  { value: 'walking',      label: '🚶 Walking'         },
];

/**
 * Diet type options for form chips.
 */
export const DIET_OPTIONS = [
  { value: 'vegan',       label: '🌱 Vegan'        },
  { value: 'vegetarian',  label: '🥦 Vegetarian'   },
  { value: 'pescatarian', label: '🐟 Pescatarian'  },
  { value: 'meat_light',  label: '🍗 Meat (Light)' },
  { value: 'meat_heavy',  label: '🥩 Meat (Heavy)' },
];
