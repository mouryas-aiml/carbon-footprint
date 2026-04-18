// ─── ResultsDashboard.js ─────────────────────────────────────────
// Main results view: CO₂ total, breakdown charts, recommendations, PDF export.
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoughnutChart, BarChart } from './EmissionChart';
import ProgressMeter from './ProgressMeter';
import RecommendationCard from './RecommendationCard';
import { useApi } from '../hooks/useApi';
import { getRating } from '../utils/formatters';

const TABS = ['Overview', 'Breakdown', 'Recommendations'];

function AnimatedNumber({ value }) {
  const [displayed, setDisplayed] = useState(0);
  React.useEffect(() => {
    let start = 0;
    const target = Number(value);
    const step = target / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplayed(target); clearInterval(timer); }
      else setDisplayed(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{displayed.toLocaleString()}</>;
}

export default function ResultsDashboard({ result, onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [recommendations, setRecs] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const dashboardRef = useRef(null);

  const { call } = useApi();

  const isPersonal = result.type === 'personal';
  const rating = getRating(result.total_co2_annual);

  // ── Generate AI Recommendations ──────────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    if (!isPersonal || recommendations) return;
    setLoadingRecs(true);
    try {
      const data = await call('/api/recommend', 'POST', result.inputs);
      setRecs(data);
      setActiveTab('Recommendations');
    } catch { }
    finally { setLoadingRecs(false); }
  }, [call, isPersonal, recommendations, result.inputs]);

  // ── PDF Export ─────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      // Dynamic imports to keep main bundle lighter
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#0a0f1e',
        scale: 1.5,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;

      // Header
      pdf.setFillColor(10, 15, 30);
      pdf.rect(0, 0, w, 20, 'F');
      pdf.setTextColor(16, 185, 129);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CarbonSense – Carbon Footprint Report', 14, 13);
      pdf.setTextColor(156, 163, 175);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, w - 14, 13, { align: 'right' });

      // Dashboard screenshot
      if (h > pdf.internal.pageSize.getHeight() - 25) {
        // Multi-page
        const pageH = pdf.internal.pageSize.getHeight() - 25;
        let remaining = h;
        let first = true;

        while (remaining > 0) {
          if (!first) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, first ? 22 : 5, w, h, undefined, 'FAST');
          remaining -= pageH;
          first = false;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 22, w, h, undefined, 'FAST');
      }

      pdf.save(`CarbonSense_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('PDF error:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="section" style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 32 }}>
          <button className="btn-ghost" onClick={onBack} id="results-back-btn">
            ← Back to{' '}
            {result.type === 'personal' ? 'Personal Analyzer' : 'Campus Tracker'}
          </button>
        </motion.div>

        <div ref={dashboardRef}>
          {/* ── Hero result card ── */}
          <motion.div
            className="glass-card"
            style={{
              padding: '40px 48px', marginBottom: 28, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.06) 100%)',
              borderColor: 'rgba(16,185,129,0.2)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
              <span className="section-tag" style={{ margin: 0 }}>
                {result.type === 'personal' ? '🧑 PERSONAL RESULTS' : '🏫 CAMPUS RESULTS'}
              </span>
            </div>

            <div className="result-number">
              <AnimatedNumber value={result.total_co2_monthly.toFixed(0)} />
            </div>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 20, marginTop: 4 }}>
              kg CO₂ per month
            </div>

            {/* Rating badge */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <span className={`badge ${rating.badgeClass}`} style={{ fontSize: '0.85rem', padding: '6px 18px' }}>
                {rating.emoji} {rating.label}
              </span>
              <span className="badge badge-blue">
                {result.total_co2_annual.toLocaleString()} kg/year
              </span>
              {result.per_person_co2 && (
                <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                  {result.per_person_co2.toFixed(1)} kg/person
                </span>
              )}
            </div>

            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', fontSize: '0.9rem' }}>
              {rating.description}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
              {isPersonal && (
                <button
                  className="btn-primary"
                  onClick={() => { fetchRecommendations(); setActiveTab('Recommendations'); }}
                  disabled={loadingRecs}
                  id="results-ai-recs-btn"
                >
                  {loadingRecs ? '⏳ Generating…' : '🤖 Get AI Recommendations →'}
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                id="results-pdf-btn"
              >
                {pdfLoading ? '⏳ Generating PDF…' : '📄 Download PDF Report'}
              </button>
            </div>
          </motion.div>

          {/* ── Tabs ── */}
          <div className="tab-group" style={{ marginBottom: 24 }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Recommendations' && !recommendations) fetchRecommendations();
                }}
                id={`tab-${tab.toLowerCase().replace(' ', '-')}`}
              >
                {tab}
                {tab === 'Recommendations' && recommendations && (
                  <span style={{ marginLeft: 6, padding: '1px 7px', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', fontSize: '0.7rem' }}>
                    {recommendations.recommendations.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">
            {activeTab === 'Overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
              >
                {/* Progress meter */}
                <div className="glass-card" style={{ padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 28 }}>
                    vs. Global Average
                  </h3>
                  <ProgressMeter monthlyKg={result.total_co2_monthly} size={200} />
                </div>

                {/* Key stats */}
                <div className="glass-card" style={{ padding: 32 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 }}>
                    Emissions Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'Monthly CO₂', value: `${result.total_co2_monthly.toFixed(1)} kg`, color: 'var(--green-400)' },
                      { label: 'Annual CO₂', value: `${result.total_co2_annual.toFixed(0)} kg`, color: 'var(--blue-400)' },
                      { label: 'Rating', value: `${rating.emoji} ${rating.label}`, color: rating.color },
                      { label: 'Global Avg', value: '333 kg/month', color: 'var(--text-muted)' },
                      ...(result.num_people ? [{ label: 'People covered', value: result.num_people.toLocaleString(), color: '#a78bfa' }] : []),
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Top category */}
                  {result.breakdown && (
                    <div style={{ marginTop: 20, padding: 14, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Largest emission source</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green-400)' }}>
                        {(() => {
                          const bd = result.breakdown;
                          const top = Object.entries(bd).sort((a, b) => b[1] - a[1])[0];
                          const icons = { transport: '🚗', electricity: '⚡', diet: '🥗', waste: '🗑️', flights: '✈️' };
                          return `${icons[top[0]] || ''} ${top[0].charAt(0).toUpperCase() + top[0].slice(1)} (${top[1].toFixed(1)} kg)`;
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'Breakdown' && (
              <motion.div
                key="breakdown"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}
              >
                {/* Doughnut */}
                <div className="glass-card" style={{ padding: 32 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>
                    Emission Distribution
                  </h3>
                  <DoughnutChart breakdown={result.breakdown} />
                </div>

                {/* Bar */}
                <div className="glass-card" style={{ padding: 32 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>
                    Category Comparison
                  </h3>
                  <BarChart breakdown={result.breakdown} />

                  {/* Table */}
                  <div style={{ marginTop: 20 }}>
                    {Object.entries(result.breakdown).map(([cat, val]) => {
                      const total = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? (val / total * 100) : 0;
                      const icons = { transport: '🚗', electricity: '⚡', diet: '🥗', waste: '🗑️', flights: '✈️' };
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span style={{ width: 22, textAlign: 'center', fontSize: '0.9rem' }}>{icons[cat]}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3 }}>
                              <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                              <span>{val.toFixed(1)} kg ({pct.toFixed(0)}%)</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                              <motion.div
                                style={{ height: '100%', background: `${['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][Object.keys(result.breakdown).indexOf(cat)] || '#6b7280'}`, borderRadius: 3 }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Recommendations' && (
              <motion.div
                key="recs"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                {!isPersonal ? (
                  <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏫</div>
                    <h3 style={{ marginBottom: 8 }}>Campus recommendations coming soon</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Use the Personal Analyzer to get AI-generated lifestyle recommendations.
                    </p>
                  </div>
                ) : loadingRecs ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="shimmer" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />
                    ))}
                  </div>
                ) : recommendations ? (
                  <>
                    {/* Summary bar */}
                    <div
                      className="glass-card"
                      style={{
                        padding: '20px 28px', marginBottom: 24, display: 'flex',
                        alignItems: 'center', gap: 20, flexWrap: 'wrap',
                        borderColor: 'rgba(16,185,129,0.25)',
                        background: 'rgba(16,185,129,0.04)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Best reduction possible
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}>
                          ↓{recommendations.recommendations[0]?.reduction_pct.toFixed(0)}%
                        </div>
                      </div>
                      <div className="divider" style={{ width: 1, height: 48, margin: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Scenarios evaluated
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--blue-400)', lineHeight: 1.1 }}>
                          {recommendations.total_scenarios_evaluated}
                        </div>
                      </div>
                      <div className="divider" style={{ width: 1, height: 48, margin: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Max savings
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#a78bfa', lineHeight: 1.1 }}>
                          {recommendations.recommendations[0]?.savings_kg.toFixed(0)} kg/mo
                        </div>
                      </div>
                    </div>

                    {/* Rec cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                      {recommendations.recommendations.map((rec, i) => (
                        <RecommendationCard key={rec.id} rec={rec} index={i} />
                      ))}
                    </div>

                    {/* Before/after chart */}
                    {recommendations.recommendations.length > 0 && (
                      <div className="glass-card" style={{ padding: 32, marginTop: 24 }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>
                          Current vs. Best Scenario Comparison
                        </h3>
                        <BarChart breakdown={result.breakdown} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤖</div>
                    <h3 style={{ marginBottom: 8 }}>Ready to generate AI recommendations</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                      Our AI will evaluate 12+ lifestyle scenarios using the ML model to find your best path.
                    </p>
                    <button
                      className="btn-primary"
                      onClick={fetchRecommendations}
                      disabled={loadingRecs}
                      id="recs-generate-btn"
                    >
                      {loadingRecs ? '⏳ Analyzing scenarios…' : '🤖 Generate AI Recommendations →'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom actions */}
        <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-ghost" onClick={onBack} id="results-start-over-btn">
            ↩ Start Over
          </button>
          <button className="btn-ghost" onClick={() => onNavigate('home')} id="results-home-btn">
            🏠 Home
          </button>
          {result.type === 'personal' && (
            <button className="btn-ghost" onClick={() => onNavigate('campus')} id="results-try-campus-btn">
              🏫 Try Campus Tracker
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
