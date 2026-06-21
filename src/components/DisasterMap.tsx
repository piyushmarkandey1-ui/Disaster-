import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, Shelter, Hospital } from '../types';
import { MapPin, Phone, Users, ShieldAlert, HeartHandshake } from 'lucide-react';

interface DisasterMapProps {
  incidents: Incident[];
  shelters: Shelter[];
  hospitals: Hospital[];
  onSelectIncident: (incident: Incident | null) => void;
  selectedIncident: Incident | null;
  lang: 'en' | 'hi';
}

export default function DisasterMap({
  incidents,
  shelters,
  hospitals,
  onSelectIncident,
  selectedIncident,
  lang
}: DisasterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);

  const t = {
    en: {
      mapTitle: 'Disaster Coordination Map',
      activeIncidents: 'Active Incidents',
      emergencyShelters: 'Safe shelters',
      medicalFacilities: 'Medical facilities',
      reporter: 'Reporter',
      severity: 'Severity',
      priority: 'Priority Score',
      peopleTrapped: 'Trapped/Affected',
      status: 'Status',
      actions: 'Recommended Actions',
      loading: 'Initializing maps...',
    },
    hi: {
      mapTitle: 'आपदा समन्वय मानचित्र',
      activeIncidents: 'सक्रिय मामले',
      emergencyShelters: 'सुरक्षित आश्रय स्थल',
      medicalFacilities: 'चिकित्सा सुविधाएं',
      reporter: 'रिपोर्टर',
      severity: 'तीव्रता',
      priority: 'प्राथमिकता स्कोर',
      peopleTrapped: 'फंसे हुए / प्रभावित',
      status: 'स्थिति',
      actions: 'अनुशंसित कार्रवाइयां',
      loading: 'मानचित्र शुरू किया जा रहा है...',
    }
  }[lang];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on New Delhi coordinates as default
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 11,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false // bottom-right zoom control looks cleaner
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark styled map tiles (perfect for modern SaaS dashboard)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    const markersLayer = L.featureGroup().addTo(map);

    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update markers when incidents, shelters, or hospitals change
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Plot Incidents as high-tech glowing circle markers
    incidents.forEach((inc) => {
      const { latitude, longitude } = inc.location;
      
      // Determine marker specifications based on severity
      let color = '#3b82f6'; // Blue
      let fillColor = '#60a5fa';
      if (inc.severity === 'Critical') {
        color = '#ef4444'; // Red
        fillColor = '#f87171';
      } else if (inc.severity === 'High') {
        color = '#f97316'; // Orange
        fillColor = '#fb923c';
      } else if (inc.severity === 'Medium') {
        color = '#eab308'; // Yellow
        fillColor = '#fde047';
      }

      const isSelected = selectedIncident && selectedIncident.id === inc.id;

      const circle = L.circleMarker([latitude, longitude], {
        radius: isSelected ? 16 : 10,
        color: color,
        weight: isSelected ? 3 : 2,
        fillColor: fillColor,
        fillOpacity: 0.7,
        className: inc.severity === 'Critical' ? 'animate-pulse' : ''
      });

      // Bind dynamic beautiful popup
      const popupContent = `
        <div class="p-2 font-sans bg-slate-900 text-white rounded-lg max-w-xs" style="color:#ffffff;">
          <div class="flex items-center gap-1.5 font-bold text-sm border-b border-slate-700 pb-1 mb-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
            <span>${inc.disasterType}</span>
            <span class="ml-auto text-xs px-1.5 py-0.5 rounded bg-slate-800">${inc.severity}</span>
          </div>
          <p class="text-xs text-slate-300 line-clamp-2 mb-2 italic">"${inc.description}"</p>
          <div class="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-slate-400 mb-2">
            <div><strong>Priority:</strong> ${inc.priorityScore}/10</div>
            <div><strong>Trapped:</strong> ${inc.affectedPeople}</div>
            <div class="col-span-2"><strong>Status:</strong> <span class="text-blue-400">${inc.status}</span></div>
          </div>
          <div class="text-[10px] text-slate-500 border-t border-slate-800 pt-1">
            ${inc.location.address}
          </div>
        </div>
      `;

      circle.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      circle.on('click', () => {
        onSelectIncident(inc);
      });

      circle.addTo(markersLayer);
    });

    // 2. Plot Shelters as solid green diamonds/circles
    shelters.forEach((shelter) => {
      const color = shelter.status === 'Full' ? '#ea580c' : '#16a34a'; // Green/Orange
      const circle = L.circleMarker([shelter.latitude, shelter.longitude], {
        radius: 8,
        color: '#047857',
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.8
      });

      const popupContent = `
        <div class="p-2 font-sans bg-slate-900 text-white rounded-lg text-xs" style="color:#ffffff;">
          <div class="flex items-center gap-1 font-bold text-emerald-400 border-b border-slate-700 pb-1 mb-1">
            <span>🛡️ ${lang === 'hi' ? shelter.nameHi : shelter.name}</span>
          </div>
          <p class="text-[10px] text-slate-300"><strong>Capacity:</strong> ${shelter.currentOccupancy}/${shelter.capacity}</p>
          <p class="text-[10px] text-slate-300"><strong>Contact:</strong> ${shelter.contactNumber}</p>
          <p class="text-[10.5px] mt-1 text-emerald-500 font-semibold">${shelter.status}</p>
        </div>
      `;

      circle.bindPopup(popupContent, { closeButton: false });
      circle.addTo(markersLayer);
    });

    // 3. Plot Hospitals as blue cross points
    hospitals.forEach((hosp) => {
      const circle = L.circleMarker([hosp.latitude, hosp.longitude], {
        radius: 7,
        color: '#06b6d4', // Cyan
        weight: 1.5,
        fillColor: '#0891b2',
        fillOpacity: 0.8
      });

      const popupContent = `
        <div class="p-2 font-sans bg-slate-900 text-white rounded-lg text-xs" style="color:#ffffff;">
          <div class="flex items-center gap-1 font-bold text-cyan-400 border-b border-slate-700 pb-1 mb-1">
            <span>🏥 ${lang === 'hi' ? hosp.nameHi : hosp.name}</span>
          </div>
          <p class="text-[10px] text-slate-300"><strong>Available Beds:</strong> ${hosp.availableBeds}</p>
          <p class="text-[10px] text-slate-400"><strong>Specialty:</strong> ${hosp.specialty}</p>
        </div>
      `;

      circle.bindPopup(popupContent, { closeButton: false });
      circle.addTo(markersLayer);
    });

  }, [incidents, shelters, hospitals, selectedIncident, lang]);

  // Teleport map center to selected incident and trigger redraw
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedIncident) {
      const { latitude, longitude } = selectedIncident.location;
      mapRef.current.setView([latitude, longitude], 14, {
        animate: true,
        duration: 1
      });
    }
    // Setup a slight delayed resize to ensure map fits beautifully with the sidebar layout
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-[650px] md:h-[700px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090d16] flex flex-col md:flex-row">
      
      {/* Left side: Actual Map Container */}
      <div className="relative flex-1 h-full min-w-0 bg-[#090d16]">
        <div ref={mapContainerRef} className="w-full h-full z-10 bg-[#090d16]" id="incidents-coords-map" />
        
        {/* Header PanelOverlay */}
        <div className="absolute top-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800 shadow-lg text-white max-w-sm">
          <h3 className="font-sans font-semibold tracking-tight text-sm text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            {t.mapTitle}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {lang === 'en' 
              ? 'Unified, real-time crisis coordinates plotted overlaying satellite metrics.'
              : 'उपग्रह मापदंडों को कवर करने वाले एकीकृत, रीयल-टाइम संकट निर्देशांक।'}
          </p>

          {/* Legend */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 grid grid-cols-2 gap-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-pulse"></span>
              <span className="text-slate-300">{lang === 'en' ? 'Critical (Severe)' : 'गंभीर आपदा'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
              <span className="text-slate-300">{lang === 'en' ? 'High Hazard' : 'उच्च ख़तरा'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
              <span className="text-slate-300">{t.emergencyShelters}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 block"></span>
              <span className="text-slate-300">{t.medicalFacilities}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Slide-in/out Docked Details Panel */}
      <AnimatePresence mode="wait">
        {selectedIncident && (
          <motion.div
            key={selectedIncident.id}
            initial={{ opacity: 0, x: 280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950 flex flex-col h-[320px] md:h-full z-[400] shrink-0 p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-850">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                  selectedIncident.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  selectedIncident.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {selectedIncident.severity} Severity
                </span>
                <h4 className="font-bold text-base text-white mt-1.5 flex items-center gap-2">
                  {selectedIncident.disasterType}
                </h4>
              </div>
              <div className="text-right bg-slate-900 border border-slate-800 rounded p-1.5 min-w-16">
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider">{t.priority}</span>
                <span className="text-lg font-black text-rose-500 font-mono tracking-tight">{selectedIncident.priorityScore}/10</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="bg-slate-900/60 border border-slate-850/80 p-3 rounded-lg text-xs italic text-slate-300 leading-relaxed">
                "{selectedIncident.description}"
              </div>

              {selectedIncident.imageUrl && (
                <div className="p-1 bg-slate-900 border border-slate-800 rounded-lg">
                  <img 
                    src={selectedIncident.imageUrl} 
                    alt="Citizen report" 
                    className="w-full h-28 object-cover rounded" 
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/40 rounded-lg border border-slate-850/60 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] block">{t.peopleTrapped}</span>
                  <span className="text-white font-medium flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    {selectedIncident.affectedPeople}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] block">{t.status}</span>
                  <span className="text-blue-400 font-semibold uppercase text-[10.5px]">
                    {selectedIncident.status}
                  </span>
                </div>
                <div className="col-span-2 space-y-0.5 pt-1 border-t border-slate-800/60">
                  <span className="text-slate-500 text-[10px] block">Coordinates</span>
                  <span className="text-[10.5px] text-slate-300 font-mono">
                    {selectedIncident.location.latitude.toFixed(5)} / {selectedIncident.location.longitude.toFixed(5)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-900/40 rounded-lg border border-slate-850/80">
                <span className="text-slate-400 text-[10.5px] font-semibold block">{t.actions}</span>
                <ul className="text-[11px] text-slate-300 space-y-1">
                  {selectedIncident.recommendedActions.slice(0, 3).map((act, i) => (
                    <li key={i} className="flex gap-1.5 items-start">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-850 flex gap-2">
              {selectedIncident.assignedTeam && (
                <div className="text-[11px] bg-slate-900 border border-slate-800 rounded px-2 py-1 w-full flex items-center gap-1 min-w-0">
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="text-slate-400 font-mono truncate">{selectedIncident.assignedTeam}</span>
                </div>
              )}
              <button
                onClick={() => onSelectIncident(null)}
                className="text-xs px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white rounded text-slate-300 transition shrink-0 ml-auto cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
