"""
CarbonSense – Flask REST API
Provides ML-powered emission prediction and AI recommendation endpoints.

Endpoints:
  GET  /api/health
  POST /api/predict/personal
  POST /api/predict/campus
  POST /api/recommend
"""

import os
import sys
import json
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# ─── Paths ────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH   = os.path.join(BASE_DIR, 'model', 'carbon_model.pkl')
SCALER_PATH  = os.path.join(BASE_DIR, 'model', 'scaler.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, 'model', 'encoders.pkl')

# ─── Constants ────────────────────────────────────────────────────
ELECTRICITY_FACTOR = 0.82   # kg CO₂ per kWh
WASTE_FACTOR       = 0.5    # kg CO₂ per kg waste
FLIGHT_FACTOR      = 255    # kg CO₂ per flight

TRANSPORT_EMISSIONS = {
    'car_petrol':   0.21,
    'car_diesel':   0.17,
    'car_electric': 0.05,
    'motorcycle':   0.11,
    'bus':          0.04,
    'train':        0.03,
    'cycle':        0.0,
    'walking':      0.0,
}

DIET_CO2 = {
    'vegan':        50,
    'vegetarian':   100,
    'pescatarian':  150,
    'meat_light':   200,
    'meat_heavy':   300,
}

# ─── App Init ─────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ─── Load ML model artifacts ──────────────────────────────────────
_model    = None
_scaler   = None
_encoders = None

def load_model():
    global _model, _scaler, _encoders
    if not os.path.exists(MODEL_PATH):
        return False
    _model    = joblib.load(MODEL_PATH)
    _scaler   = joblib.load(SCALER_PATH)
    _encoders = joblib.load(ENCODER_PATH)
    return True

def predict_co2(transport_type, distance_km, electricity_kwh,
                diet_type, waste_kg, flights_per_year):
    """Run inference through the trained ML model."""
    # Encode categoricals
    t_enc = _encoders['transport'].transform([transport_type])[0]
    d_enc = _encoders['diet'].transform([diet_type])[0]

    features = np.array([[
        t_enc, distance_km, electricity_kwh, d_enc, waste_kg, flights_per_year
    ]], dtype=float)

    features_scaled = _scaler.transform(features)
    prediction = _model.predict(features_scaled)[0]
    return max(0.0, float(prediction))


def breakdown(transport_type, distance_km, electricity_kwh,
              diet_type, waste_kg, flights_per_year):
    """Return per-category CO₂ breakdown (for charts)."""
    transport_co2   = TRANSPORT_EMISSIONS.get(transport_type, 0.10) * distance_km * 30
    electricity_co2 = electricity_kwh * ELECTRICITY_FACTOR
    diet_co2        = DIET_CO2.get(diet_type, 150)
    waste_co2       = waste_kg * WASTE_FACTOR
    flight_co2      = (flights_per_year / 12) * FLIGHT_FACTOR
    return {
        'transport':   round(transport_co2, 2),
        'electricity': round(electricity_co2, 2),
        'diet':        round(diet_co2, 2),
        'waste':       round(waste_co2, 2),
        'flights':     round(flight_co2, 2),
    }


# ─── Routes ───────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    model_loaded = _model is not None
    return jsonify({
        'status': 'ok',
        'model_loaded': model_loaded,
        'version': '1.0.0'
    })


@app.route('/api/predict/personal', methods=['POST'])
def predict_personal():
    data = request.get_json()
    try:
        transport_type  = data['transport_type']
        distance_km     = float(data['distance_km'])
        electricity_kwh = float(data['electricity_kwh'])
        diet_type       = data['diet_type']
        waste_kg        = float(data['waste_kg'])
        flights_per_year = int(data.get('flights_per_year', 0))

        if _model is None:
            return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503

        total_co2  = predict_co2(
            transport_type, distance_km, electricity_kwh,
            diet_type, waste_kg, flights_per_year
        )
        cat_breakdown = breakdown(
            transport_type, distance_km, electricity_kwh,
            diet_type, waste_kg, flights_per_year
        )

        # Carbon rating
        annual = total_co2 * 12
        if annual < 2000:
            rating = 'Excellent'
        elif annual < 4000:
            rating = 'Good'
        elif annual < 7000:
            rating = 'Average'
        else:
            rating = 'Poor'

        return jsonify({
            'total_co2_monthly': round(total_co2, 2),
            'total_co2_annual':  round(annual, 2),
            'breakdown': cat_breakdown,
            'rating': rating,
            'global_avg_monthly': 333,  # 4000 kg / 12 months
        })

    except (KeyError, ValueError, Exception) as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict/campus', methods=['POST'])
def predict_campus():
    """
    Campus prediction aggregates across all vehicles and scales electricity.
    """
    data = request.get_json()
    try:
        electricity_kwh     = float(data['electricity_kwh'])       # total monthly
        num_vehicles        = int(data['num_vehicles'])
        avg_distance_km     = float(data['avg_distance_km'])        # per vehicle/day
        waste_kg            = float(data['waste_kg'])               # monthly
        num_people          = int(data['num_people'])
        dominant_transport  = data.get('dominant_transport', 'car_petrol')

        # Scale inputs per person for ML (use average person profile)
        electricity_per_person = electricity_kwh / max(num_people, 1)
        waste_per_person       = waste_kg / max(num_people, 1)

        per_person_co2 = predict_co2(
            dominant_transport, avg_distance_km,
            electricity_per_person, 'meat_light',
            waste_per_person, 2
        )

        total_co2 = per_person_co2 * num_people

        # Breakdown (campus scale)
        transport_co2   = TRANSPORT_EMISSIONS.get(dominant_transport, 0.10) * avg_distance_km * 30 * num_vehicles
        electricity_co2 = electricity_kwh * ELECTRICITY_FACTOR
        waste_co2       = waste_kg * WASTE_FACTOR
        diet_co2        = DIET_CO2['meat_light'] * num_people

        cat_breakdown = {
            'transport':   round(transport_co2, 2),
            'electricity': round(electricity_co2, 2),
            'diet':        round(diet_co2, 2),
            'waste':       round(waste_co2, 2),
            'flights':     0,
        }

        return jsonify({
            'total_co2_monthly': round(total_co2, 2),
            'total_co2_annual':  round(total_co2 * 12, 2),
            'per_person_co2':    round(per_person_co2, 2),
            'breakdown':         cat_breakdown,
            'num_people':        num_people,
        })

    except (KeyError, ValueError, Exception) as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/recommend', methods=['POST'])
def recommend():
    """
    AI Recommendation Engine:
    Generates alternative lifestyle scenarios, runs each through the ML model,
    ranks by emissions reduction, returns top 3 actionable insights.
    """
    data = request.get_json()
    if _model is None:
        return jsonify({'error': 'Model not loaded'}), 503

    base = {
        'transport_type':   data['transport_type'],
        'distance_km':      float(data['distance_km']),
        'electricity_kwh':  float(data['electricity_kwh']),
        'diet_type':        data['diet_type'],
        'waste_kg':         float(data['waste_kg']),
        'flights_per_year': int(data.get('flights_per_year', 0)),
    }

    base_co2 = predict_co2(**base)

    # ── Generate scenarios ──────────────────────────────────────────
    scenarios = [
        {
            'id': 'switch_electric',
            'label': 'Switch to Electric Vehicle',
            'description': 'Replace your current vehicle with an electric car',
            'params': {**base, 'transport_type': 'car_electric'},
        },
        {
            'id': 'switch_public',
            'label': 'Use Public Transport',
            'description': 'Replace personal vehicle with bus/train commute',
            'params': {**base, 'transport_type': 'bus', 'distance_km': base['distance_km'] * 0.8},
        },
        {
            'id': 'reduce_distance_50',
            'label': 'Reduce Travel Distance by 50%',
            'description': 'Work from home 3 days a week to cut commute in half',
            'params': {**base, 'distance_km': base['distance_km'] * 0.5},
        },
        {
            'id': 'reduce_distance_30',
            'label': 'Reduce Travel Distance by 30%',
            'description': 'Work from home 1-2 days a week',
            'params': {**base, 'distance_km': base['distance_km'] * 0.7},
        },
        {
            'id': 'switch_cycle',
            'label': 'Cycle or Walk for Short Trips',
            'description': 'Use cycling or walking for distances under 5 km',
            'params': {**base, 'transport_type': 'cycle', 'distance_km': max(0, base['distance_km'] - 3)},
        },
        {
            'id': 'reduce_electricity_25',
            'label': 'Cut Electricity Usage by 25%',
            'description': 'Solar panels, LED lighting, and smart appliances',
            'params': {**base, 'electricity_kwh': base['electricity_kwh'] * 0.75},
        },
        {
            'id': 'reduce_electricity_15',
            'label': 'Cut Electricity Usage by 15%',
            'description': 'Switch to LED bulbs and unplug idle appliances',
            'params': {**base, 'electricity_kwh': base['electricity_kwh'] * 0.85},
        },
        {
            'id': 'vegan_diet',
            'label': 'Switch to Vegan Diet',
            'description': 'Eliminate animal products from your diet entirely',
            'params': {**base, 'diet_type': 'vegan'},
        },
        {
            'id': 'vegetarian_diet',
            'label': 'Switch to Vegetarian Diet',
            'description': 'Eliminate meat and poultry from your meals',
            'params': {**base, 'diet_type': 'vegetarian'},
        },
        {
            'id': 'reduce_waste_50',
            'label': 'Reduce Waste by 50%',
            'description': 'Compost food waste and recycle aggressively',
            'params': {**base, 'waste_kg': base['waste_kg'] * 0.5},
        },
        {
            'id': 'no_flights',
            'label': 'Avoid Air Travel',
            'description': 'Replace flights with train/video calls where possible',
            'params': {**base, 'flights_per_year': 0},
        },
        {
            'id': 'combined_best',
            'label': 'Optimal Combined Lifestyle',
            'description': 'Electric vehicle + reduced distance + lower electricity + vegetarian diet',
            'params': {
                'transport_type':   'car_electric',
                'distance_km':      base['distance_km'] * 0.6,
                'electricity_kwh':  base['electricity_kwh'] * 0.80,
                'diet_type':        'vegetarian',
                'waste_kg':         base['waste_kg'] * 0.6,
                'flights_per_year': max(0, base['flights_per_year'] - 1),
            },
        },
    ]

    # ── Score each scenario ─────────────────────────────────────────
    results = []
    for sc in scenarios:
        try:
            sc_co2 = predict_co2(**sc['params'])
            savings = base_co2 - sc_co2
            pct     = (savings / base_co2 * 100) if base_co2 > 0 else 0

            if savings > 0.5:  # Only include if meaningful reduction
                results.append({
                    'id':          sc['id'],
                    'label':       sc['label'],
                    'description': sc['description'],
                    'current_co2': round(base_co2, 2),
                    'new_co2':     round(sc_co2, 2),
                    'savings_kg':  round(savings, 2),
                    'reduction_pct': round(pct, 1),
                    'insight': (
                        f"By {sc['description'].lower()}, you can reduce your carbon "
                        f"footprint by {pct:.0f}% ({savings:.0f} kg CO₂/month)."
                    ),
                })
        except Exception:
            continue

    # Sort by reduction %
    results.sort(key=lambda x: x['reduction_pct'], reverse=True)
    top3 = results[:3]

    return jsonify({
        'base_co2':       round(base_co2, 2),
        'recommendations': top3,
        'total_scenarios_evaluated': len(results),
    })


# ─── Start ────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("🌱 CarbonSense API starting...")
    if load_model():
        print("✅ ML model loaded successfully")
    else:
        print("⚠️  Model not found. Run: python backend/model/train_model.py")
        print("   API will start but /predict endpoints will return 503.")
    app.run(debug=True, port=5000, host='0.0.0.0')
