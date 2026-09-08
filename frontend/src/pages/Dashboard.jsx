import GpsTransitTracker from '../components/GpsTransitTracker';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MeshMotion.css';

const initialNodes = {
  'HOSP-DEL-001': {
    name: 'All India Institute of Medical Sciences (AIIMS)',
    sector: 'Ansari Nagar, New Delhi',
    inventory: { 'A+': 45, 'A-': 6, 'B+': 52, 'B-': 4, 'AB+': 14, 'AB-': 2, 'O+': 68, 'O-': 8, 'Platelets': 22, 'Plasma': 35 }
  },
  'HOSP-DEL-002': {
    name: 'Safdarjung Hospital & VMMC',
    sector: 'Ring Road, New Delhi',
    inventory: { 'A+': 28, 'A-': 3, 'B+': 34, 'B-': 1, 'AB+': 8, 'AB-': 0, 'O+': 40, 'O-': 2, 'Platelets': 10, 'Plasma': 18 }
  },
  'HOSP-DEL-003': {
    name: 'Max Super Speciality Hospital (Saket)',
    sector: 'Saket Phase 1, New Delhi',
    inventory: { 'A+': 32, 'A-': 8, 'B+': 29, 'B-': 7, 'AB+': 12, 'AB-': 4, 'O+': 50, 'O-': 6, 'Platelets': 30, 'Plasma': 25 }
  },
  'HOSP-DEL-004': {
    name: 'Fortis Escorts Heart Institute',
    sector: 'Okhla Road, New Delhi',
    inventory: { 'A+': 18, 'A-': 2, 'B+': 20, 'B-': 3, 'AB+': 5, 'AB-': 1, 'O+': 22, 'O-': 3, 'Platelets': 8, 'Plasma': 12 }
  },
  'HOSP-DEL-005': {
    name: 'Indraprastha Apollo Hospitals',
    sector: 'Sarita Vihar, New Delhi',
    inventory: { 'A+': 55, 'A-': 12, 'B+': 60, 'B-': 9, 'AB+': 20, 'AB-': 6, 'O+': 75, 'O-': 10, 'Platelets': 40, 'Plasma': 45 }
  }
};

const bloodGroupsList = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Platelets', 'Plasma'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'transparency' | 'records' | 'donors'

  const [hospitalInfo, setHospitalInfo] = useState(() => {
    try {
      const raw = localStorage.getItem('hospital_info');
      return raw ? JSON.parse(raw) : {
        id: 'HOSP-DEL-001',
        hospitalId: 'HOSP-DEL-001',
        name: initialNodes['HOSP-DEL-001'].name,
        city: initialNodes['HOSP-DEL-001'].sector
      };
    } catch {
      return {
        id: 'HOSP-DEL-001',
        hospitalId: 'HOSP-DEL-001',
        name: initialNodes['HOSP-DEL-001'].name,
        city: initialNodes['HOSP-DEL-001'].sector
      };
    }
  });

  const currentHospitalId = hospitalInfo?.hospitalId || hospitalInfo?.id || 'HOSP-DEL-001';

  const [clusterData, setClusterData] = useState(() => {
    try {
      const stored = localStorage.getItem('mesh_cluster_inventories');
      return stored ? JSON.parse(stored) : initialNodes;
    } catch {
      return initialNodes;
    }
  });

  const [networkLedger, setNetworkLedger] = useState(() => {
    try {
      const saved = localStorage.getItem('mesh_shared_ledger');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeBroadcasts, setActiveBroadcasts] = useState(() => {
    try {
      const saved = localStorage.getItem('mesh_active_shortage_broadcasts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [donors, setDonors] = useState(() => {
    try {
      const saved = localStorage.getItem('mesh_registered_donors');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((d, index) => ({
        ...d,
        donorId: d.donorId || d.passId || d.id || `NDR-REQ-${1000 + index}`
      }));
    } catch {
      return [];
    }
  });

  // Reciprocal Swap state
  const [targetPeer, setTargetPeer] = useState('HOSP-DEL-002');
  const [takeGroup, setTakeGroup] = useState('O-');
  const [takeUnits, setTakeUnits] = useState(2);
  const [giveGroup, setGiveGroup] = useState('A+');
  const [giveUnits, setGiveUnits] = useState(2);
  const [swapReason, setSwapReason] = useState('Urgent Trauma Barter Protocol');

  // Direct Donor SMS Broadcast state
  const [donorSmsNotice, setDonorSmsNotice] = useState(null);
  const [notice, setNotice] = useState({ text: '', isError: false });
  const [donorSearchQuery, setDonorSearchQuery] = useState('');
  const [donorIntakeNotice, setDonorIntakeNotice] = useState('');

  // Storage listener for cross-tab sync
  useEffect(() => {
    const handleStorageSync = (e) => {
      if (e.key === 'mesh_cluster_inventories' && e.newValue) {
        setClusterData(JSON.parse(e.newValue));
      }
      if (e.key === 'mesh_active_shortage_broadcasts' && e.newValue) {
        setActiveBroadcasts(JSON.parse(e.newValue));
      }
      if (e.key === 'mesh_shared_ledger' && e.newValue) {
        setNetworkLedger(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const activeStock = (clusterData[currentHospitalId] && clusterData[currentHospitalId].inventory)
    ? clusterData[currentHospitalId].inventory
    : initialNodes['HOSP-DEL-001'].inventory;

  const getStatus = (units) => {
    if (units <= 5) return { label: 'Deficit Alert', cls: 'state-deficit' };
    if (units <= 15) return { label: 'Low Reserve', cls: 'state-low' };
    return { label: 'Optimal', cls: 'state-adequate' };
  };

  const getRecoveryInfo = (donor) => {
    if (!donor.lastDonatedTimestamp) {
      return { inRecovery: false, daysRemaining: 0, eligibleDate: 'Immediate' };
    }
    const lastTime = new Date(donor.lastDonatedTimestamp).getTime();
    const nowTime = new Date().getTime();
    const daysPassed = Math.floor((nowTime - lastTime) / (1000 * 60 * 60 * 24));
    const recoveryTotal = 90;

    if (daysPassed < recoveryTotal) {
      const daysLeft = recoveryTotal - daysPassed;
      const eligibleDateObj = new Date(lastTime + recoveryTotal * 24 * 60 * 60 * 1000);
      return {
        inRecovery: true,
        daysRemaining: daysLeft,
        eligibleDate: eligibleDateObj.toLocaleDateString('en-GB')
      };
    }
    return { inRecovery: false, daysRemaining: 0, eligibleDate: 'Cleared for Recall' };
  };

  // Execute Reciprocal Swap
  const handleExecuteReciprocalSwap = (e) => {
    e.preventDefault();
    const takeQty = Number(takeUnits);
    const giveQty = Number(giveUnits);

    if (takeQty <= 0 || giveQty <= 0) {
      setNotice({ text: 'Units requested and units offered in exchange must both be greater than 0.', isError: true });
      return;
    }
    if (takeGroup === giveGroup) {
      setNotice({ text: 'Invalid Barter: You cannot swap the same component group with itself.', isError: true });
      return;
    }

    const myCurrentGiveStock = activeStock[giveGroup] || 0;
    if (myCurrentGiveStock < giveQty) {
      setNotice({
        text: `Insufficient Outbound Balance: You only have ${myCurrentGiveStock} units of ${giveGroup}. Cannot offer ${giveQty} units in return.`,
        isError: true
      });
      return;
    }

    const partnerNode = clusterData[targetPeer] || initialNodes[targetPeer];
    const partnerTakeStock = partnerNode.inventory[takeGroup] || 0;
    if (partnerTakeStock < takeQty) {
      setNotice({
        text: `Peer Shortage: ${partnerNode.name} only has ${partnerTakeStock} units of ${takeGroup}.`,
        isError: true
      });
      return;
    }

    const updatedCluster = {
      ...clusterData,
      [currentHospitalId]: {
        ...clusterData[currentHospitalId],
        inventory: {
          ...activeStock,
          [takeGroup]: (activeStock[takeGroup] || 0) + takeQty,
          [giveGroup]: myCurrentGiveStock - giveQty
        }
      },
      [targetPeer]: {
        ...clusterData[targetPeer],
        inventory: {
          ...partnerNode.inventory,
          [takeGroup]: partnerTakeStock - takeQty,
          [giveGroup]: (partnerNode.inventory[giveGroup] || 0) + giveQty
        }
      }
    };

    setClusterData(updatedCluster);
    localStorage.setItem('mesh_cluster_inventories', JSON.stringify(updatedCluster));

    const now = new Date();
    const manifestId = `SWAP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTransaction = {
      id: manifestId,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      senderId: currentHospitalId,
      senderName: hospitalInfo.name,
      recipientId: targetPeer,
      recipientName: partnerNode.name,
      type: 'RECIPROCAL_SWAP',
      details: `Received +${takeQty} (${takeGroup}) in exchange for Giving -${giveQty} (${giveGroup})`,
      reason: swapReason
    };

    const updatedLedger = [newTransaction, ...networkLedger];
    setNetworkLedger(updatedLedger);
    localStorage.setItem('mesh_shared_ledger', JSON.stringify(updatedLedger));

    setNotice({
      text: `✓ Reciprocal Barter Authorized [#${manifestId}]: Received ${takeQty} units of ${takeGroup} from ${partnerNode.name} & Dispatched ${giveQty} units of ${giveGroup} in return.`,
      isError: false
    });
    setTimeout(() => setNotice({ text: '', isError: false }), 9000);
  };

  // Broadcast Shortage to other hospitals
  const handleTriggerEmergencyShortage = (e) => {
    e.preventDefault();
    const form = e.target;
    const componentNeeded = form.deficitComponent.value;
    const unitsShort = Number(form.unitsNeeded.value) || 4;
    const componentOffered = form.compensationComponent.value;
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (componentNeeded === componentOffered) {
      alert('Requested deficit component cannot be identical to the component offered in exchange.');
      return;
    }

    const newBeacon = {
      broadcastId: `BCN-${Math.floor(1000 + Math.random() * 9000)}`,
      requesterId: currentHospitalId,
      requesterName: hospitalInfo.name,
      componentNeeded,
      unitsNeeded: unitsShort,
      componentOffered,
      unitsOffered: unitsShort,
      timestamp,
      status: 'ACTIVE_SWAP_REQUEST'
    };

    const updatedBeacons = [
      newBeacon,
      ...activeBroadcasts.filter(b => !(b.requesterId === currentHospitalId && b.componentNeeded === componentNeeded))
    ];

    setActiveBroadcasts(updatedBeacons);
    localStorage.setItem('mesh_active_shortage_broadcasts', JSON.stringify(updatedBeacons));

    setNotice({
      text: `🚨 Distress Barter Broadcast: Seeking ${unitsShort} units of ${componentNeeded} in exchange for ${unitsShort} units of ${componentOffered}.`,
      isError: false
    });
    setTimeout(() => setNotice({ text: '', isError: false }), 9000);
  };

  // DIRECT EMERGENCY DISPATCH TO ON-CALL DONORS VIA SMS GATEWAY
  const handleDispatchDirectDonorSms = (e) => {
    e.preventDefault();
    const form = e.target;
    const selectedGroup = form.targetBloodGroup.value;
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Filter matching donors who are eligible (not in active 90-day recovery lock)
    const matchingDonors = donors.filter(d => {
      const match = d.group === selectedGroup;
      const rec = getRecoveryInfo(d);
      return match && !rec.inRecovery;
    });

    if (matchingDonors.length === 0) {
      alert(`No eligible registered voluntary donors found for blood group ${selectedGroup} outside the 90-day recovery lock.`);
      return;
    }

    const dispatchResult = {
      timestamp,
      group: selectedGroup,
      count: matchingDonors.length,
      donorsNotified: matchingDonors.map(d => ({
        name: d.name,
        phone: d.phone,
        donorId: d.donorId
      }))
    };

    setDonorSmsNotice(dispatchResult);

    // Simulated API dispatch
    try {
      fetch('http://localhost:5000/api/notifications/dispatch-shortage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalName: hospitalInfo.name,
          component: selectedGroup,
          channel: 'DIRECT_DONOR_SMS_GATEWAY',
          recipientsCount: matchingDonors.length
        })
      }).catch(() => {});
    } catch {}

    setTimeout(() => setDonorSmsNotice(null), 12000);
  };

  const handleFulfillShortage = (beacon) => {
    const qty = Number(beacon.unitsNeeded);
    const myCurrentUnits = activeStock[beacon.componentNeeded] || 0;

    if (myCurrentUnits < qty) {
      alert(`Cannot fulfill barter: ${hospitalInfo.name} only has ${myCurrentUnits} units of ${beacon.componentNeeded}.`);
      return;
    }

    const requesterNodeId = beacon.requesterId;
    const requesterNode = clusterData[requesterNodeId] || initialNodes[requesterNodeId];
    const requesterOfferedUnits = requesterNode.inventory[beacon.componentOffered] || 0;

    if (requesterOfferedUnits < qty) {
      alert(`Barter Interlock Failed: ${beacon.requesterName} no longer has the promised ${qty} units of ${beacon.componentOffered}.`);
      return;
    }

    const updatedCluster = {
      ...clusterData,
      [currentHospitalId]: {
        ...clusterData[currentHospitalId],
        inventory: {
          ...activeStock,
          [beacon.componentNeeded]: myCurrentUnits - qty,
          [beacon.componentOffered]: (activeStock[beacon.componentOffered] || 0) + qty
        }
      },
      [requesterNodeId]: {
        ...clusterData[requesterNodeId],
        inventory: {
          ...requesterNode.inventory,
          [beacon.componentNeeded]: (requesterNode.inventory[beacon.componentNeeded] || 0) + qty,
          [beacon.componentOffered]: requesterOfferedUnits - qty
        }
      }
    };

    setClusterData(updatedCluster);
    localStorage.setItem('mesh_cluster_inventories', JSON.stringify(updatedCluster));

    const now = new Date();
    const manifestId = `SWAP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTransaction = {
      id: manifestId,
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      senderId: currentHospitalId,
      senderName: hospitalInfo.name,
      recipientId: requesterNodeId,
      recipientName: beacon.requesterName,
      type: 'RECIPROCAL_SWAP_FULFILLMENT',
      details: `Provided -${qty} (${beacon.componentNeeded}) and Received +${qty} (${beacon.componentOffered}) in exchange`,
      reason: `Distress Swap Clearance [Beacon #${beacon.broadcastId}]`
    };

    const updatedLedger = [newTransaction, ...networkLedger];
    setNetworkLedger(updatedLedger);
    localStorage.setItem('mesh_shared_ledger', JSON.stringify(updatedLedger));

    const updatedBeacons = activeBroadcasts.filter(b => b.broadcastId !== beacon.broadcastId);
    setActiveBroadcasts(updatedBeacons);
    localStorage.setItem('mesh_active_shortage_broadcasts', JSON.stringify(updatedBeacons));

    setNotice({
      text: `✓ Barter Completed [#${manifestId}]: Supplied ${qty} units of ${beacon.componentNeeded} to ${beacon.requesterName} and took ${qty} units of ${beacon.componentOffered} in return.`,
      isError: false
    });
    setTimeout(() => setNotice({ text: '', isError: false }), 9000);
  };

  const handleCancelBroadcast = (broadcastId) => {
    const updated = activeBroadcasts.filter(b => b.broadcastId !== broadcastId);
    setActiveBroadcasts(updated);
    localStorage.setItem('mesh_active_shortage_broadcasts', JSON.stringify(updated));
  };

  const handleIntakeAndCredit = (donor) => {
    const recovery = getRecoveryInfo(donor);
    if (recovery.inRecovery) {
      alert(`Clinical Deferral: Donor is under recovery lock (${recovery.daysRemaining} days left).`);
      return;
    }

    const grp = donor.group;
    const currentUnits = activeStock[grp] || 0;
    const updatedUnits = currentUnits + 1;

    const updatedCluster = {
      ...clusterData,
      [currentHospitalId]: {
        ...clusterData[currentHospitalId],
        inventory: { ...activeStock, [grp]: updatedUnits }
      }
    };
    setClusterData(updatedCluster);
    localStorage.setItem('mesh_cluster_inventories', JSON.stringify(updatedCluster));

    const nowIso = new Date().toISOString();
    const todayFormatted = new Date().toLocaleDateString('en-GB');

    const updatedDonors = donors.map((d) => {
      if (d.donorId === donor.donorId) {
        return {
          ...d,
          donationStatus: 'RECOVERY_LOCKED',
          lastDonatedTimestamp: nowIso,
          lastDonatedDate: todayFormatted,
          unitsContributed: (d.unitsContributed || 0) + 1,
          lastHospitalCredited: hospitalInfo.name
        };
      }
      return d;
    });

    setDonors(updatedDonors);
    localStorage.setItem('mesh_registered_donors', JSON.stringify(updatedDonors));

    setDonorIntakeNotice(`✓ Credited +1 Unit of ${grp} to ${hospitalInfo.name}. Donor entered 90-day recovery lock.`);
    setTimeout(() => setDonorIntakeNotice(''), 7000);
  };

  const handleSimulateRecoveryElapsed = (donorId) => {
    const ninetyOneDaysAgo = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString();
    const updatedDonors = donors.map(d => {
      if (d.donorId === donorId) {
        return {
          ...d,
          lastDonatedTimestamp: ninetyOneDaysAgo,
          donationStatus: 'RECOVERY_CLEARED'
        };
      }
      return d;
    });
    setDonors(updatedDonors);
    localStorage.setItem('mesh_registered_donors', JSON.stringify(updatedDonors));
    setDonorIntakeNotice(`⚡ Simulating 90 days elapsed: Donor ${donorId} is now cleared for recall.`);
    setTimeout(() => setDonorIntakeNotice(''), 6000);
  };

  const handleLogout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_info');
    navigate('/login');
  };

  const myHospitalRecords = networkLedger.filter(
    item => item.senderId === currentHospitalId || item.recipientId === currentHospitalId
  );

  const incomingEmergencyBeacons = activeBroadcasts.filter(b => b.requesterId !== currentHospitalId);
  const mySentEmergencyBeacons = activeBroadcasts.filter(b => b.requesterId === currentHospitalId);

  const cleanQuery = donorSearchQuery.trim().toLowerCase();
  const filteredDonors = donors.filter(d =>
    (d.name && d.name.toLowerCase().includes(cleanQuery)) ||
    (d.donorId && d.donorId.toLowerCase().includes(cleanQuery)) ||
    (d.group && d.group.toLowerCase().includes(cleanQuery))
  );

  return (
    <div style={{ maxWidth: '1260px', margin: '28px auto', padding: '0 24px' }}>
      {/* Node Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #dbe2ea', paddingBottom: '20px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#0b3954', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
              AUTH NODE #{currentHospitalId}
            </span>
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
              ● Inter-Hospital Network Transparency Connected
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
            {hospitalInfo.name}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Sector: {hospitalInfo.city || 'National Capital Grid'} • Real-Time Transfusion & Donor Dispatch Console
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: '#ffffff',
            color: '#c81e3a',
            border: '1px solid #fecdd3',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Sign Out of Node
        </button>
      </div>

      {/* INCOMING RECIPROCAL BARTER BEACONS FROM OTHER HOSPITALS */}
      {incomingEmergencyBeacons.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {incomingEmergencyBeacons.map((beacon) => {
            const myAvailableUnits = activeStock[beacon.componentNeeded] || 0;
            const canFulfill = myAvailableUnits >= Number(beacon.unitsNeeded);

            return (
              <div
                key={beacon.broadcastId}
                style={{
                  background: '#fff1f2',
                  border: '2px solid #f43f5e',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(244, 63, 94, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    background: '#e11d48',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800
                  }}>
                    🔄
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#e11d48', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 800 }}>
                        RECIPROCAL SWAP BEACON #{beacon.broadcastId}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9f1239', fontWeight: 700 }}>
                        {beacon.timestamp}
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#881337', marginTop: '3px' }}>
                      {beacon.requesterName} needs <strong>{beacon.unitsNeeded} Units of {beacon.componentNeeded}</strong> and offers <strong>{beacon.unitsOffered} Units of {beacon.componentOffered}</strong> in exchange.
                    </div>
                    <div style={{ fontSize: '12px', color: '#9f1239' }}>
                      Your Stock: <strong>{myAvailableUnits} Units</strong> of {beacon.componentNeeded}.
                    </div>
                  </div>
                </div>

                <div>
                  {canFulfill ? (
                    <button
                      onClick={() => handleFulfillShortage(beacon)}
                      style={{
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                      }}
                    >
                      ⚡ Accept Barter (Give {beacon.componentNeeded} / Take {beacon.componentOffered})
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#9f1239', fontWeight: 700, background: '#ffe4e6', padding: '6px 12px', borderRadius: '4px' }}>
                      Insufficient Reserve
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'inventory' ? '#0b3954' : '#64748b',
            borderBottom: activeTab === 'inventory' ? '3px solid #0b3954' : '3px solid transparent',
            marginBottom: '-2px'
          }}
        >
          Live Telemetry & Exchange
        </button>

        <button
          onClick={() => setActiveTab('transparency')}
          style={{
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'transparency' ? '#0b3954' : '#64748b',
            borderBottom: activeTab === 'transparency' ? '3px solid #0b3954' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>🌐 Network Transparency Grid</span>
          <span style={{ background: '#059669', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
            All 5 Nodes
          </span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          style={{
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'records' ? '#0b3954' : '#64748b',
            borderBottom: activeTab === 'records' ? '3px solid #0b3954' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Manifest Ledger</span>
          <span style={{
            background: activeTab === 'records' ? '#0b3954' : '#e2e8f0',
            color: activeTab === 'records' ? '#fff' : '#475569',
            fontSize: '11px',
            padding: '2px 7px',
            borderRadius: '10px',
            fontWeight: 800
          }}>
            {myHospitalRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('donors')}
          style={{
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            color: activeTab === 'donors' ? '#0b3954' : '#64748b',
            borderBottom: activeTab === 'donors' ? '3px solid #0b3954' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Universal Donors & Direct SMS</span>
          <span style={{
            background: activeTab === 'donors' ? '#0b3954' : '#e2e8f0',
            color: activeTab === 'donors' ? '#fff' : '#475569',
            fontSize: '11px',
            padding: '2px 7px',
            borderRadius: '10px',
            fontWeight: 800
          }}>
            {donors.length}
          </span>
        </button>
      </div>

      {notice.text && (
        <div style={{
          background: notice.isError ? '#fff1f2' : '#ecfdf5',
          border: `1px solid ${notice.isError ? '#fecdd3' : '#a7f3d0'}`,
          color: notice.isError ? '#9f1239' : '#065f46',
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '20px'
        }}>
          {notice.isError ? '⚠️ ' : '✓ '}{notice.text}
        </div>
      )}

      {/* TAB 1: Live Telemetry & Reciprocal Exchange Desk */}
      {activeTab === 'inventory' && (
        <>
          <div className="panel" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0b3954' }}>
                  Live Reserve Telemetry Matrix (Local Node)
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Immutable clinical ledger. Updates strictly via verified voluntary donor intake (+1) or reciprocal hospital swaps.
                </p>
              </div>
              <div className="mono" style={{ fontSize: '11px', color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '4px' }}>
                CLUSTER SYNC: ACTIVE
              </div>
            </div>

            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Component Group</th>
                  <th>Clinical Classification</th>
                  <th>Current Balance</th>
                  <th style={{ textAlign: 'right' }}>Network Tier Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(activeStock).map(([grp, units]) => {
                  const status = getStatus(units);
                  return (
                    <tr key={grp}>
                      <td style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                        <span style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px' }}>
                          {grp}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                        {grp.includes('Platelet') ? 'PRP / Single Donor Platelets (SDP)' : grp.includes('Plasma') ? 'Fresh Frozen Plasma (FFP)' : 'Whole Blood / Packed RBCs'}
                      </td>
                      <td>
                        <span className="mono" style={{ fontSize: '18px', fontWeight: 800, color: units <= 5 ? '#c81e3a' : '#0f172a' }}>
                          {units}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>Units in Bank</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`badge-state ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '40px' }}>
            {/* Reciprocal Unit-for-Unit Exchange Form */}
            <div className="panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ background: '#0b3954', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px' }}>
                  REPLACEMENT SWAP
                </span>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0b3954' }}>
                  Inter-Hospital Reciprocal Exchange Terminal
                </h2>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                Receive scarce units from a peer hospital while providing surplus units in replacement to protect institutional safety buffers.
              </p>

              <form onSubmit={handleExecuteReciprocalSwap}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
                    PEER HOSPITAL NODE (SWAP PARTNER)
                  </label>
                  <select
                    value={targetPeer}
                    onChange={e => setTargetPeer(e.target.value)}
                    className="desk-input"
                    style={{ margin: 0 }}
                  >
                    {Object.entries(clusterData)
                      .filter(([nodeId]) => nodeId !== currentHospitalId)
                      .map(([nodeId, data]) => (
                        <option key={nodeId} value={nodeId}>
                          {data.name} — {data.sector}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Section A: Units To TAKE */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    1. UNITS TO RECEIVE (INBOUND FROM PARTNER)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginTop: '6px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#166534' }}>COMPONENT NEEDED</label>
                      <select
                        value={takeGroup}
                        onChange={e => setTakeGroup(e.target.value)}
                        className="desk-input"
                        style={{ margin: 0, background: '#fff' }}
                      >
                        {bloodGroupsList.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#166534' }}>QUANTITY</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={takeUnits}
                        onChange={e => setTakeUnits(e.target.value)}
                        className="desk-input"
                        style={{ margin: 0, background: '#fff' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Units To GIVE */}
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>
                    2. REPLACEMENT UNITS TO GIVE (OUTBOUND SURPLUS DISPATCHED)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginTop: '6px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#991b1b' }}>SURPLUS COMPONENT OFFERED</label>
                      <select
                        value={giveGroup}
                        onChange={e => setGiveGroup(e.target.value)}
                        className="desk-input"
                        style={{ margin: 0, background: '#fff' }}
                      >
                        {bloodGroupsList.map(g => (
                          <option key={g} value={g}>
                            {g} (My Stock: {activeStock[g] || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#991b1b' }}>QUANTITY</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={giveUnits}
                        onChange={e => setGiveUnits(e.target.value)}
                        className="desk-input"
                        style={{ margin: 0, background: '#fff' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
                    CLINICAL MEMO / JUSTIFICATION
                  </label>
                  <input
                    type="text"
                    required
                    value={swapReason}
                    onChange={e => setSwapReason(e.target.value)}
                    className="desk-input"
                    style={{ margin: 0 }}
                    placeholder="e.g. Reciprocal unit swap for emergency surgery"
                  />
                </div>

                <button type="submit" className="btn-main" style={{ width: '100%', justifyContent: 'center' }}>
                  Authorize Two-Way Reciprocal Swap Manifest
                </button>
              </form>
            </div>

            {/* Emergency Broadcast Terminal */}
            <div className="panel" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#9a3412' }}>
                Broadcast Emergency Barter Request
              </h2>
              <p style={{ fontSize: '12px', color: '#c2410c', margin: '4px 0 14px' }}>
                Cannot find units? Transmit an emergency beacon to all linked hospitals specifying what you need and what surplus you will return.
              </p>

              {mySentEmergencyBeacons.length > 0 && (
                <div style={{ background: '#fff', border: '1px solid #fed7aa', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#c2410c' }}>ACTIVE BEACONS ON GRID:</div>
                  {mySentEmergencyBeacons.map(b => (
                    <div key={b.broadcastId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700 }}>
                        Need {b.unitsNeeded} {b.componentNeeded} &harr; Giving {b.unitsOffered} {b.componentOffered}
                      </span>
                      <button
                        onClick={() => handleCancelBroadcast(b.broadcastId)}
                        style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleTriggerEmergencyShortage}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                    DEFICIT COMPONENT SOUGHT (RECEIVE)
                  </label>
                  <select name="deficitComponent" className="desk-input" style={{ margin: 0, background: '#fff' }}>
                    <option value="O-">O Negative</option>
                    <option value="Platelets">Single Donor Platelets (SDP)</option>
                    <option value="AB-">AB Negative</option>
                    <option value="Plasma">Fresh Frozen Plasma (FFP)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                    REQUIRED UNITS
                  </label>
                  <input
                    name="unitsNeeded"
                    type="number"
                    min="1"
                    max="10"
                    defaultValue="2"
                    className="desk-input"
                    style={{ margin: 0, background: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#9a3412', marginBottom: '4px' }}>
                    SURPLUS OFFERED IN RETURN (DISPATCH)
                  </label>
                  <select name="compensationComponent" className="desk-input" style={{ margin: 0, background: '#fff' }}>
                    <option value="A+">A Positive (Whole Blood)</option>
                    <option value="B+">B Positive (Whole Blood)</option>
                    <option value="AB+">AB Positive (Plasma)</option>
                    <option value="O+">O Positive (Whole Blood)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Broadcast Barter Offer to Network
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: REGIONAL NETWORK TRANSPARENCY GRID (LIVE VIEW ACROSS ALL 5 HOSPITALS) */}
      {activeTab === 'transparency' && (
        <div className="panel" style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.4px', background: '#ecfdf5', padding: '3px 8px', borderRadius: '4px' }}>
                Open Institutional Telemetry
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0b3954', marginTop: '6px' }}>
                Regional Inter-Hospital Live Reserve Transparency Matrix
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Compare real-time stock across all 5 networked medical nodes in Delhi-NCR. Red indicates deficit alert ($\le 5$ units); green indicates optimal stock.
              </p>
            </div>
            <div className="mono" style={{ fontSize: '11px', color: '#0b3954', background: '#f1f5f9', padding: '6px 12px', borderRadius: '4px' }}>
              SYNCHRONIZED NODES: 5 ACTIVE
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="clinical-table" style={{ textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', minWidth: '180px' }}>Hospital Node</th>
                  <th>O-</th>
                  <th>O+</th>
                  <th>A-</th>
                  <th>A+</th>
                  <th>B-</th>
                  <th>B+</th>
                  <th>AB-</th>
                  <th>AB+</th>
                  <th>Platelets</th>
                  <th>Plasma</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(clusterData).map(([nodeId, data]) => {
                  const isCurrent = nodeId === currentHospitalId;
                  return (
                    <tr key={nodeId} style={{ background: isCurrent ? '#f0fdf4' : '#ffffff' }}>
                      <td style={{ textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                        <div>{data.name}</div>
                        <span className="mono" style={{ fontSize: '10px', color: isCurrent ? '#059669' : '#64748b', fontWeight: 800 }}>
                          {isCurrent ? '● CURRENT LOGGED-IN NODE' : data.sector}
                        </span>
                      </td>

                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+', 'Platelets', 'Plasma'].map(grp => {
                        const count = (data.inventory && data.inventory[grp] !== undefined) ? data.inventory[grp] : 0;
                        const isDeficit = count <= 5;
                        const isLow = count > 5 && count <= 15;

                        return (
                          <td key={grp}>
                            <span
                              className="mono"
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 800,
                                fontSize: '13px',
                                background: isDeficit ? '#fee2e2' : isLow ? '#fef9c3' : '#dcfce7',
                                color: isDeficit ? '#991b1b' : isLow ? '#854d0e' : '#166534',
                                border: `1px solid ${isDeficit ? '#fecaca' : isLow ? '#fef08a' : '#bbf7d0'}`
                              }}
                            >
                              {count}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Manifest Ledger */}
      {activeTab === 'records' && (
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0b3954' }}>
                Institutional Transfer Manifest Ledger
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                Audited transaction logs tracking two-way reciprocal exchanges and donor phlebotomy.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset cluster ledger records?')) {
                  setNetworkLedger([]);
                  localStorage.removeItem('mesh_shared_ledger');
                }
              }}
              style={{ background: 'none', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}
            >
              Reset Ledger
            </button>
          </div>

          {myHospitalRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px' }}>
              No barter exchange manifests logged yet for this node.
            </div>
          ) : (
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Manifest ID</th>
                  <th>Date & Time</th>
                  <th>Partner Facility</th>
                  <th>Reciprocal Exchange Summary</th>
                  <th>Clinical Justification</th>
                  <th style={{ textAlign: 'right' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {myHospitalRecords.map((rec) => {
                  const isInitiator = rec.senderId === currentHospitalId;
                  return (
                    <tr key={rec.id}>
                      <td className="mono" style={{ fontWeight: 800, color: '#0b3954' }}>{rec.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{rec.date}</div>
                        <div className="mono" style={{ fontSize: '11px', color: '#64748b' }}>{rec.time}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {isInitiator ? `With: ${rec.recipientName}` : `From: ${rec.senderName}`}
                      </td>
                      <td>
                        <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                          {rec.details}
                        </span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '12px' }}>
                        {rec.reason}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge-state state-adequate" style={{ fontSize: '10px' }}>
                          MUTUAL_SWAP_VERIFIED
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 4: Universal Donors & Direct-to-Donor SMS Broadcast Terminal */}
      {activeTab === 'donors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* DIRECT-TO-DONOR EMERGENCY SMS BROADCAST TERMINAL */}
          <div className="panel" style={{ background: '#f8fafc', border: '2px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ background: '#0284c7', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '3px', textTransform: 'uppercase' }}>
                  Telephony & SMS Broadcast Gateway
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0b3954', marginTop: '4px' }}>
                  Emergency SMS Dispatch to Registered Voluntary Donors
                </h3>
              </div>
              <span className="mono" style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
                ● ON-CALL DONOR BROADCAST
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
              If nearby hospitals lack the required units, send an instant emergency mobilization SMS directly to all registered voluntary donors of that blood group who have cleared their 90-day recovery cycle.
            </p>

            {donorSmsNotice && (
              <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', padding: '14px', borderRadius: '6px', marginBottom: '16px' }}>
                <div style={{ fontWeight: 800, color: '#065f46', fontSize: '13px' }}>
                  📲 Emergency SMS Transmitted to {donorSmsNotice.count} Eligible {donorSmsNotice.group} Donors!
                </div>
                <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px' }}>
                  Dispatch Stamp: {donorSmsNotice.timestamp} • Status: QUEUED_AND_DELIVERED
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {donorSmsNotice.donorsNotified.map(d => (
                    <span key={d.donorId} style={{ background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                      ✓ {d.name} ({d.phone})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleDispatchDirectDonorSms} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>
                  SELECT DEFICIT BLOOD GROUP FOR DONOR MOBILIZATION
                </label>
                <select name="targetBloodGroup" className="desk-input" style={{ margin: 0, background: '#fff' }}>
                  <option value="O-">O Negative (Universal Emergency)</option>
                  <option value="O+">O Positive</option>
                  <option value="A-">A Negative</option>
                  <option value="A+">A Positive</option>
                  <option value="B-">B Negative</option>
                  <option value="B+">B Positive</option>
                  <option value="AB-">AB Negative</option>
                  <option value="AB+">AB Positive</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 20px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📡 Dispatch Emergency SMS to Donors via Gateway
              </button>
            </form>
          </div>

          {/* REGISTERED DONOR LIST */}
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.4px', background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px' }}>
                  Universal National Registry
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0b3954', marginTop: '6px' }}>
                  Universal Blood Donor Intake & 90-Day Recovery Queue
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Search by <strong>Universal Donor ID (NDR)</strong>, donor name, or blood group.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Search NDR-XXXX, Name, or Group..."
                  value={donorSearchQuery}
                  onChange={(e) => setDonorSearchQuery(e.target.value)}
                  className="search-box"
                  style={{ width: '280px' }}
                />
                {donorSearchQuery && (
                  <button
                    onClick={() => setDonorSearchQuery('')}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {donorIntakeNotice && (
              <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                {donorIntakeNotice}
              </div>
            )}

            {filteredDonors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '13px' }}>
                No donors matched your query "{donorSearchQuery}".
              </div>
            ) : (
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Universal Donor ID</th>
                    <th>Full Name</th>
                    <th>Blood Group</th>
                    <th>Last Donated</th>
                    <th>Biological Recovery Status</th>
                    <th style={{ textAlign: 'right' }}>Clinical Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map((donor) => {
                    const recovery = getRecoveryInfo(donor);

                    return (
                      <tr key={donor.donorId}>
                        <td className="mono" style={{ fontWeight: 800, color: '#0b3954' }}>
                          <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', border: '1px solid #bae6fd' }}>
                            {donor.donorId}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {donor.name} {donor.age ? `(${donor.age}y)` : ''}
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Tel: {donor.phone}</div>
                        </td>
                        <td>
                          <span style={{ background: '#ffe4e6', color: '#c81e3a', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                            {donor.group}
                          </span>
                        </td>
                        <td className="mono" style={{ fontSize: '12px', color: '#475569' }}>
                          {donor.lastDonatedDate || 'First Time Donor'}
                          {donor.unitsContributed ? (
                            <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>
                              {donor.unitsContributed} Unit(s) Contributed
                            </div>
                          ) : null}
                        </td>
                        <td>
                          {recovery.inRecovery ? (
                            <div>
                              <span className="badge-state state-low" style={{ fontSize: '10px', display: 'inline-block', marginBottom: '2px' }}>
                                ⏳ Recovery Lock: {recovery.daysRemaining} Days Left
                              </span>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                Eligible after: <strong>{recovery.eligibleDate}</strong>
                              </div>
                            </div>
                          ) : (
                            <span className="badge-state state-adequate" style={{ fontSize: '10px' }}>
                              ● Recovery Cleared (Eligible to Donate)
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {recovery.inRecovery ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <button
                                disabled
                                style={{
                                  background: '#e2e8f0',
                                  color: '#94a3b8',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'not-allowed'
                                }}
                              >
                                Intake Locked (Under Recovery)
                              </button>
                              <button
                                onClick={() => handleSimulateRecoveryElapsed(donor.donorId)}
                                style={{
                                  background: 'none',
                                  border: '1px dashed #0284c7',
                                  color: '#0284c7',
                                  padding: '2px 6px',
                                  borderRadius: '3px',
                                  fontSize: '9px',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                title="Fast forward time by 90 days for demo testing"
                              >
                                ⚡ Simulate 90 Days Elapsed
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                onClick={() => handleIntakeAndCredit(donor)}
                                style={{
                                  background: '#059669',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Confirm Intake (+1 Unit)
                              </button>
                              <a
                                href={`tel:${donor.phone}`}
                                style={{
                                  background: '#0b3954',
                                  color: '#ffffff',
                                  textDecoration: 'none',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                              >
                                📞 Call Donor
                              </a>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}