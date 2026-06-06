"""
CarbonSense – ML Model Training Script
Trains a Random Forest Regressor to predict monthly carbon emissions.
Run: python backend/model/train_model.py
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# ─── Paths ────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH   = os.path.join(BASE_DIR, 'data', 'carbon_dataset.csv')
MODEL_PATH  = os.path.join(BASE_DIR, 'model', 'carbon_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'model', 'scaler.pkl')
ENCODER_PATH = os.path.join(BASE_DIR, 'model', 'encoders.pkl')

# ─── Feature columns used for training ───────────────────────────
FEATURE_COLS = [
    'transport_type_enc',
    'distance_km',
    'electricity_kwh',
    'diet_type_enc',
    'waste_kg',
    'flights_per_year',
]
TARGET_COL = 'total_co2_kg'


def load_and_preprocess(path: str):
    """Load dataset, encode categoricals, and return features + target."""
    df = pd.read_csv(path)
    print(f"[*] Dataset loaded: {len(df)} rows")

    # Encode categorical columns
    le_transport = LabelEncoder()
    le_diet      = LabelEncoder()

    df['transport_type_enc'] = le_transport.fit_transform(df['transport_type'])
    df['diet_type_enc']      = le_diet.fit_transform(df['diet_type'])

    X = df[FEATURE_COLS].values
    y = df[TARGET_COL].values

    encoders = {
        'transport': le_transport,
        'diet':      le_diet,
    }
    return X, y, encoders


def train():
    # ── 1. Load data ────────────────────────────────────────────────
    X, y, encoders = load_and_preprocess(DATA_PATH)

    # ── 2. Train/test split ──────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # ── 3. Scale features ────────────────────────────────────────────
    scaler  = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test  = scaler.transform(X_test)

    # ── 4. Train Random Forest ───────────────────────────────────────
    print("\n🌲 Training Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=20,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # ── 5. Evaluate ──────────────────────────────────────────────────
    y_pred = model.predict(X_test)
    r2  = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print(f"\n✅ Model Evaluation Results:")
    print(f"   R²   : {r2:.4f}")
    print(f"   MAE  : {mae:.2f} kg CO₂")
    print(f"   RMSE : {rmse:.2f} kg CO₂")

    # Feature importances
    importance = sorted(
        zip(FEATURE_COLS, model.feature_importances_),
        key=lambda x: x[1], reverse=True
    )
    print("\n📌 Feature Importances:")
    for feat, imp in importance:
        bar = '█' * int(imp * 40)
        print(f"   {feat:<25} {imp:.4f}  {bar}")

    # ── 6. Save artifacts ────────────────────────────────────────────
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model,    MODEL_PATH)
    joblib.dump(scaler,   SCALER_PATH)
    joblib.dump(encoders, ENCODER_PATH)

    print(f"\n💾 Saved:")
    print(f"   Model  → {MODEL_PATH}")
    print(f"   Scaler → {SCALER_PATH}")
    print(f"   Encoders → {ENCODER_PATH}")

    return model, scaler, encoders


if __name__ == '__main__':
    train()
