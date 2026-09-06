import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../MeshMotion.css';

// Official registered hospital nodes allowed in the National Grid
const authorizedNodes = [
  {
    id: 'HOSP-DEL-001',
    email: 'bloodbank@aiims.edu',
    password: 'node@password123',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    sector: 'Ansari Nagar, New Delhi',
    inventory: { 'A+': 45, 'A-': 6, 'B+': 52, 'B-': 4, 'AB+': 14, 'AB-': 2, 'O+': 68, 'O-': 5, 'Platelets': 22, 'Plasma': 35 }
  },
  {
    id: 'HOSP-DEL-002',
    email: 'bloodbank@safdarjung.gov.in',
    password: 'node@password123',
    name: 'Safdarjung Hospital & VMMC',
    sector: 'Ring Road, New Delhi',
    inventory: { 'A+': 28, 'A-': 3, 'B+': 34, 'B-': 1, 'AB+': 8, 'AB-': 0, 'O+': 40, 'O-': 2, 'Platelets': 10, 'Plasma': 18 }
  },
  {
    id: 'HOSP-DEL-003',
    email: 'transfusion@maxhealthcare.com',
    password: 'node@password123',
    name: 'Max Super Speciality Hospital (Saket)',
    sector: 'Saket Phase 1, New Delhi',
    inventory: { 'A+': 32, 'A-': 8, 'B+': 29, 'B-': 7, 'AB+': 12, 'AB-': 4, 'O+': 50, 'O-': 6, 'Platelets': 30, 'Plasma': 25 }
  },
  {
    id: 'HOSP-DEL-004',
    email: 'bloodunit@fortishealthcare.com',
    password: 'node@password123',
    name: 'Fortis Escorts Heart Institute',
    sector: 'Okhla Road, New Delhi',
    inventory: { 'A+': 18, 'A-': 2, 'B+': 20, 'B-': 3, 'AB+': 5, 'AB-': 1, 'O+': 22, 'O-': 3, 'Platelets': 8, 'Plasma': 12 }
  },
  {
    id: 'HOSP-DEL-005',
    email: 'transfusion@apollohospitalsdelhi.com',
    password: 'node@password123',
    name: 'Indraprastha Apollo Hospitals',
    sector: 'Sarita Vihar, New Delhi',
    inventory: { 'A+': 55, 'A-': 12, 'B+': 60, 'B-': 9, 'AB+': 20, 'AB-': 6, 'O+': 75, 'O-': 10, 'Platelets': 40, 'Plasma': 45 }
  }
];

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      // 1. First attempt verification against backend server
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: cleanPass }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('hospital_token', data.token);
        localStorage.setItem('hospital_info', JSON.stringify(data.hospital));
        navigate('/dashboard');
        return;
      }

      const errorData = await response.json();
      throw new Error(errorData.message || 'Unauthorized Node Credentials');
    } catch (err) {
      // 2. Strict verification check: only authentic hospital nodes are permitted
      const matchedNode = authorizedNodes.find(
        (node) =>
          (node.id.toLowerCase() === cleanId || node.email.toLowerCase() === cleanId) &&
          node.password === cleanPass
      );

      if (matchedNode) {
        // Legitimate hospital node authenticated
        localStorage.setItem('hospital_token', 'offline-simulated-token');
        localStorage.setItem(
          'hospital_info',
          JSON.stringify({
            id: matchedNode.id,
            hospitalId: matchedNode.id,
            name: matchedNode.name,
            city: matchedNode.sector,
            inventory: matchedNode.inventory,
          })
        );
        navigate('/dashboard');
      } else {
        // Any unauthorized email/password throws explicit rejection error
        setErrorMessage('Access Denied: Invalid Node Credentials or Unauthorized Access.');
      }
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (id, pass) => {
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="login-page">
      <div className="login-shell reveal">
        <div style={{ marginBottom: '18px' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#536479', textDecoration: 'none', fontWeight: 700 }}>
            ← Back to Public Grid
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '46px',
              height: '46px',
              background: '#fee2e2',
              color: '#c81e3a',
              borderRadius: '10px',
              fontSize: '20px',
              marginBottom: '10px',
            }}
          >
            🔒
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0b3954', letterSpacing: '-0.3px' }}>
            Hospital Node Portal
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Authorized Medical Transfusion Units & Blood Banks Only
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            style={{
              background: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              borderRadius: '6px',
              padding: '10px 14px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
              Hospital ID or Registered Email
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HOSP-DEL-001 or bloodbank@aiims.edu"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
              Node Security Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-main"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating Node...' : 'Access Hospital Network'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #edf2f7' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Authorized Grid Hubs (Click to populate)
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => autofillDemo('HOSP-DEL-001', 'node@password123')}
              className="chip"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              AIIMS Node
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('HOSP-DEL-002', 'node@password123')}
              className="chip"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Safdarjung Node
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('HOSP-DEL-005', 'node@password123')}
              className="chip"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Apollo Node
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}