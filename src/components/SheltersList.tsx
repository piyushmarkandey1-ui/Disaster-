import React, { useState } from 'react';
import { Shelter, Hospital, Incident } from '../types';
import { Home, ShieldAlert, Heart, Phone, MapPin, Navigation, Dumbbell } from 'lucide-react';

interface SheltersListProps {
  shelters: Shelter[];
  hospitals: Hospital[];
  selectedIncident: Incident | null;
  onUpdateOccupancy: (id: string, occupancy: number) => void;
  lang: 'en' | 'hi';
}

// Haversine distance formula in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth major radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function SheltersList({
  shelters,
  hospitals,
  selectedIncident,
  onUpdateOccupancy,
  lang
}: SheltersListProps) {
  
  const [dispatcherMode, setDispatcherMode] = useState(false);

  const t = {
    en: {
      shelterHeader: 'Emergency Safe Shelters',
      shelterDesc: 'Durable safezones configured with food, medical kits, and blankets. Select an incident in the command center or map to find the nearest shelter.',
      hospitalHeader: 'Specialty Hospitals & Trauma Centers',
      hospitalDesc: 'State medical units with active bed limits and specialty emergency surgical cells.',
      contact: 'Emergency phone number',
      capacity: 'Capacity',
      beds: 'Available medical beds',
      occupancy: 'Update occupancy',
      nearbySelected: 'COMPUTED GPS DISTANCE',
      closestBadge: 'CLOSEST RECOMMENDATION',
      fullStatus: 'MAX CAPACITY REACHED',
      openStatus: 'ROOM AVAILABLE',
    },
    hi: {
      shelterHeader: 'आपातकालीन सुरक्षित आश्रय स्थल',
      shelterDesc: 'तात्कालिक भोजन, चिकित्सा किट और बिस्तरों के साथ स्थापित सुरक्षित केंद्र। निकटतम स्थान खोजने के लिए घटना का चयन करें।',
      hospitalHeader: 'विशेषता अस्पताल एवं ट्रॉमा केंद्र',
      hospitalDesc: 'सक्रिय आपातकालीन बेडों और विशेष चिकित्सा सर्जिकल विंगों वाले राजकीय चिकित्सा केंद्र।',
      contact: 'आपातकालीन संपर्क',
      capacity: 'कुल क्षमता',
      beds: 'उपलब्ध बेड',
      occupancy: 'नया अधिभोग दर्ज करें',
      nearbySelected: 'परिकलित जीपीएस दूरी',
      closestBadge: 'निकटतम अनुशंसित केंद्र',
      fullStatus: 'पूर्ण क्षमता तक पहुंच गया',
      openStatus: 'कमरा उपलब्ध है',
    }
  }[lang];

  // Calculate distance lists if incident is active
  const geoShelters = shelters.map((s) => {
    let distance: number | null = null;
    if (selectedIncident) {
      distance = calculateHaversineDistance(
        selectedIncident.location.latitude,
        selectedIncident.location.longitude,
        s.latitude,
        s.longitude
      );
    }
    return { ...s, distance };
  });

  const geoHospitals = hospitals.map((h) => {
    let distance: number | null = null;
    if (selectedIncident) {
      distance = calculateHaversineDistance(
        selectedIncident.location.latitude,
        selectedIncident.location.longitude,
        h.latitude,
        h.longitude
      );
    }
    return { ...h, distance };
  });

  // Sort by closest if distance calculation exists
  const sortedShelters = [...geoShelters].sort((a, b) => {
    if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
    return 0;
  });

  const sortedHospitals = [...geoHospitals].sort((a, b) => {
    if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* SECTION 1: SHELTERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-400" />
              {t.shelterHeader}
            </h2>
            <p className="text-xs text-slate-400 mt-1 lines-clamp-2 leading-relaxed">
              {t.shelterDesc}
            </p>
          </div>
          
          {/* Dispatcher Mode Toggle */}
          <button
            onClick={() => setDispatcherMode(!dispatcherMode)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-tight transition-all border shrink-0 ${
              dispatcherMode
                ? 'bg-orange-500/15 text-orange-400 border-orange-500/35 shadow shadow-orange-500/10'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {dispatcherMode
              ? (lang === 'en' ? 'Active: Dispatcher Mode' : 'सक्रिय: डिस्पैचर मोड')
              : (lang === 'en' ? 'Go to Dispatcher Mode' : 'डिस्पैचर मोड पर जाएं')}
          </button>
        </div>

        {selectedIncident && (
          <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 text-xs rounded-lg text-indigo-300 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Distance calculated relative to: <strong>{selectedIncident.disasterType}</strong> in {selectedIncident.location.address}.
            </span>
          </div>
        )}

        <div className="space-y-3">
          {sortedShelters.map((shelter, idx) => {
            const isClosest = selectedIncident && idx === 0;
            const percentageUsed = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
            
            return (
              <div
                key={shelter.id}
                className={`p-4 rounded-lg border text-xs text-left relative overflow-hidden transition ${
                  isClosest
                    ? 'bg-slate-950/80 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                    : 'bg-slate-950/40 border-slate-850'
                }`}
              >
                {isClosest && (
                  <span className="absolute top-0 right-0 bg-emerald-500 text-slate-950 px-2 py-0.5 text-[9px] font-black rounded-bl tracking-widest uppercase flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    {t.closestBadge}
                  </span>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {lang === 'hi' ? shelter.nameHi : shelter.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-sans">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      {lang === 'hi' ? shelter.addressHi : shelter.address}
                    </span>
                  </div>
                  {shelter.distance !== null && (
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-tight">{t.nearbySelected}</span>
                      <span className="text-xs text-emerald-400 font-extrabold font-mono tracking-tight">{shelter.distance.toFixed(2)} km</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-850 mb-3 text-slate-400 text-[11px]">
                  <div>
                    <span>{t.contact}:</span>
                    <strong className="text-slate-300 font-mono block mt-0.5">{shelter.contactNumber}</strong>
                  </div>
                  <div>
                    <span>{t.capacity}:</span>
                    <strong className="text-slate-300 block mt-0.5 font-mono">
                      {shelter.currentOccupancy} / {shelter.capacity} ({percentageUsed}%)
                    </strong>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentageUsed >= 90 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentageUsed}%` }}
                    />
                  </div>
                </div>

                {/* Update Occupancy - Dispatcher controls shown ONLY in dispatcher mode */}
                {dispatcherMode && (
                  <div className="mt-3 pt-3 border-t border-slate-850 flex items-center gap-2 justify-between bg-slate-950/60 p-2 rounded-md border border-slate-900/60 transition-all duration-300">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{t.occupancy}</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onUpdateOccupancy(shelter.id, Math.max(0, shelter.currentOccupancy - 5))}
                        className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded font-black font-mono cursor-pointer flex items-center justify-center text-xs transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-white">{shelter.currentOccupancy}</span>
                      <button
                        onClick={() => onUpdateOccupancy(shelter.id, Math.min(shelter.capacity, shelter.currentOccupancy + 5))}
                        className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-white rounded font-black font-mono cursor-pointer flex items-center justify-center text-xs transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: HOSPITALS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-cyan-400" />
            {t.hospitalHeader}
          </h2>
          <p className="text-xs text-slate-400 mt-1 lines-clamp-2 leading-relaxed">
            {t.hospitalDesc}
          </p>
        </div>

        <div className="space-y-3">
          {sortedHospitals.map((hospital, idx) => {
            const isClosest = selectedIncident && idx === 0;
            return (
              <div
                key={hospital.id}
                className={`p-4 rounded-lg border text-xs text-left relative overflow-hidden transition ${
                  isClosest
                    ? 'bg-slate-950/80 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/40 border-slate-850'
                }`}
              >
                {isClosest && (
                  <span className="absolute top-0 right-0 bg-cyan-500 text-slate-950 px-2 py-0.5 text-[9px] font-black rounded-bl tracking-widest uppercase flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {t.closestBadge}
                  </span>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {lang === 'hi' ? hospital.nameHi : hospital.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-sans">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      {lang === 'hi' ? hospital.addressHi : hospital.address}
                    </span>
                  </div>
                  {hospital.distance !== null && (
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono tracking-tight">{t.nearbySelected}</span>
                      <span className="text-xs text-cyan-400 font-extrabold font-mono tracking-tight">{hospital.distance.toFixed(2)} km</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-850 mb-1 text-slate-400 text-[11px]">
                  <div>
                    <span>{t.contact}:</span>
                    <strong className="text-slate-300 font-mono block mt-0.5">{hospital.contactNumber}</strong>
                  </div>
                  <div>
                    <span>{t.beds}:</span>
                    <strong className="text-cyan-400 block mt-0.5 font-bold font-mono">{hospital.availableBeds} beds available</strong>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-500 mt-2">
                  Specialty Medical Grid: <strong className="text-slate-400 font-medium">{hospital.specialty}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
