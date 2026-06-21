export type DisasterType = 'Flood' | 'Fire' | 'Earthquake' | 'Severe Storm' | 'Landslide' | 'Medical Emergency' | 'Infrastructure Failure' | 'Other';
export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'Reported' | 'Dispatched' | 'Completed';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Incident {
  id: string;
  disasterType: DisasterType;
  severity: SeverityLevel;
  priorityScore: number; // 1 to 10 scale
  affectedPeople: number;
  reporterName: string;
  reporterContact: string;
  description: string;
  location: Location;
  imageUrl?: string; // base64 string
  status: IncidentStatus;
  createdAt: string;
  recommendedActions: string[];
  assignedTeam?: string;
  updates?: string[];
}

export interface Shelter {
  id: string;
  name: string;
  nameHi: string;
  latitude: number;
  longitude: number;
  address: string;
  addressHi: string;
  capacity: number;
  currentOccupancy: number;
  contactNumber: string;
  status: 'Open' | 'Full' | 'Closed';
}

export interface Hospital {
  id: string;
  name: string;
  nameHi: string;
  latitude: number;
  longitude: number;
  address: string;
  addressHi: string;
  availableBeds: number;
  contactNumber: string;
  specialty: string;
}

export interface DispatchStatus {
  incidentId: string;
  dispatchedTeam: string;
  vehicleType: string;
  etaMinutes: number;
}
