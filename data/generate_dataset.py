"""
CarbonSense – Synthetic Dataset Generator
Generates a realistic carbon footprint dataset for training the Random Forest model.
Emission factors are based on IPCC and EPA standards.
"""

import pandas as pd
import numpy as np

np.random.seed(42)
N = 3000  # number of samples

# ─── Emission Factors (kg CO₂ per unit) ───────────────────────────
TRANSPORT_EMISSIONS = {
    'car_petrol':   0.21,   # kg CO₂ per km
    'car_diesel':   0.17,
    'car_electric': 0.05,
    'motorcycle':   0.11,
    'bus':          0.04,
    'train':        0.03,
    'cycle':        0.0,
    'walking':      0.0,
}

DIET_EMISSIONS = {
    'vegan':        50,     # kg CO₂ per month
    'vegetarian':   100,
    'pescatarian':  150,
    'meat_light':   200,
    'meat_heavy':   300,
}

ELECTRICITY_FACTOR = 0.82   # kg CO₂ per kWh (India grid average)
WASTE_FACTOR       = 0.5    # kg CO₂ per kg waste
FLIGHT_FACTOR      = 255    # kg CO₂ per flight (avg domestic)

transport_types = list(TRANSPORT_EMISSIONS.keys())
diet_types      = list(DIET_EMISSIONS.keys())

def generate_sample():
    transport = np.random.choice(
        transport_types,
        p=[0.20, 0.12, 0.08, 0.10, 0.18, 0.12, 0.12, 0.08]
    )
    distance_km       = np.random.exponential(scale=25)          # daily km
    electricity_kwh   = np.random.normal(loc=150, scale=60)      # monthly kWh
    diet              = np.random.choice(diet_types, p=[0.08, 0.22, 0.10, 0.35, 0.25])
    waste_kg          = np.random.normal(loc=20, scale=8)        # monthly kg
    flights_per_year  = np.random.choice([0,1,2,3,4,6], p=[0.40,0.25,0.18,0.10,0.05,0.02])

    # Clip negatives
    distance_km     = max(0, distance_km)
    electricity_kwh = max(10, electricity_kwh)
    waste_kg        = max(1, waste_kg)

    # Calculate ground truth CO₂ (kg/month)
    transport_co2   = TRANSPORT_EMISSIONS[transport] * distance_km * 30
    electricity_co2 = electricity_kwh * ELECTRICITY_FACTOR
    diet_co2        = DIET_EMISSIONS[diet]
    waste_co2       = waste_kg * WASTE_FACTOR
    flight_co2      = (flights_per_year / 12) * FLIGHT_FACTOR

    total_co2 = transport_co2 + electricity_co2 + diet_co2 + waste_co2 + flight_co2

    # Add realistic noise (±8%)
    total_co2 *= np.random.uniform(0.92, 1.08)

    return {
        'transport_type':   transport,
        'distance_km':      round(distance_km, 2),
        'electricity_kwh':  round(electricity_kwh, 2),
        'diet_type':        diet,
        'waste_kg':         round(waste_kg, 2),
        'flights_per_year': int(flights_per_year),
        'transport_co2':    round(transport_co2, 2),
        'electricity_co2':  round(electricity_co2, 2),
        'diet_co2':         round(diet_co2, 2),
        'waste_co2':        round(waste_co2, 2),
        'flight_co2':       round(flight_co2, 2),
        'total_co2_kg':     round(total_co2, 2),
    }

if __name__ == '__main__':
    records = [generate_sample() for _ in range(N)]
    df = pd.DataFrame(records)
    output_path = 'backend/data/carbon_dataset.csv'
    df.to_csv(output_path, index=False)
    print(f"[OK] Dataset generated: {output_path}")
    print(f"   Rows: {len(df)}")
    print(f"   CO2 range: {df['total_co2_kg'].min():.1f} - {df['total_co2_kg'].max():.1f} kg/month")
    print(df.head())
