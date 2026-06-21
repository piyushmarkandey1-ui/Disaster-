import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, Shelter, Hospital, IncidentStatus } from './types';
import DisasterMap from './components/DisasterMap';
import CitizenPortal from './components/CitizenPortal';
import CommandCenter from './components/CommandCenter';
import SheltersList from './components/SheltersList';
import Terminology from './components/Terminology';
import { ShieldAlert, Map, AlertTriangle, BarChart3, Home, Languages, Siren, MessageSquareHeart, BookOpen, ChevronRight, Activity, MapPin } from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'report' | 'dashboard' | 'shelters' | 'help'>('map');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    en: {
      subTitle: 'Unified AI Disaster Response Intelligence Platform',
      navMap: 'Live Incident Map',
      navReport: 'Citizen SOS Portal',
      navDashboard: 'Command Center Cockpit',
      navShelters: 'Safe Shelters & Bed Centers',
      navHelp: 'Terminology Guide',
      langLabel: 'हि (Hindi)',
      footerTag: 'Emergency Broadcast Core • Operates with server-side Gemini 3.5 Triage Protocol',
      loadingMsg: 'Analyzing Emergency Matrix Coordinates...',
      activeFeeds: 'Active Alert Feeds',
      broadcastSOS: 'Broadcast New SOS Alert'
    },
    hi: {
      subTitle: 'एकीकृत कृत्रिम बुद्धिमत्ता (AI) आपदा प्रतिक्रिया मंच',
      navMap: 'लाइव आपदा मानचित्र',
      navReport: 'नागरिक एसओएस (SOS) पोर्टल',
      navDashboard: 'कमांड सेंटर कॉकपिट',
      navShelters: 'सुरक्षित आश्रय और बेड केंद्र',
      navHelp: 'शब्दावली गाइड',
      langLabel: 'Eng (English)',
      footerTag: 'आपातकालीन राष्ट्रीय प्रसारण • सर्वर-साइड जेमिनी 3.5 विश्लेषण प्रोटोकॉल के साथ कार्यरत',
      loadingMsg: 'आपातकालीन समन्वय निर्देशांकों का आंकलन किया जा रहा है...',
      activeFeeds: 'सक्रिय अलर्ट फीड',
      broadcastSOS: 'नया SOS अलर्ट भेजें'
    }
  }[lang];

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

  const handleReportSubmitted = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setActiveTab('map');
  };

  const handleUpdateStatus = async (id: string, status: IncidentStatus, team?: string) => {
    try {
      const response = await fetch(`/api/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedTeam: team })
      });

      if (!response.ok) throw new Error('Failed to update incident in database.');

      const updatedIncident: Incident = await response.json();
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updatedIncident : inc)));
      
      if (selectedIncident?.id === id) setSelectedIncident(updatedIncident);
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

      if (!response.ok) throw new Error('Failed to synchronize shelter occupancy.');

      const updatedShelter: Shelter = await response.json();
      setShelters((prev) => prev.map((s) => (s.id === id ? updatedShelter : s)));
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleLanguage = () => setLang((prev) => (prev === 'en' ? 'hi' : 'en'));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
        <div className="relative mb-8 z-10">
          <Siren className="w-16 h-16 text-rose-500 animate-bounce" />
          <div className="absolute inset-0 bg-rose-500/20 rounded-full filter blur-2xl scale-150 animate-pulse" />
        </div>
        <h3 className="font-extrabold text-2xl tracking-widest animate-pulse mb-2 font-mono z-10 bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">RESCUEAI CONTROL CORE</h3>
        <p className="text-sm text-slate-400 font-medium z-10">{t.loadingMsg}</p>
      </div>
    );
  }

  const NavButton = ({ id, icon: Icon, label, accent }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2.5 text-sm rounded-xl transition-all duration-300 flex items-center gap-2.5 font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-${accent}-500/50 ${
        activeTab === id
          ? `bg-slate-800/80 text-${accent}-400 border border-slate-700/50 shadow-lg shadow-${accent}-500/10 transform scale-[1.02]`
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
      }`}
    >
      <Icon className={`w-4.5 h-4.5 shrink-0 ${activeTab === id ? `text-${accent}-400` : ''}`} />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-orange-500 selection:text-slate-950 flex flex-col justify-between overflow-x-hidden relative">
      {/* Background ambient light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER BAR - Premium Glassmorphism */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-[100] px-4 py-3 md:px-6 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/10 group-hover:shadow-rose-500/30 transition-all duration-500">
              <Siren className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              RescueAI
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold block tracking-widest uppercase opacity-80">{t.subTitle}</span>
          </div>
        </div>

        {/* NAVIGATION TAB CONTROLLERS */}
        <nav className="flex flex-wrap items-center gap-2 bg-slate-950/50 backdrop-blur-md border border-slate-800/60 p-1.5 rounded-2xl shadow-inner">
          <NavButton id="map" icon={Map} label={t.navMap} accent="orange" />
          <NavButton id="report" icon={AlertTriangle} label={t.navReport} accent="rose" />
          <NavButton id="dashboard" icon={BarChart3} label={t.navDashboard} accent="blue" />
          <NavButton id="shelters" icon={Home} label={t.navShelters} accent="emerald" />
          <NavButton id="help" icon={BookOpen} label={t.navHelp} accent="purple" />
        </nav>

        {/* LANGUAGE SWITCHER */}
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs rounded-xl text-slate-300 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <Languages className="w-4 h-4 text-orange-400" />
          <span>{lang === 'en' ? 'हि (Hindi)' : 'English'}</span>
        </button>
      </header>

      {/* RENDER ACTIVE TAB WITH MOTION */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 z-10">
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 mb-6 rounded-2xl flex items-center gap-3 backdrop-blur-sm shadow-lg"
            >
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 xl:gap-8">
                {/* Full size Leaflet map (takes 3 grid modules) */}
                <div className="xl:col-span-3 h-[600px] md:h-[700px] xl:h-[800px] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800/80 relative bg-slate-900/50">
                  <DisasterMap
                    incidents={incidents}
                    shelters={shelters}
                    hospitals={hospitals}
                    onSelectIncident={setSelectedIncident}
                    selectedIncident={selectedIncident}
                    lang={lang}
                  />
                </div>

                {/* Left Mini list for quick selection on maps page */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-5 flex flex-col justify-between max-h-[600px] md:max-h-[700px] xl:h-[800px] shadow-xl">
                  <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="border-b border-slate-800/60 pb-3 flex justify-between items-center px-1">
                      <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-500" />
                        {t.activeFeeds}
                      </span>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                      <AnimatePresence initial={false}>
                        {incidents.slice(0, 8).map((inc, i) => (
                          <motion.div
                            key={inc.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                            onClick={() => setSelectedIncident(inc)}
                            className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 group ${
                              selectedIncident?.id === inc.id
                                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-orange-500/40 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/20'
                                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <span className="font-bold text-slate-200 text-sm truncate flex-1 group-hover:text-white transition-colors">{inc.disasterType}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest shrink-0 ${
                                inc.severity === 'Critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                              }`}>{inc.severity}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-medium">"{inc.description}"</p>
                            <div className="mt-2.5 flex items-center justify-between">
                              <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 truncate max-w-[180px]">
                                <MapPin className="w-3 h-3" /> {inc.location.address}
                              </span>
                              <ChevronRight className={`w-3.5 h-3.5 ${selectedIncident?.id === inc.id ? 'text-orange-400' : 'text-slate-600 group-hover:text-slate-400'} transition-colors`} />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-4 mt-4 shrink-0">
                    <button
                      onClick={() => setActiveTab('report')}
                      className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 cursor-pointer flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {t.broadcastSOS}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div key="report-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <CitizenPortal onReportSubmitted={handleReportSubmitted} lang={lang} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div key="dashboard-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
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
            <motion.div key="shelters-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <SheltersList
                shelters={shelters}
                hospitals={hospitals}
                selectedIncident={selectedIncident}
                onUpdateOccupancy={handleUpdateOccupancy}
                lang={lang}
              />
            </motion.div>
          )}

          {activeTab === 'help' && (
            <motion.div key="help-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <Terminology lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER METRICS BAR */}
      <footer className="bg-slate-950/80 backdrop-blur-md border-t border-slate-900 py-4 px-4 text-center text-slate-500 text-[10.5px] relative z-10">
        <div className="flex items-center justify-center gap-1.5 font-medium tracking-wide">
          <MessageSquareHeart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>{t.footerTag}</span>
        </div>
      </footer>
    </div>
  );
}
