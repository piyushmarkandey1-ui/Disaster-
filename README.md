# 🚨 RescueAI - AI-Powered Disaster Response Coordination Core 🚨

**🌐 Live Demo:** [https://disaster-app-kappa.vercel.app](https://disaster-app-kappa.vercel.app)

RescueAI is a high-fidelity, real-time crisis response portal built for Hackathons and production readiness. It bridges the critical communication gap during devastating crises, allowing citizens to broadcast secure geographic emergency alarms and authorizing rescue teams (such as the National Disaster Response Force - NDRF) to automatically filter, prioritize, coordinate, and complete live rescues with server-side AI assistance.

---

## 🏗️ 1. Project Architecture

RescueAI is built on a high-performance full-stack structure perfectly configured for containerized execution (e.g., Cloud Run clusters) and high availability.

```
                              [ Citizen SOS Clients ] --- (Saves Reports & Mock Images)
                                         |
                                         v
   +-----------------------------------------------------------------------------+
   |                       Express Full-Stack Web Server                         |
   |                                                                             |
   |   [ API Routing ] <---> [ DB Layer (File JSON Store) ]                      |
   |          |                                                                  |
   |          +---> [ Gemini 3.5 Core Triage Engine ] ----> (Structured Extraction)|
   |          |                                                                  |
   |          +---> [ Vite Middleware Asset Pipeline ] ----> (Serves SPA Layout)  |
   +-----------------------------------------------------------------------------+
                                         ^
                                         |
                       [ NDRF Command Center Dispatch Cockpits ]
```

- **Execution Model**: Integrated React (Vite) Single Page Architecture serving as the frontend client, and a Node.js Express server acting as the unified, highly responsive backend API.
- **Triage Automation**: Incoming citizen emergency bulletins are routed server-side to the Google Gemini 3.5 Flash Model, avoiding client-side exposure of key secrets and enforcing rigorous JSON extraction patterns.
- **Unified Geodesic Positioning**: Leaflet/OpenStreetMap constructs dynamic coordinate points on dark background tile overlays (perfect for control and command setups) and calculates geodesic Haversine distances to Suggest nearby shelters and bed-centers.

---

## 📂 2. Folder Structure

The repository maintains absolute code modularity to respect token limits and enhance maintainability:

```
├── README.md               # Extensive project documentation & scripts
├── package.json            # Node.js manifest with dev, start & build triggers
├── index.html              # Core client HTML injection including Leaflet CSS
├── server.ts               # Full-stack Express server bootstrapping Vite API routes
├── data/
│   └── rescue_ai_db.json   # File-backed local secure database store
├── server/
│   ├── db.ts               # Seed and CRUD operation modules
│   └── gemini.ts           # Google GenAI SDK extraction analyzer
├── src/
│   ├── App.tsx             # Parent navigation state and multi-lingual dictionary
│   ├── index.css           # Global Tailwind CSS imports
│   ├── main.tsx            # Main client-side compiler entry points
│   ├── types.ts            # Typesafe Incident, Shelter, Hospital interfaces
│   └── components/
│       ├── CitizenPortal.tsx   # Active emergency SOS reporting wizard
│       ├── CommandCenter.tsx   # Dashboard tracking charts and rescue dispatchers
│       ├── DisasterMap.tsx     # High-tech Leaflet map overlay
│       └── SheltersList.tsx    # Haversine distance-sorted centers listing
```

---

## 🗄️ 3. Database Schema

The database uses a clean schema representation to enforce structure on incidents, shelters, and hospitals.

### A. Incidents Model
```typescript
interface Incident {
  id: string;               // Unique primary key identifier
  disasterType: string;     // Flood, Fire, Earthquake, Severe Storm, Landslide, etc.
  severity: string;         // Critical, High, Medium, Low
  priorityScore: number;    // Calculated rating from 1 to 10
  affectedPeople: number;   // Count of stranded/involved civilians
  reporterName: string;     // Citizen name
  reporterContact: string;  // Contact phone number
  description: string;      // Citizen emergency description
  location: {
    latitude: number;       // Lat coordinate
    longitude: number;      // Lng coordinate
    address: string;        // Formatted address text
  };
  imageUrl?: string;        // Base64-encoded snapshot of disaster scene
  status: string;           // Reported, Dispatched, Completed
  createdAt: string;        // ISO Timestamp
  recommendedActions: string[]; // AI recommended steps
  assignedTeam?: string;    // NDRF squad name
  updates: string[];        // Chronicle log lines
}
```

### B. Shelters Model
```typescript
interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  capacity: number;
  currentOccupancy: number;
  contactNumber: string;
  status: 'Open' | 'Full' | 'Closed';
}
```

### C. Hospitals Model
```typescript
interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  availableBeds: number;
  contactNumber: string;
  specialty: string;
}
```

---

## 📡 4. Backend Express API Endpoints

The web server hosts direct REST endpoints with custom body limits:

- `GET /api/incidents`: Fetch all disaster listings.
- `POST /api/incidents`: Register a citizen emergency, activate the server-side Gemini triage pipeline, calculate recommended action procedures, and save to database.
- `PUT /api/incidents/:id`: Dispatch NDRF response crews or resolve completed cases.
- `GET /api/shelters`: Retrieve all available shelters.
- `PUT /api/shelters/:id`: Increment or decrement shelter occupancy in real time.
- `GET /api/hospitals`: Retrieve specialty medical trauma units.

---

## ⚙️ 5. Gemini 3.5 Core Prompt Triage Engine

The server utilizes the official `@google/genai` TypeScript client to execute AI triage.

### Prompts Definition:
```markdown
You are RescueAI - the advanced disaster response analytics core.
Analyze this citizen emergency report description. Classify and extract structured JSON parameters representing the severe crisis metrics.

Citizen Report:
"[Citizen description input]"

Extract:
1. disasterType: Must be one of 'Flood', 'Fire', 'Earthquake', 'Severe Storm', 'Landslide', 'Medical Emergency', 'Infrastructure Failure', 'Other'. Choose the most fitting.
2. severity: Must be 'Critical', 'High', 'Medium', or 'Low'. (Critical = imminent loss of life/trapped civilians, High = active hazard/injury risk, Medium = blockages/structural threat, Low = property hazard without active human risk).
3. priorityScore: Integer from 1 (lowest danger) to 10 (highest, immediate catastrophic threat).
4. affectedPeople: Best estimate of direct trapped or directly impacted citizens. If unspecified, use 1.
5. recommendedActions: Exactly 3 highly specific, physical actionable rescue instructions for emergency response teams.

Analyze the image as well, if supplied, to assess the accuracy, scale, and visibility of the emergency.
```

---

## 🚀 6. Deployment Instructions

RescueAI compiles the frontend directly into `/dist`, bundles `server.ts` into standard CommonJS to bypass relative runtime ESM imports, and starts stand-alone using typical Node triggers:

1. **Environmental Variables Configuration**:
   Create a `.env` in the root (matching `.env.example` specifications):
   ```env
   GEMINI_API_KEY="AI_STUDIO_SECRETS_KEY"
   ```

2. **Acquiring Dependencies**:
   ```bash
   npm install
   ```

3. **Building the Production Code**:
   Builds Vite and files:
   ```bash
   npm run build
   ```

4. **Starting the Stack**:
   ```bash
   npm run start
   ```
   The platform will bind immediately to port `3000` (mapped to `0.0.0.0` for ingress proxy routing).

---

## 🎬 7. Interactive Demo Script for Hackathon Judges

To pitch RescueAI to your hackathon panel for maximum impact, follow this sequence:

1. **The Prelude (The Multilingual Hook)**:
   - Toggle language status to **हि (Hindi)**. Show that RescueAI supports Hindi natively to serve over 500 million citizens, ensuring maximum social accessibility during chaotic natural catastrophes. Toggle it back to **English** for standard review.

2. **The Problem Showcase (The Reporter)**:
   - Go to the **Citizen SOS Portal** page.
   - Speak to judges about real-world friction: "When citizens call emergency services, they are in a panic. Critical metadata is omitted, causing dispatch delay. RescueAI changes this with automatic AI triage."
   - Select the demo preset: **"Building Smoke Fire"**. Note that RescueAI pre-populates a realistic coordinate point, coordinates descriptions of a multi-story apartment block fire, and locks the raw base64 data.
   - Click **Broadcast SOS Alert**.

3. **The Magic (The Server-Side AI Analysis)**:
   - In less than 2 seconds, Gemini 3.5 processes the image + text, categorizing it as **Fire** with a **Critical Severity Status** and **Priority Score 10/10**, and producing 3 custom physical rescue guidelines like:
     * *Dispatch fire trucks with aerial access hook ladders.*
     * *Coordinate with municipal water services to spike fire hydrant pressure.*
   - Point out: "We did not input priority or type—our server-side AI categorized and structured this instantly in a single pipeline."

4. **The Response (The Map & CommandCenter Cockpit)**:
   - Go to the **Live Incident Map**. Note that our new Fire incident marker is glowing in deep Red inside CP, New Delhi.
   - Click onto the **Command Center Cockpit** tab. Show how our new incident sits at the top of the stream.
   - Enter dispatch title: "NDRF CP Ladder Squad Delta", and click **Deploy NDRF Dispatch Team**.
   - Note the status changes immediately to **Dispatched**, updating the live map visualizer simultaneously.

5. **The Target (Safe shelters & Bed Centers)**:
   - Head over to the **Safe shelters & Bed Centers** tab.
   - Point out that because our Fire incident is selected, RescueAI used the **Haversine Geodesic Math formula** to find that the *Connaught Place Underground Safezone* is the closest shelter at **only 0.13 km away**, indicating it as the **"CLOSEST RECOMMENDATION"**!
   - Under Rohini, click the `+` button next to occupancy, showing that local dispatchers can update safe bounds in one click.
   - Go back to the CommandCenter panel, click **Mark Disaster Resolved**. Show that all metrics reflect green recovery!
   - Pitch: "This is RescueAI. High-tech, robust, fully accessible, and completely prepared to save lives."
