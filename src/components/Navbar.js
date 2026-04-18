// ─── Navbar.js ───────────────────────────────────────────────────
// Fixed top navigation bar with glassmorphism, mobile menu,
// and Framer Motion entrance animation.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { id: 'home',     label: 'Home'     },
  { id: 'personal', label: 'Personal' },
  { id: 'campus',   label: 'Campus'   },
  { id: 'about',    label: 'About'    },
];

export default function Navbar({ currentView, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (id) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Logo */}
        <div className="nav-logo" onClick={() => handleNav('home')} role="button" tabIndex={0}>
          <div className="nav-logo-icon">🌿</div>
          <span>
            Carbon<span style={{ color: 'var(--green-400)' }}>Sense</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              className={`nav-link ${currentView === link.id ? 'active' : ''}`}
              onClick={() => handleNav(link.id)}
              id={`nav-${link.id}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="nav-cta"
            onClick={() => handleNav('personal')}
            id="nav-analyze-btn"
            style={{ display: window.innerWidth < 768 ? 'none' : 'block' }}
          >
            Analyze Now →
          </button>
          <button
            className="hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="nav-hamburger"
            aria-label="Toggle menu"
          >
            <span style={{ transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ opacity: mobileOpen ? 0 : 1 }} />
            <span style={{ transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu open"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                className={`nav-link ${currentView === link.id ? 'active' : ''}`}
                onClick={() => handleNav(link.id)}
              >
                {link.label}
              </button>
            ))}
            <button
              className="btn-primary"
              onClick={() => handleNav('personal')}
              style={{ marginTop: 8, justifyContent: 'center' }}
            >
              Analyze Now →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
