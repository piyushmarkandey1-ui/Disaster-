import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { Incident, Shelter, Hospital } from '../src/types';

const DB_DIR = path.resolve('./data');
const DB_FILE = path.join(DB_DIR, 'rescue_ai_db.json');

interface Schema {
  incidents: Incident[];
  shelters: Shelter[];
  hospitals: Hospital[];
}

const DEFAULT_SHELTERS: Shelter[] = [
  {
    id: 'shelter-1',
    name: 'Rohini Community Disaster Shelter',
    nameHi: 'रोहिणी सामुदायिक आपदा आश्रय',
    latitude: 28.7041,
    longitude: 77.1025,
    address: 'Sector 3, Rohini, New Delhi, 110085',
    addressHi: 'सेक्टर 3, रोहिणी, नई दिल्ली, 110085',
    capacity: 250,
    currentOccupancy: 85,
    contactNumber: '+91 11-27568390',
    status: 'Open'
  },
  {
    id: 'shelter-2',
    name: 'Dwarka Relief Center Alpha',
    nameHi: 'द्वारका राहत केंद्र अल्फा',
    latitude: 28.5889,
    longitude: 77.0505,
    address: 'Sector 10, Dwarka, New Delhi, 110075',
    addressHi: 'सेक्टर 10, द्वारका, नई दिल्ली, 110075',
    capacity: 500,
    currentOccupancy: 420,
    contactNumber: '+91 11-28084512',
    status: 'Open'
  },
  {
    id: 'shelter-3',
    name: 'Connaught Place Underground Safezone',
    nameHi: 'कनॉट प्लेस भूमिगत सुरक्षित क्षेत्र',
    latitude: 28.6304,
    longitude: 77.2177,
    address: 'Inner Circle, Connaught Place, New Delhi, 110001',
    addressHi: 'इनर सर्कल, कनॉट प्लेस, नई दिल्ली, 110001',
    capacity: 1000,
    currentOccupancy: 150,
    contactNumber: '+91 11-41512345',
    status: 'Open'
  },
  {
    id: 'shelter-4',
    name: 'Vasant Kunj Primary School Safehaven',
    nameHi: 'वसंत कुंज प्राथमिक विद्यालय सुरक्षित स्थान',
    latitude: 28.5387,
    longitude: 77.1554,
    address: 'Sector B, Vasant Kunj, New Delhi, 110070',
    addressHi: 'सेक्टर बी, वसंत कुंज, नई दिल्ली, 110070',
    capacity: 150,
    currentOccupancy: 150,
    contactNumber: '+91 11-26123456',
    status: 'Full'
  }
];

const DEFAULT_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'RescueAI Emergency Hospital - Rohini',
    nameHi: 'रेस्क्यूएआई आपातकालीन अस्पताल - रोहिणी',
    latitude: 28.7112,
    longitude: 77.1124,
    address: 'Sector 9, Rohini, New Delhi, 110085',
    addressHi: 'सेक्टर 9, रोहिणी, नई दिल्ली, 110085',
    availableBeds: 45,
    contactNumber: '+91 11-47022222',
    specialty: 'Trauma & Burns'
  },
  {
    id: 'hosp-2',
    name: 'AIIMS Disaster Response Unit',
    nameHi: 'एम्स आपदा प्रतिक्रिया इकाई',
    latitude: 28.5672,
    longitude: 77.2100,
    address: 'Ansari Nagar, New Delhi, 110029',
    addressHi: 'अंसारी नगर, नई दिल्ली, 110029',
    availableBeds: 120,
    contactNumber: '+91 11-26588500',
    specialty: 'Multi-Specialty Emergency Care'
  },
  {
    id: 'hosp-3',
    name: 'Dwarka General & Emergency Care',
    nameHi: 'द्वारका सामान्य एवं आपातकालीन देखभाल',
    latitude: 28.5912,
    longitude: 77.0624,
    address: 'Sector 12, Dwarka, New Delhi, 110075',
    addressHi: 'सेक्टर १२, द्वारका, नई दिल्ली, ११००७५',
    availableBeds: 18,
    contactNumber: '+91 11-45678900',
    specialty: 'General Trauma'
  }
];

const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    disasterType: 'Flood',
    severity: 'Critical',
    priorityScore: 9,
    affectedPeople: 14,
    reporterName: 'Amit Sharma',
    reporterContact: '+91 9812345678',
    description: 'Severe water-logging in the residential block. Ground floor is completely submerged, and multiple senior citizens are stuck on the first floor without electricity or dry food supplies.',
    location: {
      latitude: 28.7082,
      longitude: 77.1012,
      address: 'Pocket G-18, Rohini Sector 7, New Delhi'
    },
    status: 'Dispatched',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    recommendedActions: [
      'Deploy inflatable rescue boats immediately.',
      'Provide clean drinking water and nutrient packs.',
      'Coordinate with Power Grid to disable transformers in low-lying zones to prevent electrocution.'
    ],
    assignedTeam: 'NDRF Boat Rescue Unit 12',
    updates: [
      'Incident reported by citizen.',
      'Gemini AI categorized incident as Flooding with Priority 9/10.',
      'Response team dispatched with 2 inflatable motorboats.'
    ]
  },
  {
    id: 'inc-2',
    disasterType: 'Fire',
    severity: 'Critical',
    priorityScore: 10,
    affectedPeople: 8,
    reporterName: 'Priya Patel',
    reporterContact: '+91 9898765432',
    description: 'Electric short circuit causing fire inside a multi-story apartment block. Smoke is filling up the corridors. Fire engines have been alerted, but 4 people are trapped on the balcony.',
    location: {
      latitude: 28.6290,
      longitude: 77.2150,
      address: 'Radial Road 3, Connaught Place, New Delhi'
    },
    status: 'Reported',
    createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    recommendedActions: [
      'Dispatch fire trucks fitted with aerial ladders.',
      'Alert nearest Trauma Hospital (AIIMS Response Unit).',
      'Deploy localized air filtration and ventilation units.'
    ],
    updates: [
      'Incident reported via Citizen portal.',
      'AI priority analysis identified extreme fire hazard risk and trapped civilians. Promoted score to 10.'
    ]
  },
  {
    id: 'inc-3',
    disasterType: 'Infrastructure Failure',
    severity: 'Medium',
    priorityScore: 5,
    affectedPeople: 0,
    reporterName: 'Rajesh Kumar',
    reporterContact: '+91 9771239854',
    description: 'A large tree has fallen and collapsed a utility pole, exposing live electric cables on a public road near Dwarka Metro Station. High threat of injury for pedestrians, and road blocks.',
    location: {
      latitude: 28.5835,
      longitude: 77.0550,
      address: 'Main Road Sector 11, Dwarka, New Delhi'
    },
    status: 'Reported',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    recommendedActions: [
      'Block pedestrian and driving traffic.',
      'Alert Electric Division to cut power line safety grids.',
      'Send local municipal crane/chainsaw teams for tree removal.'
    ],
    updates: [
      'Automated reporting.',
      'Power grid notified.'
    ]
  }
];

export async function initDb() {
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }

  if (!existsSync(DB_FILE)) {
    const defaultData: Schema = {
      incidents: DEFAULT_INCIDENTS,
      shelters: DEFAULT_SHELTERS,
      hospitals: DEFAULT_HOSPITALS
    };
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

async function readDb(): Promise<Schema> {
  await initDb();
  const fileContent = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(fileContent);
}

async function writeDb(data: Schema) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getIncidents(): Promise<Incident[]> {
  const db = await readDb();
  return db.incidents;
}

export async function getShelters(): Promise<Shelter[]> {
  const db = await readDb();
  return db.shelters;
}

export async function getHospitals(): Promise<Hospital[]> {
  const db = await readDb();
  return db.hospitals;
}

export async function addIncident(incident: Incident): Promise<Incident> {
  const db = await readDb();
  db.incidents.unshift(incident); // latest field first
  await writeDb(db);
  return incident;
}

export async function updateIncident(incidentId: string, updates: Partial<Incident>): Promise<Incident | null> {
  const db = await readDb();
  const idx = db.incidents.findIndex(inc => inc.id === incidentId);
  if (idx === -1) return null;

  db.incidents[idx] = {
    ...db.incidents[idx],
    ...updates,
    updates: [
      ...(db.incidents[idx].updates || []),
      `Incident updated at ${new Date().toLocaleTimeString()} - Status: ${updates.status || db.incidents[idx].status}`
    ]
  };

  await writeDb(db);
  return db.incidents[idx];
}

export async function addShelter(shelter: Shelter): Promise<Shelter> {
  const db = await readDb();
  db.shelters.push(shelter);
  await writeDb(db);
  return shelter;
}

export async function updateShelterOccupancy(shelterId: string, occupancy: number): Promise<Shelter | null> {
  const db = await readDb();
  const idx = db.shelters.findIndex(s => s.id === shelterId);
  if (idx === -1) return null;

  db.shelters[idx].currentOccupancy = Math.min(db.shelters[idx].capacity, Math.max(0, occupancy));
  if (db.shelters[idx].currentOccupancy >= db.shelters[idx].capacity) {
    db.shelters[idx].status = 'Full';
  } else {
    db.shelters[idx].status = 'Open';
  }

  await writeDb(db);
  return db.shelters[idx];
}
