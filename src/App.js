// ─── App.js ──────────────────────────────────────────────────────
// CarbonSense – Main application component.
// Handles client-side routing via state (no page reloads).
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

import Navbar           from './components/Navbar';
import HeroSection      from './components/HeroSection';
import PersonalAnalyzer from './components/PersonalAnalyzer';
import CampusTracker    from './components/CampusTracker';
import ResultsDashboard from './components/ResultsDashboard';
import AboutPage        from './components/AboutPage';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};

export default function App() {
  // ── Navigation state ──────────────────────────────────────────
  const [view, setView] = useState('home');
  // view ∈ 'home' | 'personal' | 'campus' | 'results' | 'about'

  // ── Previous view (for Back button in results) ────────────────
  const [prevView, setPrevView] = useState('personal');

  // ── ML result data ────────────────────────────────────────────
  const [result, setResult] = useState(null);

  // ── Navigate helper ───────────────────────────────────────────
  const navigate = (to) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(to);
  };

  // ── Handle when personal/campus form submits ──────────────────
  const handleResult = (data) => {
    setResult(data);
    setPrevView(view); // remember where we came from
    navigate('results');
  };

  const handleBack = () => navigate(prevView);

  // ── Render current view ───────────────────────────────────────
  const renderView = () => {
    switch (view) {
      case 'home':
        return <HeroSection key="home" onNavigate={navigate} />;
      case 'personal':
        return <PersonalAnalyzer key="personal" onResult={handleResult} />;
      case 'campus':
        return <CampusTracker key="campus" onResult={handleResult} />;
      case 'results':
        return result ? (
          <ResultsDashboard
            key="results"
            result={result}
            onBack={handleBack}
            onNavigate={navigate}
          />
        ) : null;
      case 'about':
        return <AboutPage key="about" />;
      default:
        return <HeroSection key="home" onNavigate={navigate} />;
    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar currentView={view} onNavigate={navigate} />

      {/* Page content with transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
