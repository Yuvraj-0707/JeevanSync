# 🩸 JeevanSync — Real-Time Inter-Hospital Blood Inventory Network & Emergency Telemetry

> **Smart India Hackathon 2026** • **PS ID:** SIH26196 • **Theme:** Healthcare & MedTech • **Category:** Software  
> **Team:** Hack Elite • **Live Deployment:** [jeevansync.vercel.app](https://e-rakt-kosh.vercel.app)[cite: 1]

---

## 📌 Problem Overview

* **Fragmented Supplies:** Blood stocks are scattered across disconnected hospital databases, delaying life-saving discoveries during acute emergencies.
* **Zero Real-Time Visibility:** Facilities lack live visibility into available units, specific clinical components, and expiration dates.
* **Allocation Latency:** Matching urgency, component compatibility, and transit distance manually costs golden-hour survival time.
* **Preventable Expiration:** Surplus blood expires silently on local shelves while adjacent hospitals face critical shortages.

---

## 💡 Solution & Key Capabilities

* **Connected Blood Banks:** Unified real-time peer mesh connecting regional blood repositories.
* **Live Telemetry Matrix:** Instant visibility across blood groups, components (PRBC, SDP, FFP), and expiration dates.
* **Reciprocal Unit-for-Unit Barter Protocol:** Two-way atomic commit ensuring inter-hospital transfers without compromising local safety reserves.
* **Prioritized Redistribution:** Automatically directs surplus and near-expiry blood to active surges before triggering donor alarms.
* **IoT & Cold-Chain Transit Telemetry:** Active temperature monitoring (2°C to 6°C) and live GPS transit via Traccar.
* **Universal Donor ID & 90-Day Biological Lock:** Universal citizen donor IDs (`NDR-XXXX-XXXX`) enforcing statutory biological deferral windows.

---

## 📊 Conventional Portals vs. JeevanSync

| Capability | Legacy Portals (e-RaktKosh / Static Lists) | **JeevanSync (Our Solution)** |
| :--- | :--- | :--- |
| **Inventory Tracking** | Static, self-reported numbers updated manually once a day. | **Live Telemetry Matrix:** Real-time stock sync with deficit alerts (≤ 5 units). |
| **Inter-Facility Transfer** | Unilateral pull causing facility hoarding and shortages. | **Reciprocal Unit Barter Protocol:** Two-way atomic transfer commit. |
| **Stock Allocation** | Uncoordinated donor calls during regional surpluses. | **Prioritized Smart Redistribution:** Prioritizes near-expiry units first. |
| **Emergency Alerts** | Uncoordinated manual phone calls and kin panic. | **Emergency Distress Beacons:** Cluster-wide alerts with 1-click manifests. |
| **Donor Safety** | Unchecked repeat donations across multiple hospitals. | **90-Day Biological Recovery Lock:** Programmatic deferral protection. |
| **Cold-Chain Transit** | Untracked courier transit without thermal validation. | **IoT Traccar GPS Tracker:** Live route audits and 2°C–6°C thermal preservation. |

---

## 🏗️ System Architecture

```text
[ BLOOD SUPPLY GOVERNANCE & ADMINISTRATION ]
                      │
              Admin Dashboard
        Audit Trail • Critical Alert Controls
                      │
                      ▼
            [ CORE INFRASTRUCTURE ]
   Central Database • Emergency APIs • Traccar GPS
                      │
                      ▼
           [ REGISTERED FACILITIES ]
  ┌─────────────────────────┐   ┌─────────────────────────┐
  │   Hospital Dashboard    │   │  Blood Bank Dashboard   │
  │ • View Current Stock    │   │ • Post Available Stock  │
  │ • Inter-Facility Barter │   │ • Dispatch Management   │
  │ • Live Shipment Tracker │   │ • Reserve Safeguards    │
  └─────────────────────────┘   └─────────────────────────┘
                      │
                      ▼
         [ END-USER INTERACTION LAYER ]
  ┌─────────────────────────┐   ┌─────────────────────────┐
  │   Staff Mobile Client   │   │ Citizen Voluntary Portal│
  │ • Log Consumed Units    │   │ • Clinical Pre-Triage   │
  │ • QR Intake Verification│   │ • Universal ID Pass     │
  └─────────────────────────┘   └─────────────────────────┘

🔄 Operational Workflow Flowchart
[ Hospital / User Login ]
                             │
                             ▼
                 [ Enter Blood Requirement ]
                             │
                             ▼
           [ Real-Time Network Checks Connected Nodes ]
                             │
                             ▼
    [ Smart Matching: Compatibility + Distance + Urgency ]
                             │
               ┌─────────────┴─────────────┐
               ▼                           ▼
          [ Units Found ]            [ Stock Depleted ]
               │                           │
  [ Prioritized Redistribution ]  [ Emergency Donor Search ]
               │                           │
  [ Coordinated Unit Barter ]     [ Broadcast to Regional Donors ]
               │                           │
  [ Traccar GPS & Cold-Chain ]    [ Appointment E-Pass Issued ]
               │                           │
               └─────────────┬─────────────┘
                             ▼
          [ Inventory Synchronized via WebSockets ]
                             │
                           [ END ]

🛠️ Technology Stack
Frontend: React 19, Vite, Tailwind CSS, Lucide React, Leaflet.js

Backend: Node.js, Express.js (REST APIs, WebSockets)

Telemetry & Tracking: Traccar GPS Engine, NMEA Coordinate Streamers

Emergency Messaging: Twilio SMS / Telephony Gateway

Deployment: Vercel Global Edge Network

📑 Feasibility Analysis (10 Pillars)
1. Technical: Scalable microservices built on React 19, Vite, and Node.js.

2. Economical: Zero specialized proprietary hardware; built on open-source web standards.

3. Social: Shortens emergency blood discovery to under 60 seconds, saving lives.

4. Legal & Compliance: Adheres to NACO/NBTC transfusion safety and NDHM guidelines.

5. Operational: Frictionless fit into existing phlebotomy and blood bank intake workflows.

6. Resource: Runs seamlessly on existing hospital tablets and desktop browsers.

7. Time: Modular phased rollout with immediate pilot deployment viability.

8. Infrastructure: Cloud-native architecture with horizontal scaling capabilities.

9. Data: Standardized JSON protocols with SHA-256 manifest integrity.

10. Maintenance: Modular package structure with automated CI/CD deployment pipelines.

🔬 Research & Peer-Reviewed References
National Transfusion Safety & Deferral Protocols (MoHFW): Governs component separation and statutory 90-day donor deferral window. eRaktKosh Portal

IoT-Based E-Blood Bank Telemetry (IJIRCST): Validates cold-chain maintenance (2°C–6°C for RBCs) to eliminate component denaturation. IJIRCST Paper

Real-Time Emergency Logistics & Transit Allocation (IRJET): Demonstrates a 70%+ reduction in transit latency via proximity peer node routing. IRJET Paper

Component Inventory & Network Exchange Management (IJNTI): Mathematical optimization for multi-tier reciprocal blood bank manifests. IJNTI Paper

💻 Local Setup
# 1. Clone repository
git clone [https://github.com/Yuvraj-0707/JeevanSync.git](https://github.com/Yuvraj-0707/JeevanSync.git)
cd JeevanSync

# 2. Setup backend
cd backend
npm install
npm run dev

# 3. Setup frontend (in a separate terminal)
cd ../frontend
npm install
npm run dev

