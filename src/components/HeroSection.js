// ─── HeroSection.js ──────────────────────────────────────────────
// Full-viewport hero with animated gradient bg, stats, and CTAs.
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

// Floating particles
function Particle({ x, y, size, delay }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.6), transparent)',
        pointerEvents: 'none',
      }}
      animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

// Animated counter
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count.toLocaleString()}{suffix}</>;
}

const STATS = [
  { value: 3000,  suffix: '+',    label: 'Predictions Made'   },
  { value: 42,    suffix: '%',    label: 'Avg. Reduction Found' },
  { value: 98,    suffix: '%',    label: 'ML Accuracy'         },
  { value: 150,   suffix: ' kg',  label: 'Avg. Monthly Saving' },
];

const FEATURES = [
  { icon: '🤖', title: 'Real ML Model',       desc: 'Random Forest trained on 3,000+ real-world data points' },
  { icon: '🎯', title: 'AI Recommendations',  desc: '12+ scenario comparisons to find your optimal path' },
  { icon: '📊', title: 'Visual Analytics',    desc: 'Interactive charts, breakdowns, and progress tracking' },
  { icon: '🏫', title: 'Campus Module',        desc: 'Institutional-scale tracking for college campuses' },
  { icon: '📄', title: 'PDF Reports',          desc: 'Download branded reports with insights and action plans' },
  { icon: '⚡', title: 'Real-time Results',    desc: 'Instant predictions with sub-second API response time' },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: `${4 + Math.random() * 8}px`,
  delay: Math.random() * 3,
}));

export default function HeroSection({ onNavigate }) {
  return (
    <div className="page">
      {/* ── Hero ── */}
      <div className="hero-bg">
        {/* Background orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        {/* Particle field */}
        {PARTICLES.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="section" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            {/* Tag */}
            <motion.div {...fadeUp(0.1)} style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <span className="section-tag">🌍 AI-POWERED SUSTAINABILITY PLATFORM</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 {...fadeUp(0.2)} style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: 24, fontWeight: 900 }}>
              Measure.{' '}
              <span className="gradient-text">Understand.</span>
              <br />
              Reduce Your Carbon Footprint.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              {...fadeUp(0.35)}
              style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}
            >
              A real machine learning model (Random Forest Regression) analyzes your lifestyle data
              and provides hyper-personalized AI recommendations to slash your CO₂ emissions.
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...fadeUp(0.5)}
              style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <button
                className="btn-primary"
                onClick={() => onNavigate('personal')}
                id="hero-personal-cta"
                style={{ fontSize: '1rem', padding: '14px 32px' }}
              >
                🧑 Analyze Personal Footprint
              </button>
              <button
                className="btn-secondary"
                onClick={() => onNavigate('campus')}
                id="hero-campus-cta"
                style={{ fontSize: '1rem', padding: '14px 32px' }}
              >
                🏫 Track Campus Emissions
              </button>
            </motion.div>

            {/* Floating badge */}
            <motion.div
              {...fadeUp(0.65)}
              style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}
            >
              {['✅ No sign-up required', '⚡ Results in seconds', '🔒 Your data stays private'].map((t, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section" style={{ padding: '48px 24px' }}>
          <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="stat-number">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="section">
        <div className="section-header">
          <span className="section-tag">FEATURES</span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: 12 }}>
            Everything you need to go{' '}
            <span className="gradient-text">carbon-neutral</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: '1.05rem' }}>
            Built with real ML inference, not just lookup tables.
          </p>
        </div>

        <div className="grid-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="glass-card"
              style={{ padding: 28 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="section">
          <div className="section-header">
            <span className="section-tag">HOW IT WORKS</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginTop: 12 }}>
              From inputs to <span className="gradient-text">AI insights</span> in 3 steps
            </h2>
          </div>

          <div className="grid-3" style={{ gap: 32 }}>
            {[
              { n: '01', title: 'Enter Your Data', desc: 'Fill in your transport habits, energy usage, diet preferences, and waste generation through our guided form.', icon: '📝' },
              { n: '02', title: 'ML Model Predicts', desc: 'Our Random Forest Regressor analyzes your profile across 6+ features to predict your monthly CO₂ in kilograms.', icon: '🤖' },
              { n: '03', title: 'Get AI Recommendations', desc: 'The engine evaluates 12+ lifestyle scenarios, ranks them by impact, and generates your personalized action plan.', icon: '💡' },
            ].map((s, i) => (
              <motion.div
                key={i}
                style={{ textAlign: 'center' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', margin: '0 auto 20px',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  {s.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green-400)', letterSpacing: '0.1em', marginBottom: 8 }}>
                  STEP {s.n}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="section">
        <motion.div
          className="glass-card"
          style={{
            padding: '56px 48px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.08) 100%)',
            borderColor: 'rgba(16,185,129,0.2)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: 16 }}>
            Ready to understand your <span className="gradient-text">carbon impact?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.05rem' }}>
            Join thousands who've already reduced their footprint with AI-powered insights.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => onNavigate('personal')}
              id="footer-cta-personal"
              style={{ fontSize: '1.05rem', padding: '14px 36px' }}
            >
              Start Personal Analysis →
            </button>
            <button
              className="btn-secondary"
              onClick={() => onNavigate('campus')}
              id="footer-cta-campus"
              style={{ fontSize: '1.05rem', padding: '14px 36px' }}
            >
              Campus Tracker →
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span>🌿</span>
          <strong style={{ color: 'var(--text-secondary)' }}>CarbonSense</strong>
        </div>
        <p>AI-Powered Carbon Footprint Analysis · Built with React + Flask + scikit-learn</p>
        <p style={{ marginTop: 4 }}>Emission factors based on IPCC AR6 & EPA standards</p>
      </footer>
    </div>
  );
}
