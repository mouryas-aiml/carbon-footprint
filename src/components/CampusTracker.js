// ─── CampusTracker.js ─────────────────────────────────────────────
// Campus-level carbon footprint form with aggregate inputs.
// Calls POST /api/predict/campus on submit.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { TRANSPORT_OPTIONS } from '../utils/formatters';

const DEFAULT = {
  electricity_kwh:    5000,
  num_vehicles:       200,
  avg_distance_km:    15,
  waste_kg:           800,
  num_people:         2000,
  dominant_transport: 'car_petrol',
};

function Slider({ label, id, min, max, step, value, onChange, unit, hint }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        <span className="range-value" style={{ float: 'right' }}>
          {Number(value).toLocaleString()} {unit}
        </span>
      </label>
      <input
        type="range"
        className="form-range"
        id={id}
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
        <span>{Number(min).toLocaleString()} {unit}</span>
        <span>{Number(max).toLocaleString()} {unit}</span>
      </div>
      {hint && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

export default function CampusTracker({ onResult }) {
  const [form, setForm] = useState(DEFAULT);
  const { call, loading, error } = useApi();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    try {
      const result = await call('/api/predict/campus', 'POST', form);
      onResult({ type: 'campus', inputs: form, ...result });
    } catch {}
  };

  // Estimate breakdown on the fly for preview
  const estTransport   = (0.21 * form.avg_distance_km * 30 * form.num_vehicles).toFixed(0);
  const estElectricity = (form.electricity_kwh * 0.82).toFixed(0);
  const estWaste       = (form.waste_kg * 0.5).toFixed(0);
  const estTotal       = (Number(estTransport) + Number(estElectricity) + Number(estWaste)).toLocaleString();

  return (
    <div className="page">
      <div className="section" style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48, textAlign: 'center' }}
        >
          <span className="section-tag">🏫 CAMPUS TRACKER</span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginTop: 12 }}>
            Campus-Scale Carbon <span className="gradient-text">Analytics</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 10, fontSize: '1rem' }}>
            Aggregate your institution's data for a complete emissions picture.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <motion.div
            className="glass-card"
            style={{ padding: 40 }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 style={{ fontSize: '1.2rem', marginBottom: 28 }}>📊 Campus Data Inputs</h2>

            <Slider
              label="Total Monthly Electricity Consumption"
              id="campus-electricity"
              min={500} max={50000} step={100}
              value={form.electricity_kwh}
              onChange={(v) => set('electricity_kwh', v)}
              unit="kWh"
              hint="Check your campus electricity bill. Avg college: 8,000–15,000 kWh/month."
            />

            <Slider
              label="Number of Vehicles on Campus"
              id="campus-vehicles"
              min={10} max={2000} step={10}
              value={form.num_vehicles}
              onChange={(v) => set('num_vehicles', v)}
              unit="vehicles"
              hint="Include faculty, staff, and student commuter vehicles."
            />

            <Slider
              label="Average Daily Commute Distance"
              id="campus-distance"
              min={1} max={100} step={1}
              value={form.avg_distance_km}
              onChange={(v) => set('avg_distance_km', v)}
              unit="km"
              hint="Average one-way commute distance per vehicle."
            />

            <Slider
              label="Monthly Waste Generated"
              id="campus-waste"
              min={50} max={5000} step={50}
              value={form.waste_kg}
              onChange={(v) => set('waste_kg', v)}
              unit="kg"
              hint="Total solid and organic waste from campus operations."
            />

            <Slider
              label="Number of Students & Staff"
              id="campus-people"
              min={100} max={20000} step={100}
              value={form.num_people}
              onChange={(v) => set('num_people', v)}
              unit="people"
              hint="Used to calculate per-person carbon footprint."
            />

            <div className="form-group">
              <label className="form-label">Dominant Transport Mode</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="form-select"
                  value={form.dominant_transport}
                  onChange={(e) => set('dominant_transport', e.target.value)}
                  id="campus-transport-select"
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

            {error && (
              <div style={{
                marginBottom: 16, padding: 14,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.875rem',
              }}>
                ❌ {error}
                {error.includes('fetch') && ' — Make sure the Flask backend is running on port 5000.'}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              id="campus-submit-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Calculating…
                </span>
              ) : '🏫 Calculate Campus Footprint →'}
            </button>
          </motion.div>

          {/* Live Preview Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Live estimate */}
            <div
              className="glass-card"
              style={{ padding: 24, borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-400)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                ⚡ Live Estimate
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>
                ~{estTotal}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>kg CO₂/month (estimate)</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 8 }}>
                Final ML prediction may differ. Submit to get the AI result.
              </p>

              <div className="divider" />

              {/* Category mini-bars */}
              {[
                { label: '🚗 Transport', val: Number(estTransport), color: '#10b981' },
                { label: '⚡ Electricity', val: Number(estElectricity), color: '#3b82f6' },
                { label: '🗑️ Waste', val: Number(estWaste), color: '#f59e0b' },
              ].map((cat) => {
                const total = Number(estTransport) + Number(estElectricity) + Number(estWaste);
                const pct = total > 0 ? (cat.val / total) * 100 : 0;
                return (
                  <div key={cat.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.label}</span>
                      <span style={{ color: cat.color, fontWeight: 600 }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Campus tips */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-400)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                💡 Campus Quick Wins
              </div>
              {[
                'Install solar panels on rooftops',
                'Promote cycling and carpooling',
                'Set up campus composting',
                'Switch to LED lighting campus-wide',
                'Enable smart power management',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--green-400)', flexShrink: 0, marginTop: 1 }}>✓</span>
                  {tip}
                </div>
              ))}
            </div>

            {/* Per person stat */}
            <div className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Estimated per person
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {form.num_people > 0 ? ((Number(estTransport) + Number(estElectricity) + Number(estWaste)) / form.num_people).toFixed(1) : 0}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>kg CO₂/person/month</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
