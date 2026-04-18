// ─── AboutPage.js ────────────────────────────────────────────────
// Static about page with project info, ML model details, and tech stack.
import React from 'react';
import { motion } from 'framer-motion';



const EMISSION_FACTORS = [
  { source: 'Car (Petrol)', factor: '0.21 kg CO₂/km' },
  { source: 'Car (Diesel)', factor: '0.17 kg CO₂/km' },
  { source: 'Car (Electric)', factor: '0.05 kg CO₂/km' },
  { source: 'Bus', factor: '0.04 kg CO₂/km' },
  { source: 'Train', factor: '0.03 kg CO₂/km' },
  { source: 'Electricity', factor: '0.82 kg CO₂/kWh (India grid)' },
  { source: 'Flight', factor: '255 kg CO₂/flight (avg domestic)' },
  { source: 'Meat-Heavy Diet', factor: '300 kg CO₂/month' },
  { source: 'Vegan Diet', factor: '50 kg CO₂/month' },
];

export default function AboutPage() {
  return (
    <div className="page">
      <div className="section" style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="section-tag">ABOUT</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginTop: 12 }}>
            How <span className="gradient-text">CarbonSense</span> Works
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: '1rem', maxWidth: 600, margin: '12px auto 0' }}>
            A real machine learning application built on IPCC-aligned emission factors and scikit-learn.
          </p>
        </motion.div>

        {/* ML Model Section */}
        <motion.div
          className="glass-card"
          style={{ padding: 40, marginBottom: 24 }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 style={{ fontSize: '1.3rem', marginBottom: 20 }}>🌲 The Machine Learning Model</h2>
          <div className="grid-2" style={{ gap: 32 }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--green-400)', marginBottom: 12 }}>Algorithm: Random Forest Regressor</h3>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8, paddingLeft: 16 }}>
                <li>150 decision trees (n_estimators=150)</li>
                <li>Max depth: 20 levels</li>
                <li>Trained on 3,000 synthetic samples</li>
                <li>80/20 train-test split</li>
                <li>StandardScaler normalization</li>
                <li>LabelEncoder for categorical features</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--blue-400)', marginBottom: 12 }}>Input Features (6 total)</h3>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.8, paddingLeft: 16 }}>
                <li>Transport type (encoded)</li>
                <li>Daily distance (km)</li>
                <li>Monthly electricity (kWh)</li>
                <li>Diet type (encoded)</li>
                <li>Monthly waste (kg)</li>
                <li>Flights per year</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--green-400)' }}>Target variable:</strong> Total monthly CO₂ emissions (kg/month),
            computed from IPCC AR6 and EPA emission factors with ±8% realistic noise.
            Model typically achieves <strong style={{ color: 'var(--text-primary)' }}>R² &gt; 0.97</strong> on the test split.
          </div>
        </motion.div>

        {/* AI Recommendation Engine */}
        <motion.div
          className="glass-card"
          style={{ padding: 40, marginBottom: 24 }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>🤖 AI Recommendation Engine</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20 }}>
            The engine generates <strong style={{ color: 'var(--text-primary)' }}>12+ alternative lifestyle scenarios</strong> by
            parametrically adjusting your inputs (transport mode, distance, electricity, diet, waste, flights).
            Each scenario is independently run through the trained ML model for an emission prediction.
            Scenarios are ranked by CO₂ reduction and the top 3 are returned with human-readable action insights.
          </p>

          <div className="grid-3" style={{ gap: 16 }}>
            {[
              { label: 'Switch to EV', icon: '⚡' },
              { label: 'Use Public Transport', icon: '🚌' },
              { label: 'WFH 3 days/week', icon: '🏠' },
              { label: 'Vegetarian Diet', icon: '🥦' },
              { label: 'Reduce Electricity', icon: '💡' },
              { label: 'Avoid Flights', icon: '✈️' },
            ].map((sc) => (
              <div key={sc.label} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '1.2rem' }}>{sc.icon}</span> {sc.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emission Factors */}
        <motion.div
          className="glass-card"
          style={{ padding: 40, marginBottom: 24 }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <h2 style={{ fontSize: '1.3rem', marginBottom: 20 }}>📊 Emission Factors Used</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>
            Sources: IPCC AR6 Working Group III (2022), US EPA GHG Emission Factors Hub (2023), CEA India Grid Emission Factor (2023)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EMISSION_FACTORS.map((ef) => (
              <div key={ef.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ef.source}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--green-400)', fontFamily: 'Courier New, monospace' }}>{ef.factor}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}