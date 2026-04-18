// ─── ProgressMeter.js ────────────────────────────────────────────
// SVG circular progress ring showing CO₂ vs global average.
import React, { useEffect, useState } from 'react';

const GLOBAL_AVG_MONTHLY = 333; // 4000 kg/year ÷ 12

function getColor(monthly) {
  if (monthly < 167)  return '#10b981'; // green  (<2000/yr)
  if (monthly < 333)  return '#3b82f6'; // blue   (2000-4000/yr)
  if (monthly < 583)  return '#f59e0b'; // yellow (4000-7000/yr)
  return '#ef4444';                     // red    (>7000/yr)
}

export default function ProgressMeter({ monthlyKg, size = 200 }) {
  const [animated, setAnimated] = useState(0);

  const radius      = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct         = Math.min(monthlyKg / (GLOBAL_AVG_MONTHLY * 2), 1); // cap at 200% for display
  const offset      = circumference - (animated * circumference);
  const color       = getColor(monthlyKg);
  const ratio       = ((monthlyKg / GLOBAL_AVG_MONTHLY) * 100).toFixed(0);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setAnimated(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`Carbon footprint: ${monthlyKg.toFixed(1)} kg CO₂ per month`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={12}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease' }}
        />
      </svg>

      {/* Center label (absolutely positioned overlay) */}
      <div style={{ marginTop: -size - 12, height: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>
          {monthlyKg.toFixed(0)}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>kg CO₂/mo</div>
      </div>

      {/* Comparison text */}
      <div style={{ textAlign: 'center', marginTop: size + 12 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          You are at <strong style={{ color }}>{ratio}%</strong> of the global average
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Global avg: {GLOBAL_AVG_MONTHLY} kg CO₂/month
        </div>
      </div>
    </div>
  );
}
