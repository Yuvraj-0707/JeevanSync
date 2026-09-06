import React, { useState, useEffect } from 'react';
import '../MeshMotion.css';
import HealthcareGallery from '../components/HealthcareGallery';

const targetHospitals = [
  { id: 'HOSP-DEL-001', name: 'All India Institute of Medical Sciences (AIIMS)', sector: 'Ansari Nagar' },
  { id: 'HOSP-DEL-002', name: 'Safdarjung Hospital & VMMC', sector: 'Ring Road' },
  { id: 'HOSP-DEL-003', name: 'Max Super Speciality Hospital', sector: 'Saket Phase 1' },
  { id: 'HOSP-DEL-004', name: 'Fortis Escorts Heart Institute', sector: 'Okhla Road' },
  { id: 'HOSP-DEL-005', name: 'Indraprastha Apollo Hospitals', sector: 'Sarita Vihar' },
];

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Form states
  const [donorName, setDonorName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [targetHospitalId, setTargetHospitalId] = useState('HOSP-DEL-001');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [lastDonatedDaysAgo, setLastDonatedDaysAgo] = useState('');
  const [hasChronicIssues, setHasChronicIssues] = useState('no');

  const [triageError, setTriageError] = useState('');
  const [donorPass, setDonorPass] = useState(null);

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaar(formatted);
  };

  const validateAndRegisterDonor = (e) => {
    e.preventDefault();
    setTriageError('');

    const cleanAadhaar = aadhaar.replace(/\s+/g, '');
    const cleanPhone = donorPhone.replace(/\D/g, '');
    const numericAge = parseInt(age, 10);
    const numericWeight = parseFloat(weight);
    const numericLastDonated = lastDonatedDaysAgo !== '' ? parseInt(lastDonatedDaysAgo, 10) : 999;

    // Aadhaar format verification
    if (cleanAadhaar.length !== 12) {
      setTriageError('Invalid Aadhaar: UIDAI number must be exactly 12 digits.');
      return;
    }
    if (/^[0-1]/.test(cleanAadhaar)) {
      setTriageError('Invalid Aadhaar: National UID cannot begin with 0 or 1.');
      return;
    }
    if (cleanPhone.length < 10) {
      setTriageError('Invalid Phone: Enter a valid 10-digit mobile number.');
      return;
    }

    // Clinical eligibility triage
    if (numericAge < 18 || numericAge > 65) {
      setTriageError('Ineligible: Voluntary donors must be between 18 and 65 years of age.');
      return;
    }
    if (numericWeight < 45) {
      setTriageError('Ineligible: Minimum weight required for whole blood collection is 45 kg.');
      return;
    }
    if (hasChronicIssues === 'yes') {
      setTriageError('Clinical Deferral: Chronic conditions require in-person physician clearance.');
      return;
    }
    if (numericLastDonated < 90) {
      const remainingDays = 90 - numericLastDonated;
      setTriageError(`Clinical Deferral: 90-day recovery active. Eligible in ${remainingDays} days.`);
      return;
    }

    // Network deduplication: check if individual is already registered across the mesh
    const existingRegistry = JSON.parse(localStorage.getItem('mesh_registered_donors') || '[]');
    const existingDonor = existingRegistry.find(
      (d) => (d.phone && d.phone === cleanPhone) || (d.name && d.name.toLowerCase() === donorName.trim().toLowerCase())
    );

    // Reuse existing Universal Donor ID or issue a new permanent NDR number
    const randomHex1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex2 = Math.floor(1000 + Math.random() * 9000);
    const uniqueDonorId = existingDonor?.donorId || `NDR-${randomHex1}-${randomHex2}`;

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-GB');
    const maskedAadhaar = `XXXX-XXXX-${cleanAadhaar.slice(-4)}`;
    const selectedHospital = targetHospitals.find((h) => h.id === targetHospitalId) || targetHospitals[0];

    const newDonorRecord = {
      donorId: uniqueDonorId,
      name: donorName.trim(),
      phone: cleanPhone,
      aadhaarMasked: maskedAadhaar,
      group: bloodGroup,
      age: numericAge,
      weight: numericWeight,
      registeredHospitalId: selectedHospital.id,
      registeredHospitalName: selectedHospital.name,
      registeredDate: todayStr,
      registeredTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      donationStatus: existingDonor?.donationStatus || 'ELIGIBLE_CLEARED',
      unitsContributed: existingDonor?.unitsContributed || 0,
      lastDonatedTimestamp: existingDonor?.lastDonatedTimestamp || null,
      history: existingDonor?.history || []
    };

    // Filter out previous version of this donor, then prepend the updated record
    const updatedRegistry = [
      newDonorRecord,
      ...existingRegistry.filter((d) => d.donorId !== uniqueDonorId && d.phone !== cleanPhone)
    ];
    localStorage.setItem('mesh_registered_donors', JSON.stringify(updatedRegistry));

    setDonorPass({
      ...newDonorRecord,
      displayTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    });

    // Reset inputs
    setDonorName('');
    setAadhaar('');
    setDonorPhone('');
    setAge('');
    setWeight('');
    setLastDonatedDaysAgo('');
    setHasChronicIssues('no');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-grid reveal">
        <div>
          <span className="hero-tag">National Transfusion & Organ Telemetry Division</span>
          <h1 className="hero-headline">
            Institutional Blood Inventory & Emergency Allocation Grid
          </h1>
          <p className="hero-sub">
            A real-time telemetry grid networking authorized hospital transfusion units. Coordinates cross-facility component transfers during trauma emergencies and authenticates voluntary donors.
          </p>
          <div className="hero-actions">
            <a href="#intake" className="btn-main">
              Voluntary Donor Desk
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
            <a href="#infrastructure" className="btn-sec">Inspect Infrastructure</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0b3954' }}>5 Nodes</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>DELHI-NCR CLUSTER</div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>Synchronized</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ACTIVE ENCRYPTION</div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#c81e3a' }}>Universal ID</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CROSS-HOSPITAL VALID</div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="monitor-card reveal-right">
          <div className="monitor-top">
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0b3954', letterSpacing: '0.4px' }}>TELEMETRY LOG STREAM</span>
            <span className="mono" style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>● LIVE PING</span>
          </div>
          <div className="monitor-body">
            <div className="pulse-item">
              <div>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Safdarjung Trauma Hub</strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Critical deficit detected: O- reserve units</div>
              </div>
              <span className="badge-state state-deficit">Deficit Alert</span>
            </div>
            <div className="pulse-item">
              <div>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>AIIMS Emergency Desk</strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Rebalance dispatch: 8 units whole blood cleared</div>
              </div>
              <span className="badge-state state-adequate">Transfer</span>
            </div>
            <div className="pulse-item">
              <div>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Apollo Sarita Vihar</strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Universal Donor Registration logged</div>
              </div>
              <span className="badge-state state-adequate">Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Gallery Showcase */}
      <div id="infrastructure">
        <HealthcareGallery />
      </div>

      {/* Citizen Voluntary Intake & Digital E-Pass */}
      <section className="section-wrap" style={{ marginTop: '0', marginBottom: '60px' }} id="intake">
        <div className="desk-grid reveal">
          <div className="desk-card donor-info-card reveal-left" style={{ background: '#0b3954', color: '#ffffff', border: 'none' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              Citizen Response Portal
            </span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>Voluntary Donor Desk</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', margin: '12px 0 20px' }}>
              Select your destination hospital and verify clinical eligibility. You will receive a permanent <strong>Universal Blood Donor ID</strong> recognized by every participating hospital in the National Grid.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#cbd5e1' }}>
              <div>💳 <strong>Unique National ID:</strong> Carry this NDR ID across all medical nodes.</div>
              <div>🏥 <strong>Direct Facility Routing:</strong> Select exactly where your unit will be credited.</div>
              <div>🔒 <strong>Confidential Data:</strong> Aadhaar numbers are masked for data privacy.</div>
            </div>
          </div>

          <div className="desk-card donor-form-card reveal-right">
            {donorPass ? (
              <div style={{ border: '2px dashed #059669', borderRadius: '8px', padding: '20px', background: '#ecfdf5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #a7f3d0', paddingBottom: '10px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#065f46', textTransform: 'uppercase' }}>
                      UNIVERSAL BLOOD DONOR DIGITAL CARD
                    </span>
                    <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#065f46' }}>{donorPass.name}</h4>
                  </div>
                  <span className="mono" style={{ background: '#059669', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 800 }}>
                    {donorPass.group}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#065f46', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    UNIQUE DONOR ID:
                    <div className="mono" style={{ fontSize: '14px', fontWeight: 800, color: '#0b3954' }}>
                      {donorPass.donorId}
                    </div>
                  </div>
                  <div>
                    ASSIGNED RECIPIENT NODE:
                    <div style={{ fontWeight: 700 }}>{donorPass.registeredHospitalName}</div>
                  </div>
                  <div>AADHAAR: <strong className="mono">{donorPass.aadhaarMasked}</strong></div>
                  <div>REGISTRATION: <strong>{donorPass.registeredDate}</strong></div>
                </div>

                <div style={{ background: '#d1fae5', padding: '8px 12px', borderRadius: '4px', fontSize: '11px', color: '#065f46', marginBottom: '16px' }}>
                  ℹ️ Present this card at <strong>{donorPass.registeredHospitalName}</strong>. Upon blood donation, the unit counter will be credited directly to their bank.
                </div>

                <button
                  onClick={() => setDonorPass(null)}
                  style={{ width: '100%', padding: '9px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  Screen Another Donor
                </button>
              </div>
            ) : (
              <form onSubmit={validateAndRegisterDonor}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0b3954', marginBottom: '14px' }}>
                  Donor Medical Triage & Node Selection
                </h4>

                {triageError && (
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, marginBottom: '14px' }}>
                    ⚠️ {triageError}
                  </div>
                )}

                {/* Target Hospital Selector */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
                    SELECT DONATION HOSPITAL (WHERE TO DONATE)
                  </label>
                  <select
                    value={targetHospitalId}
                    onChange={(e) => setTargetHospitalId(e.target.value)}
                    className="desk-input"
                    style={{ margin: 0, fontWeight: 600 }}
                  >
                    {targetHospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} — {h.sector}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>FULL LEGAL NAME</label>
                    <input
                      required
                      className="desk-input"
                      placeholder="e.g. Rahul Verma"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>12-DIGIT AADHAAR NUMBER</label>
                    <input
                      required
                      className="desk-input"
                      placeholder="XXXX XXXX XXXX"
                      value={aadhaar}
                      onChange={handleAadhaarChange}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>BLOOD GROUP</label>
                    <select className="desk-input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                      {bloodTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>CONTACT NUMBER</label>
                    <input
                      required
                      type="tel"
                      className="desk-input"
                      placeholder="+91"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Eligibility Checks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>AGE (18–65 YRS)</label>
                    <input
                      required
                      type="number"
                      min="16"
                      max="80"
                      placeholder="e.g. 24"
                      className="desk-input"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>WEIGHT (MIN 45 KG)</label>
                    <input
                      required
                      type="number"
                      min="30"
                      max="200"
                      placeholder="e.g. 62"
                      className="desk-input"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>DAYS SINCE LAST DONATION</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Leave blank if first time"
                      className="desk-input"
                      value={lastDonatedDaysAgo}
                      onChange={(e) => setLastDonatedDaysAgo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>CHRONIC ISSUES?</label>
                    <select
                      className="desk-input"
                      value={hasChronicIssues}
                      onChange={(e) => setHasChronicIssues(e.target.value)}
                    >
                      <option value="no">None (Healthy)</option>
                      <option value="yes">Yes (Under Meds)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-main" style={{ width: '100%', justifyContent: 'center' }}>
                  Verify Eligibility & Issue Universal Blood Donor ID
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}