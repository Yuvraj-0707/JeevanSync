const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Basic health route
app.get('/', (req, res) => {
  res.send('e-RaktKosh Mesh Backend Core Online');
});

// Import Seed Dataset for mock authentication & public queries
const hospitalsData = [
  {
    id: 'HOSP-DEL-001',
    hospitalId: 'HOSP-DEL-001',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    email: 'bloodbank@aiims.edu',
    password: 'node@password123',
    city: 'Ansari Nagar, New Delhi',
    contact: '+91 11 2658 8500',
    inventory: {
      'A+': 45, 'A-': 6, 'B+': 52, 'B-': 4,
      'AB+': 14, 'AB-': 2, 'O+': 68, 'O-': 8,
      'Platelets': 22, 'Plasma': 35
    }
  },
  {
    id: 'HOSP-DEL-002',
    hospitalId: 'HOSP-DEL-002',
    name: 'Safdarjung Hospital & VMMC',
    email: 'bloodbank@safdarjung.gov.in',
    password: 'node@password123',
    city: 'Ring Road, New Delhi',
    contact: '+91 11 2616 5060',
    inventory: {
      'A+': 28, 'A-': 3, 'B+': 34, 'B-': 1,
      'AB+': 8, 'AB-': 0, 'O+': 40, 'O-': 2,
      'Platelets': 10, 'Plasma': 18
    }
  },
  {
    id: 'HOSP-DEL-005',
    hospitalId: 'HOSP-DEL-005',
    name: 'Indraprastha Apollo Hospitals',
    email: 'transfusion@apollohospitalsdelhi.com',
    password: 'node@password123',
    city: 'Sarita Vihar, New Delhi',
    contact: '+91 11 2692 5858',
    inventory: {
      'A+': 55, 'A-': 12, 'B+': 60, 'B-': 9,
      'AB+': 20, 'AB-': 6, 'O+': 75, 'O-': 10,
      'Platelets': 40, 'Plasma': 45
    }
  }
];

// Authentication route
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const cleanId = (identifier || '').trim().toLowerCase();

  const node = hospitalsData.find(
    h => (h.hospitalId.toLowerCase() === cleanId || h.email.toLowerCase() === cleanId) &&
         h.password === password
  );

  if (!node) {
    return res.status(401).json({ message: 'Unauthorized Node Credentials or Unregistered Center' });
  }

  res.json({
    token: 'jwt-auth-mesh-node-verified',
    hospital: {
      id: node.id,
      hospitalId: node.hospitalId,
      name: node.name,
      city: node.city,
      inventory: node.inventory
    }
  });
});

// Public masked availability route
app.get('/api/inventory/public-grid', (req, res) => {
  const masked = hospitalsData.map(h => {
    const availability = {};
    for (const [group, units] of Object.entries(h.inventory)) {
      if (units <= 5) availability[group] = 'Deficit Alert';
      else if (units <= 15) availability[group] = 'Low Stock';
      else availability[group] = 'Optimal';
    }
    return {
      id: h.id,
      name: h.name,
      city: h.city,
      contact: h.contact,
      availability
    };
  });
  res.json(masked);
});

// Start listening
app.listen(PORT, () => {
  console.log(`Mesh Telemetry Server running on port ${PORT}`);
});
// Emergency Distress & SMS/WhatsApp Notification Gateway
app.post('/api/notifications/dispatch-shortage', (req, res) => {
  const { hospitalName, component, currentUnits, requiredUnits, targetHospital } = req.body;

  const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const alertPayload = {
    event: 'CRITICAL_DEFICIT_DISPATCH',
    timestamp,
    message: `EMERGENCY ALERT: ${hospitalName} is reporting a critical shortage of ${component} (Current reserve: ${currentUnits} units). Sourcing ${requiredUnits} units from ${targetHospital}.`,
    channel: 'SMS_TELEPHONY_GATEWAY',
    deliveryStatus: 'QUEUED_AND_SENT'
  };

  console.log('[TELEMETRY DISPATCH GATEWAY]:', alertPayload);

  // Return success response to the frontend client
  res.status(200).json({
    success: true,
    notificationId: `NOTIF-${Math.floor(10000 + Math.random() * 90000)}`,
    ...alertPayload
  });
});