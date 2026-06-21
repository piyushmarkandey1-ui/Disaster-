import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, Shelter, Hospital, IncidentStatus } from './types';
import DisasterMap from './components/DisasterMap';
import CitizenPortal from './components/CitizenPortal';
import CommandCenter from './components/CommandCenter';
import SheltersList from './components/SheltersList';
import { ShieldAlert, Map, AlertTriangle, BarChart3, Home, Languages, Siren, MessageSquareHeart } from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'report' | 'dashboard' | 'shelters'>('map');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    en: {
      subTitle: 'Unified AI Disaster Response Intelligence Platform',
      navMap: 'Live Incident Map',
      navReport: 'Citizen SOS Portal',
      navDashboard: 'Command Center Cockpit',
      navShelters: 'Safe shelters & Bed Centers',
      langLabel: 'हि (Hindi)',
      footerTag: 'Emergency Broadcast Core • Operates with server-side Gemini 3.5 Triage Protocol',
      loadingMsg: 'Analyzing Emergency Matrix Coordinates...',
    },
    hi: {
      subTitle: 'एकीकृत कृत्रिम बुद्धिमत्ता (AI) आपदा प्रतिक्रिया मंच',
      navMap: 'लाइव आपदा मानचित्र',
      navReport: 'नागरिक एसओएस (SOS) पोर्टल',
      navDashboard: 'कमांड सेंटर कॉकपिट',
      navShelters: 'सुरक्षित आश्रय और बेड केंद्र',
      langLabel: 'Eng (English)',
      footerTag: 'आपातकालीन राष्ट्रीय प्रसारण • सर्वर-साइड जेमिनी 3.5 विश्लेषण प्रोटोकॉल के साथ कार्यरत',
      loadingMsg: 'आपातकालीन समन्वय निर्देशांकों का आंकलन किया जा रहा है...',
    }
  }[lang];

  // 1. Initial Data Load
  useEffect(() => {
    async function loadResources() {
      try {
        const [incRes, shelterRes, hospitalRes] = await Promise.all([
          fetch('/api/incidents'),
          fetch('/api/shelters'),
          fetch('/api/hospitals')
        ]);

        if (!incRes.ok || !shelterRes.ok || !hospitalRes.ok) {
          throw new Error('Some API resources failed to load.');
        }

        const [incList, shelterList, hospList] = await Promise.all([
          incRes.json(),
          shelterRes.json(),
          hospitalRes.json()
        ]);

        setIncidents(incList);
        setShelters(shelterList);
        setHospitals(hospList);

        // Pre-select first priority incident to fill map detailed panel
        if (incList.length > 0) {
          setSelectedIncident(incList[0]);
        }
      } catch (err: any) {
        setErrorMsg('Communication failure with emergency backend: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  // 2. Incident Handlers
  const handleReportSubmitted = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    // Auto switch to command center for visual details review
    setActiveTab('map');
  };

  const handleUpdateStatus = async (id: string, status: IncidentStatus, team?: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedTeam: team })
      });

      if (!response.ok) {
        throw new Error('Failed to update incident in database.');
      }

      const updatedIncident: Incident = await response.json();
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updatedIncident : inc)));
      
      if (selectedIncident?.id === id) {
        setSelectedIncident(updatedIncident);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateOccupancy = async (id: string, occupancy: number) => {
    try {
      const response = await fetch(`/api/shelters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentOccupancy: occupancy })
      });

      if (!response.ok) {
        throw new Error('Failed to synchronize shelter occupancy.');
      }

      const updatedShelter: Shelter = await response.json();
      setShelters((prev) => prev.map((s) => (s.id === id ? updatedShelter : s)));
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans p-6" id="loading-page">
        <div className="relative mb-6">
          <Siren className="w-12 h-12 text-rose-500 animate-bounce" />
          <div className="absolute inset-0 bg-rose-500/10 rounded-full filter blur-xl scale-125 animate-pulse" />
        </div>
        <h3 className="font-extrabold text-lg tracking-wider animate-pulse mb-1.5 font-mono">RESCUEAI CONTROL CORE</h3>
        <p className="text-xs text-slate-400 font-medium">{t.loadingMsg}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white font-sans selection:bg-orange-500 selection:text-slate-950 flex flex-col justify-between" id="rescue-app-root">
      {/* HEADER BAR */}
      <header className="bg-slate-900/45 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-[1000] px-4 py-3 md:px-8 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-lg shadow-black/20" id="navbar-header">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center">
              <Siren className="w-5 h-5 text-rose-500" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              RescueAI
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold block tracking-wider uppercase">{t.subTitle}</span>
          </div>
        </div>

        {/* NAVIGATION TAB CONTROLLERS */}
        <nav className="flex flex-wrap gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl" id="tab-nav-panel">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 font-medium cursor-pointer ${
              activeTab === 'map'
                ? 'bg-slate-900 text-orange-400 border border-slate-800 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{t.navMap}</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 font-medium cursor-pointer ${
              activeTab === 'report'
                ? 'bg-slate-900 text-orange-400 border border-slate-800 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <span>{t.navReport}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('dashboard');
              // Ensure we don't hold maps overlays in stale states
            }}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 font-medium cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-orange-400 border border-slate-800 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{t.navDashboard}</span>
          </button>

          <button
            onClick={() => setActiveTab('shelters')}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-all flex items-center gap-2 font-medium cursor-pointer ${
              activeTab === 'shelters'
                ? 'bg-slate-900 text-orange-400 border border-slate-800 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">{t.navShelters}</span>
          </button>
        </nav>

        {/* LANGUAGE SWITCHER */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-750 text-xs rounded-lg text-slate-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
          id="lang-toggle-btn"
        >
          <Languages className="w-3.5 h-3.5 text-orange-400" />
          <span>{lang === 'en' ? 'हि (Hindi)' : 'English'}</span>
        </button>
      </header>

      {/* RENDER ACTIVE TAB WITH MOTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8" id="primary-viewports">
        <AnimatePresence mode="wait">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-rose-500 text-xs p-4 mb-4 rounded-xl flex items-center gap-3">
              <Siren className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Full size Leaflet map (takes 3 grid modules) */}
                <div className="lg:col-span-3">
                  <DisasterMap
                    incidents={incidents}
                    shelters={shelters}
                    hospitals={hospitals}
                    onSelectIncident={setSelectedIncident}
                    selectedIncident={selectedIncident}
                    lang={lang}
                  />
                </div>

                {/* Left Mini list for quick selection on maps page (takes 1 grid module) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between max-h-[650px] md:max-h-[700px]">
                  <div className="space-y-3">
                    <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                      <span className="text-xs uppercase font-black tracking-widest text-slate-500">Active Alert Feeds</span>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
                      <AnimatePresence initial={false}>
                        {incidents.slice(0, 5).map((inc) => (
                          <motion.div
                            key={inc.id}
                            initial={{ opacity: 0, height: 0, y: -15 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -15 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                            onClick={() => setSelectedIncident(inc)}
                            className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                              selectedIncident?.id === inc.id
                                ? 'bg-slate-950 border-orange-500/50 shadow-md ring-1 ring-orange-500/10'
                                : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                            }`}
                          >
                            <div className="flex justify-between text-[11px] font-bold text-white mb-1">
                              <span className="truncate">{inc.disasterType}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-wider ${
                                inc.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-slow-pulse' : 'bg-orange-500/20 text-orange-400 border border-orange-500/10'
                              }`}>{inc.severity}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{inc.description}"</p>
                            <span className="text-[9px] text-slate-550 font-mono block mt-1.5">{inc.location.address}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3">
                    <button
                      onClick={() => setActiveTab('report')}
                      className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-650 hover:to-orange-650 text-slate-950 font-extrabold text-xs rounded-xl transition text-center shadow-md cursor-pointer"
                    >
                      Broadcast New SOS Alert
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CitizenPortal onReportSubmitted={handleReportSubmitted} lang={lang} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CommandCenter
                incidents={incidents}
                onUpdateStatus={handleUpdateStatus}
                onSelectIncident={setSelectedIncident}
                selectedIncident={selectedIncident}
                lang={lang}
              />
            </motion.div>
          )}

          {activeTab === 'shelters' && (
            <motion.div
              key="shelters-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <SheltersList
                shelters={shelters}
                hospitals={hospitals}
                selectedIncident={selectedIncident}
                onUpdateOccupancy={handleUpdateOccupancy}
                lang={lang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER METRICS BAR */}
      <footer className="bg-slate-900/20 border-t border-slate-900 py-4 px-4 text-center text-slate-500 text-[10.5px]" id="app-footer-rail">
        <div className="flex items-center justify-center gap-1.5">
          <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500" />
          <span>{t.footerTag}</span>
        </div>
      </footer>
    </div>
  );
}
