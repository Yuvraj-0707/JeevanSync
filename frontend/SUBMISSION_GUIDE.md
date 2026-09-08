# SIH 2026 Evaluation & Review Guide

This guide helps hackathon evaluators review the codebase, test live workflows, and verify core technical deliverables for **e-RaktKosh Mesh**.

---

## Quick Evaluation Checklist

* **Live Interactive Deployment:** [https://e-rakt-kosh.vercel.app](https://e-rakt-kosh.vercel.app)
* **Problem Statement:** SIH26196 – Real-Time Inter-Hospital Blood Inventory Network and Emergency Communication System
* **Team Name:** Hack Elite
* **Theme:** Healthcare & MedTech

---

## 3-Minute Live Evaluation Walkthrough

### 1. Citizen Portal & Voluntary Donor Triage (`/`)
1. Open the live deployment URL.
2. Scroll to the **Voluntary Donor Desk**.
3. Submit a registration test with age $\ge 18$, weight $\ge 45\text{ kg}$, and select a blood group (e.g., $O^-$).
4. Verify the generation of the **Universal Donor ID (`NDR-XXXX-XXXX`)** and the downloadable digital appointment pass.

### 2. Live Regional Transparency Matrix (`/dashboard`)
1. Navigate to the **Hospital Dashboard** (default node: AIIMS / `HOSP-DEL-001`).
2. Click the **🌐 Network Transparency Grid** tab.
3. Observe real-time component reserves synced across all 5 NCR hospital nodes with red deficit alerts ($\le 5$ units).

### 3. Reciprocal Unit-for-Unit Barter Swap (`/dashboard`)
1. In the **Live Telemetry & Exchange** tab, select Safdarjung Hospital (`HOSP-DEL-002`).
2. Request $2$ units of $O^-$ and offer $2$ units of $A^+$ in replacement.
3. Click **Authorize Two-Way Reciprocal Swap Manifest**.
4. Check the **Manifest Ledger** tab to inspect the timestamped, immutable transaction entry.

### 4. Emergency Shortage Beacon & SMS Dispatch (`/dashboard`)
1. Open the **Universal Donors & Direct SMS** tab.
2. Select an emergency deficit group (e.g., $O^-$) and click **Dispatch Emergency SMS to Donors via Gateway**.
3. Verify that only donors outside the mandatory 90-day biological recovery window are queued for recall.