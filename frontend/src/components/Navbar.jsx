import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('hospital_token');

  return (
    <header style={{
      background: '#0b3954',
      borderBottom: '3px solid #c81e3a',
      color: '#ffffff',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1260px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: '#c81e3a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 800,
            boxShadow: '0 2px 6px rgba(200, 30, 58, 0.4)'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.3px', color: '#ffffff' }}>
              JeevanSync
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>
              National Inter-Hospital Transfusion Grid
            </div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            style={{
              color: '#f1f5f9',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '4px'
            }}
          >
            Citizen Voluntary Portal
          </Link>

          {token ? (
            <Link
              to="/dashboard"
              style={{
                background: '#c81e3a',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 800,
                padding: '8px 16px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(200, 30, 58, 0.3)'
              }}
            >
              <span>Hospital Command Cockpit</span>
              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                ACTIVE
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                background: '#ffffff',
                color: '#0b3954',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 800,
                padding: '8px 16px',
                borderRadius: '6px'
              }}
            >
              Hospital Node Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}