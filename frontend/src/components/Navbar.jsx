import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const setFontSize = (size) => {
    document.documentElement.style.setProperty('--base-font', size);
  };

  return (
    <>
      <div className="gov-masthead">
        <div className="gov-emblem-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b3954" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>GOVERNMENT OF INDIA • MINISTRY OF HEALTH & FAMILY WELFARE</span>
        </div>
        <div className="accessibility-tools">
          <span>Accessibility:</span>
          <button className="acc-btn" onClick={() => setFontSize('13px')}>A-</button>
          <button className="acc-btn" onClick={() => setFontSize('14px')}>A</button>
          <button className="acc-btn" onClick={() => setFontSize('16px')}>A+</button>
          <span style={{ margin: '0 4px', color: '#cbd5e1' }}>|</span>
          <span style={{ fontWeight: 600, color: '#0b3954', cursor: 'pointer' }}>English / हिन्दी</span>
        </div>
      </div>

      <div className="status-strip">
        <div className="pulse-pill">
          <span className="ping-dot">
            <span></span>
            <span></span>
          </span>
          <span>NATIONAL TRANSFUSION GRID STATUS: <strong style={{ color: '#22c55e' }}>ONLINE & SYNCED</strong></span>
        </div>
        <div className="mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
          ZONE: NCR-METRO-01 • LATENCY: 8ms
        </div>
      </div>

      <header className="navbar">
        <Link to="/" className="brand-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c81e3a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          e-RaktKosh <span>Mesh</span>
        </Link>
        <div className="nav-actions">
          <Link to="/" className="nav-link">Facility Directory</Link>
          <Link to="/#intake" className="nav-link">Voluntary Donor Desk</Link>
          {!isDashboard && (
            <Link to="/login" className="btn-portal">
              Hospital Node Portal
            </Link>
          )}
        </div>
      </header>
    </>
  );
}