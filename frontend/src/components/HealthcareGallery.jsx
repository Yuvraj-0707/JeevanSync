import React, { useState, useEffect } from 'react';

export const slides = [
  {
    title: 'Reciprocal Inter-Hospital Unit Barter Terminal',
    subtitle: 'Institutional Exchange Gateway — Balanced Reserve Preservation',
    description: 'Enables authorized hospital blood banks to conduct automated unit-for-unit swaps during acute shortages. Facilities receive critical emergency groups (e.g. O- / Platelets) by offering surplus stock (e.g. A+ / B+) in replacement without depleting either facility.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=85',
    tag: 'Reciprocal Swap Engine',
    badge: 'Zero-Depletion Barter',
    statLabel: 'Transaction Protocol',
    statValue: 'Two-Way Atomic Commit',
    facilityType: 'P2P Hospital Exchange Terminal'
  },
  {
    title: 'Clinical Medical Pre-Triage & Recovery Locks',
    subtitle: 'Voluntary Citizen Intake — Statutory Compliance Engine',
    description: 'Automated pre-screening verifying statutory donor parameters including age (18–65), minimum weight (45 kg), and chronic condition interlocks. Enforces an automated 90-day biological erythrocyte recovery lock before scheduling repeat donations.',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1600&q=85',
    tag: 'Biological Safety Triage',
    badge: 'NACO & NBTC Compliant',
    statLabel: 'Recovery Window',
    statValue: '90-Day Auto-Lock',
    facilityType: 'Donor Safety & Intake Desk'
  },
  {
    title: 'Cluster-Wide Emergency Deficit Distress Beacons',
    subtitle: 'High-Priority Trauma Allocation — Metro Network Broadcast',
    description: 'Instant distress beacons emitted across linked hospital nodes when critical trauma units drop to deficit levels (<= 5 units). Partner nodes receive urgent resupply manifests with single-click fulfillment to guarantee golden-hour transfusion survival.',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=85',
    tag: 'Trauma Distress Beacon',
    badge: 'Sub-Minute Sourcing',
    statLabel: 'Transit Latency',
    statValue: '< 180s Cluster Sourcing',
    facilityType: 'Emergency Rebalance Dispatcher'
  },
  {
    title: 'Universal Blood Donor ID & Verified Digital E-Pass',
    subtitle: 'National Transfusion Registry — NDR-XXXX-XXXX Indexing',
    description: 'Generates permanent, unique Universal Blood Donor IDs recognizing individual donors across all participating government and private hospital nodes. Incorporates masked government ID protection and instantly credits +1 unit to hospital bank inventory upon donation.',
    image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1600&q=85',
    tag: 'Universal Identity Grid',
    badge: 'Cross-Hospital Recognition',
    statLabel: 'Registry Key',
    statValue: 'Universal NDR Code',
    facilityType: 'Digital Identity & E-Pass Desk'
  }
];

export default function HealthcareGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="section-wrap" style={{ marginTop: '40px', marginBottom: '40px' }}>
      <div className="panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        {/* Top Header Bar */}
        <div style={{
          background: '#0b3954',
          color: '#ffffff',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #c81e3a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#c81e3a', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '3px', textTransform: 'uppercase' }}>
              Service Capabilities
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px' }}>
              e-RAKTKOSH MESH • INTEGRATED PLATFORM FACILITIES & CLINICAL WORKFLOWS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
              FACILITY {currentIndex + 1} OF {slides.length}
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                fontSize: '11px',
                padding: '2px 8px',
                cursor: 'pointer'
              }}
            >
              {isPaused ? '▶ Play' : '⏸ Pause'}
            </button>
          </div>
        </div>

        {/* Hero Slider Viewport */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ position: 'relative', width: '100%', height: '420px', overflow: 'hidden', background: '#0f172a' }}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? 'translateX(0%)' : index < currentIndex ? 'translateX(-100%)' : 'translateX(100%)',
                  transition: 'opacity 0.75s ease-in-out, transform 0.75s cubic-bezier(0.25, 1, 0.5, 1)',
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.85) contrast(1.05)'
                  }}
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, rgba(6,32,48,0.96) 0%, rgba(6,32,48,0.85) 48%, rgba(6,32,48,0.3) 100%)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{ maxWidth: '650px', padding: '0 40px', color: '#ffffff' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {slide.tag}
                      </span>
                      <span style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#f8fafc',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '4px'
                      }}>
                        {slide.badge}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1.25', color: '#ffffff', letterSpacing: '-0.4px', marginBottom: '6px' }}>
                      {slide.title}
                    </h2>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8', marginBottom: '12px' }}>
                      {slide.subtitle}
                    </p>
                    <p style={{ fontSize: '12.5px', lineHeight: '1.65', color: '#cbd5e1', marginBottom: '20px' }}>
                      {slide.description}
                    </p>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '8px 16px',
                      borderRadius: '6px'
                    }}>
                      <div>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>
                          {slide.statLabel}
                        </div>
                        <div className="mono" style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                          {slide.statValue}
                        </div>
                      </div>
                      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }}></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}></span>
                        Verified System Capability
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={goToPrev}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              top: '50%',
              left: '16px',
              transform: 'translateY(-50%)',
              background: 'rgba(11, 57, 84, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              zIndex: 10
            }}
          >
            ❮
          </button>

          <button
            onClick={goToNext}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              background: 'rgba(11, 57, 84, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              zIndex: 10
            }}
          >
            ❯
          </button>
        </div>

        {/* Interactive Feature Cards Grid */}
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Platform Facilities & Workflows (Click to inspect)
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              4 Integrated System Modules
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '14px'
          }}>
            {slides.map((slide, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    background: '#ffffff',
                    border: isSelected ? '2px solid #c81e3a' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 14px rgba(200, 30, 58, 0.15)' : 'none',
                    transform: isSelected ? 'translateY(-2px)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: isSelected ? 'none' : 'grayscale(25%)'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: isSelected ? '#c81e3a' : '#0b3954',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      textTransform: 'uppercase'
                    }}>
                      0{idx + 1}
                    </span>
                  </div>

                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#c81e3a' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {slide.tag}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {slide.facilityType}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}