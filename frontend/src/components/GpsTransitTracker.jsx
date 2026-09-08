import React, { useState, useEffect } from 'react';

// Coordinates for Delhi-NCR Hospital Nodes
const hospitalCoordinates = {
  'HOSP-DEL-001': { name: 'AIIMS Apex Trauma', lat: 28.5672, lng: 77.2100 },
  'HOSP-DEL-002': { name: 'Safdarjung Hospital', lat: 28.5701, lng: 77.2078 },
  'HOSP-DEL-003': { name: 'Max Super Speciality (Saket)', lat: 28.5284, lng: 77.2127 },
  'HOSP-DEL-004': { name: 'Fortis Escorts Heart Inst.', lat: 28.5604, lng: 77.2732 },
  'HOSP-DEL-005': { name: 'Apollo Hospitals (Sarita Vihar)', lat: 28.5361, lng: 77.2917 }
};

export default function GpsTransitTracker({ activeTransfer }) {
  // Simulated active transport telemetry
  const origin = hospitalCoordinates[activeTransfer?.senderId || 'HOSP-DEL-001'];
  const destination = hospitalCoordinates[activeTransfer?.recipientId || 'HOSP-DEL-002'];

  const [progress, setProgress] = useState(35); // percentage completed
  const [temperature, setTemperature] = useState(3.8); // cold-chain monitoring in °C
  const [etaMinutes, setEtaMinutes] = useState(14);

  // Simulate movement and cold-chain temperature telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 15 : prev + 5));
      setTemperature((prev) => Number((3.6 + Math.random() * 0.6).toFixed(1)));
      setEtaMinutes((prev) => (prev <= 2 ? 18 : prev - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute intermediate coordinate
  const currentLat = (origin.lat + (destination.lat - origin.lat) * (progress / 100)).toFixed(4);
  const currentLng = (origin.lng + (destination.lng - origin.lng) * (progress / 100)).toFixed(4);

  return (
    <div style={{
      background: '#0f172a',
      color: '#f8fafc',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #334155',
      marginTop: '16px'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              GPS Cold-Chain Transit Telemetry
            </span>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>
            Dispatch Transit: {origin.name} ➔ {destination.name}
          </h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Estimated Delivery</div>
          <div className="mono" style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>
            {etaMinutes} Mins Remaining
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Cold Vault Sensor</div>
          <div className="mono" style={{ fontSize: '16px', fontWeight: 800, color: temperature > 6.0 ? '#ef4444' : '#22c55e', marginTop: '2px' }}>
            {temperature}°C <span style={{ fontSize: '11px', color: '#94a3b8' }}>(2°–6°C Range)</span>
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>GPS Coordinate</div>
          <div className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', marginTop: '4px' }}>
            {currentLat}°N, {currentLng}°E
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Corridor Status</div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            Active Green Corridor
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Tamper Seal</div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>
            Cryptographically Locked
          </div>
        </div>
      </div>

      {/* Progress Transit Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
          <span>{origin.name} (Dispatched)</span>
          <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{progress}% Route Traversed</span>
          <span>{destination.name} (Receiving)</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #22c55e)', transition: 'width 0.8s ease' }}></div>
        </div>
      </div>
    </div>
  );
}