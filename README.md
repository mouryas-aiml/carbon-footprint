# 🌿 CarbonSense – AI-Powered Carbon Footprint Analyzer

A production-ready, full-stack web application that uses a **trained Random Forest ML model** to predict and reduce carbon emissions for individuals and institutions.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Real ML Model** | Random Forest Regressor (R² = 0.90) trained on 3,000 synthetic samples |
| 🎯 **AI Recommendations** | Evaluates 12+ lifestyle scenarios via ML inference |
| 📊 **Interactive Charts** | Pie/bar charts for emission breakdown (Chart.js) |
| 🧑 **Personal Analyzer** | 3-step form with transport, energy, diet, and waste inputs |
| 🏫 **Campus Tracker** | Institutional-scale aggregated emissions calculator |
| 📄 **PDF Reports** | Download branded reports with emissions data |
| 🎨 **Premium UI** | Dark-mode glassmorphism, Framer Motion animations, Inter font |
| ⚡ **Real-time API** | Flask REST API with sub-second inference |

---

## 🏗️ Project Structure

```
carbon-footprint/
├── src/                          # React frontend
│   ├── components/
│   │   ├── Navbar.js             # Fixed glassmorphism navbar
│   │   ├── HeroSection.js        # Landing page with animations
│   │   ├── PersonalAnalyzer.js   # 3-step personal form
│   │   ├── CampusTracker.js      # Campus emissions form
│   │   ├── ResultsDashboard.js   # ML results + charts + recs
│   │   ├── EmissionChart.js      # Doughnut + bar charts
│   │   ├── ProgressMeter.js      # SVG circular progress ring
│   │   ├── RecommendationCard.js # AI scenario cards
│   │   └── AboutPage.js          # Tech stack + emission factors
│   ├── hooks/
│   │   └── useApi.js             # Custom API hook
│   ├── utils/
│   │   └── formatters.js         # CO₂ formatters, constants
│   ├── App.js                    # Main routing (state-based)
│   ├── App.css
│   └── index.css                 # Full design system
├── backend/
│   ├── app.py                    # Flask REST API (4 endpoints)
│   ├── model/
│   │   ├── train_model.py        # ML training script
│   │   ├── carbon_model.pkl      # Trained model (generated)
│   │   ├── scaler.pkl            # StandardScaler (generated)
│   │   └── encoders.pkl          # LabelEncoders (generated)
│   ├── data/
│   │   ├── generate_dataset.py   # Synthetic dataset generator
│   │   └── carbon_dataset.csv    # Training data (generated)
│   └── requirements.txt
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+ and pip

---

### Step 1: Install Frontend Dependencies

```bash
cd carbon-footprint
npm install
```

---

### Step 2: Install Backend Dependencies

```bash
pip install flask flask-cors scikit-learn pandas numpy joblib
```

---

### Step 3: Generate Dataset & Train the ML Model

```bash
# Generate synthetic training dataset (3,000 samples)
$env:PYTHONUTF8=1; python backend/data/generate_dataset.py

# Train the Random Forest model
$env:PYTHONUTF8=1; python backend/model/train_model.py
```

Expected output:
```
[*] Dataset loaded: 3000 rows
[*] Training Random Forest Regressor...
[OK] Model Evaluation Results:
   R2   : 0.9057
   MAE  : 31.41 kg CO2
   RMSE : 42.28 kg CO2
[OK] Saved: carbon_model.pkl, scaler.pkl, encoders.pkl
```

---

### Step 4: Start the Flask Backend

Open a terminal and run:

```bash
$env:PYTHONUTF8=1; python backend/app.py
```

The API will start at **http://localhost:5000**

Verify: http://localhost:5000/api/health → `{"status": "ok", "model_loaded": true}`

---

### Step 5: Start the React Frontend

Open a **second** terminal and run:

```bash
npm start
```

The app will open at **http://localhost:3000**

> If port 3000 is already in use: `$env:PORT=3001; npm start`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check + model status |
| `POST` | `/api/predict/personal` | Personal CO₂ prediction |
| `POST` | `/api/predict/campus` | Campus aggregated prediction |
| `POST` | `/api/recommend` | AI scenario optimization |

### Example: Personal Prediction

```bash
curl -X POST http://localhost:5000/api/predict/personal \
  -H "Content-Type: application/json" \
  -d '{
    "transport_type": "car_petrol",
    "distance_km": 20,
    "electricity_kwh": 150,
    "diet_type": "meat_light",
    "waste_kg": 20,
    "flights_per_year": 2
  }'
```

Response:
```json
{
  "total_co2_monthly": 469.5,
  "total_co2_annual": 5634.0,
  "rating": "Average",
  "breakdown": {
    "transport": 126.0,
    "electricity": 123.0,
    "diet": 200.0,
    "waste": 10.0,
    "flights": 42.5
  }
}
```

---

## 🤖 ML Model Details

| Parameter | Value |
|---|---|
| Algorithm | Random Forest Regressor |
| Trees (n_estimators) | 150 |
| Max depth | 20 |
| Training samples | 3,000 |
| Test split | 20% |
| R² Score | ~0.91 |
| MAE | ~31 kg CO₂ |
| Preprocessing | StandardScaler + LabelEncoder |

**Feature Importances:**
1. Diet type (33%)
2. Travel distance (26%)
3. Transport mode (21%)
4. Electricity usage (14%)
5. Flights (4%)
6. Waste (2%)

---

## 🌍 Emission Factors

Factors based on **IPCC AR6 (2022)**, **US EPA (2023)**, and **CEA India Grid (2023)**:

| Source | Factor |
|---|---|
| Car (Petrol) | 0.21 kg CO₂/km |
| Car (Electric) | 0.05 kg CO₂/km |
| Bus | 0.04 kg CO₂/km |
| Electricity (India) | 0.82 kg CO₂/kWh |
| Domestic flight | 255 kg CO₂/flight |
| Vegan diet | 50 kg CO₂/month |
| Meat-heavy diet | 300 kg CO₂/month |

---

## 🛠️ Tech Stack

**Frontend**: React.js + Framer Motion + Chart.js + jsPDF + html2canvas

**Backend**: Python Flask + scikit-learn + Pandas + NumPy + joblib

**ML**: Random Forest Regressor with StandardScaler + LabelEncoder

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.
