// ─── PersonalAnalyzer.js ─────────────────────────────────────────
// Multi-step form (3 steps) with Framer Motion slide transitions.
// Calls POST /api/predict/personal on submit.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { TRANSPORT_OPTIONS, DIET_OPTIONS } from '../utils/formatters';

const STEPS = ['Transport', 'Energy & Diet', 'Waste & Review'];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const DEFAULT_FORM = {
  transport_type:   'car_petrol',
  distance_km:      20,
  electricity_kwh:  150,
  diet_type:        'meat_light',
  waste_kg:         20,
  flights_per_year: 2,
};

export default function PersonalAnalyzer({ onResult }) {
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);
  const { call, loading, error } = useApi();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const next = () => { setDir(1); setStep((s) => s + 1); };
  const prev = () => { setDir(-1); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    try {
      const result = await call('/api/predict/personal', 'POST', form);
      onResult({ type: 'personal', inputs: form, ...result });
    } catch {}
  };

  return (
    <div className="page">
      <div className="section" style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48, textAlign: 'center' }}
        >
          <span className="section-tag">🧑 PERSONAL ANALYZER</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginTop: 12 }}>
            Your Personal Carbon <span className="gradient-text">Footprint</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 10, fontSize: '1rem' }}>
            Answer 3 quick sections — our ML model does the rest.
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="step-indicator">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  className={`step-dot ${
                    i < step ? 'done' : i === step ? 'active' : 'pending'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.7rem', color: i === step ? 'var(--green-400)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`step-line ${i < step ? 'done' : ''}`} style={{ marginBottom: 20 }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress bar */}
        <div className="progress-bar" style={{ marginBottom: 40 }}>
          <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {/* Form card */}
        <div
          className="glass-card"
          style={{ padding: '40px', overflow: 'hidden', position: 'relative', minHeight: 400 }}
        >
          <AnimatePresence custom={dir} mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                custom={dir}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h2 style={{ fontSize: '1.3rem', marginBottom: 28 }}>🚗 Transport Habits</h2>

                <div className="form-group">
                  <label className="form-label">Primary Mode of Transport</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="form-select"
                      value={form.transport_type}
                      onChange={(e) => set('transport_type', e.target.value)}
                      id="personal-transport-select"
                    >
                      {TRANSPORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <span style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', pointerEvents: 'none',
                    }}>▾</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Average Daily Travel Distance
                    <span className="range-value" style={{ float: 'right' }}>{form.distance_km} km</span>
                  </label>
                  <input
                    type="range" className="form-range"
                    min={0} max={150} step={1}
                    value={form.distance_km}
                    onChange={(e) => set('distance_km', Number(e.target.value))}
                    id="personal-distance-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                    <span>0 km</span><span>75 km</span><span>150 km</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Flights per Year
                    <span className="range-value" style={{ float: 'right' }}>{form.flights_per_year} flight{form.flights_per_year !== 1 ? 's' : ''}</span>
                  </label>
                  <input
                    type="range" className="form-range"
                    min={0} max={12} step={1}
                    value={form.flights_per_year}
                    onChange={(e) => set('flights_per_year', Number(e.target.value))}
                    id="personal-flights-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                    <span>0</span><span>6</span><span>12</span>
                  </div>
                </div>

                {/* Insight box */}
                <div style={{
                  padding: 16, borderRadius: 'var(--radius-md)',
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                  fontSize: '0.8rem', color: 'var(--text-secondary)',
                }}>
                  💡 <strong>Did you know?</strong> Switching from a petrol car to an electric vehicle can
                  reduce transport emissions by up to 75%.
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                custom={dir}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h2 style={{ fontSize: '1.3rem', marginBottom: 28 }}>⚡ Energy & Diet</h2>

                <div className="form-group">
                  <label className="form-label">
                    Monthly Electricity Consumption
                    <span className="range-value" style={{ float: 'right' }}>{form.electricity_kwh} kWh</span>
                  </label>
                  <input
                    type="range" className="form-range"
                    min={10} max={500} step={5}
                    value={form.electricity_kwh}
                    onChange={(e) => set('electricity_kwh', Number(e.target.value))}
                    id="personal-electricity-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                    <span>10 kWh</span><span>250 kWh</span><span>500 kWh</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
                    India average: ~90 kWh/month for a household. Find it on your electricity bill.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Diet Type</label>
                  <div className="chip-group">
                    {DIET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`chip ${form.diet_type === opt.value ? 'active' : ''}`}
                        onClick={() => set('diet_type', opt.value)}
                        id={`diet-${opt.value}`}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  {[
                    { label: 'Vegan', co2: '50 kg/mo', color: '#10b981' },
                    { label: 'Vegetarian', co2: '100 kg/mo', color: '#3b82f6' },
                    { label: 'Meat Heavy', co2: '300 kg/mo', color: '#ef4444' },
                  ].map((d) => (
                    <div
                      key={d.label}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: d.color, marginTop: 2 }}>{d.co2}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={dir}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h2 style={{ fontSize: '1.3rem', marginBottom: 28 }}>🗑️ Waste & Review</h2>

                <div className="form-group">
                  <label className="form-label">
                    Monthly Waste Generated
                    <span className="range-value" style={{ float: 'right' }}>{form.waste_kg} kg</span>
                  </label>
                  <input
                    type="range" className="form-range"
                    min={1} max={80} step={1}
                    value={form.waste_kg}
                    onChange={(e) => set('waste_kg', Number(e.target.value))}
                    id="personal-waste-slider"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                    <span>1 kg</span><span>40 kg</span><span>80 kg</span>
                  </div>
                </div>

                {/* Summary review */}
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 16 }}>📋 Your Profile Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { icon: '🚗', label: 'Transport', value: TRANSPORT_OPTIONS.find(o => o.value === form.transport_type)?.label },
                      { icon: '📍', label: 'Daily Distance', value: `${form.distance_km} km` },
                      { icon: '⚡', label: 'Electricity', value: `${form.electricity_kwh} kWh/mo` },
                      { icon: '🥗', label: 'Diet', value: DIET_OPTIONS.find(o => o.value === form.diet_type)?.label },
                      { icon: '🗑️', label: 'Waste', value: `${form.waste_kg} kg/mo` },
                      { icon: '✈️', label: 'Flights', value: `${form.flights_per_year}/year` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 1 }}>
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div style={{
                    marginTop: 16, padding: 14,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.875rem',
                  }}>
                    ❌ {error}
                    {error.includes('fetch') && (
                      <span> — Make sure the Flask backend is running on port 5000.</span>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button
            className="btn-ghost"
            onClick={prev}
            disabled={step === 0}
            style={{ opacity: step === 0 ? 0.4 : 1 }}
            id="personal-prev-btn"
          >
            ← Back
          </button>

          {step < STEPS.length - 1 ? (
            <button className="btn-primary" onClick={next} id="personal-next-btn">
              Continue →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              id="personal-submit-btn"
              style={{ minWidth: 180, justifyContent: 'center' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Analyzing…
                </span>
              ) : '🤖 Analyze with ML →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
