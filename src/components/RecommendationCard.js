// ─── RecommendationCard.js ────────────────────────────────────────
// Animated card showing each AI-generated scenario with before/after comparison.
import React from 'react';
import { motion } from 'framer-motion';

export default function RecommendationCard({ rec, index }) {
  const beforeWidth = 100;
  const afterWidth  = Math.max(5, 100 - rec.reduction_pct);

  return (
    <motion.div
      className="rec-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4 }}
      whileHover={{ y: -3 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {/* Rank badge */}
            <span
              style={{
                width: 26, height: 26,
                borderRadius: '50%',
                background: index === 0
                  ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                  : index === 1
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #92400e, #78350f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0,
              }}
            >
              #{index + 1}
            </span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {rec.label}
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {rec.description}
          </p>
        </div>

        {/* Reduction pct bubble */}
        <div
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            textAlign: 'center',
          }}
        >
          <div style={{
            fontSize: '1.4rem', fontWeight: 900,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            lineHeight: 1,
          }}>
            ↓{rec.reduction_pct.toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>CO₂ reduction</div>
        </div>
      </div>

      {/* Before/After bars */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Before</span>
          <span style={{ color: '#f87171' }}>{rec.current_co2.toFixed(1)} kg CO₂/mo</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
          <motion.div
            style={{ height: '100%', background: 'rgba(239,68,68,0.5)', borderRadius: 4 }}
            initial={{ width: 0 }}
            animate={{ width: `${beforeWidth}%` }}
            transition={{ delay: index * 0.12 + 0.3, duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>After</span>
          <span style={{ color: '#34d399' }}>{rec.new_co2.toFixed(1)} kg CO₂/mo</span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 4 }}
            initial={{ width: 0 }}
            animate={{ width: `${afterWidth}%` }}
            transition={{ delay: index * 0.12 + 0.5, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Savings tag */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.15)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        💡 {rec.insight}
      </div>

      {/* Monthly savings badge */}
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span className="badge badge-green">
          Saves {rec.savings_kg.toFixed(0)} kg CO₂/month
        </span>
        <span className="badge badge-blue">
          {(rec.savings_kg * 12).toFixed(0)} kg/year
        </span>
      </div>
    </motion.div>
  );
}
