import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Incident, IncidentStatus, SeverityLevel } from '../types';
import { AlertCircle, ShieldEllipsis, ShieldCheck, Siren, Users, Calendar, Sparkles, Filter, CheckCircle, Search, MapPin } from 'lucide-react';

interface CommandCenterProps {
  incidents: Incident[];
  onUpdateStatus: (id: string, status: IncidentStatus, team?: string) => void;
  onSelectIncident: (incident: Incident) => void;
  selectedIncident: Incident | null;
  lang: 'en' | 'hi';
}

export default function CommandCenter({
  incidents,
  onUpdateStatus,
  onSelectIncident,
  selectedIncident,
  lang
}: CommandCenterProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | IncidentStatus>('All');
  const [severityFilter, setSeverityFilter] = useState<'All' | SeverityLevel>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dispatch fields state
  const [teamInput, setTeamInput] = useState('');
  const [submittingDispatch, setSubmittingDispatch] = useState<string | null>(null);

  const t = {
    en: {
      statsHeader: 'National Rescue Matrix Analytics',
      totalEmergency: 'Total Incidents',
      criticalLevel: 'Critical Severity',
      activeDispatch: 'Active Rescue Crews',
      resolvedTitle: 'Resolved Disasters',
      filterTitle: 'Live Incident Streams',
      allOption: 'All',
      searchHolder: 'Search location address, description or type...',
      emptyList: 'No registered alerts match these filters.',
      hazardHeader: 'Emergency Incident List',
      idLabel: 'ID',
      impactLabel: 'AFFECTED CIVILIAN IMPACT',
      priorityLabel: 'PRIORITY TRIAGE RATING',
      updatesLog: 'AI Rescue Chronology',
      dispatchBtn: 'Deploy NDRF Dispatch Team',
      resolveBtn: 'Mark Disaster Resolved',
      assignedTeamLabel: 'Assigned Response Unit',
      locationLabel: 'Incident Address',
      recLabel: 'AI Extracted Response Recommendations',
    },
    hi: {
      statsHeader: 'राष्ट्रीय आपदा प्रतिक्रिया विश्लेषण',
      totalEmergency: 'कुल आपदा मामले',
      criticalLevel: 'गंभीर तीव्रता',
      activeDispatch: 'सक्रिय बचाव दल',
      resolvedTitle: 'सुलझाए गए मामले',
      filterTitle: 'घटना सूची नियंत्रण',
      allOption: 'सभी',
      searchHolder: 'स्थान, पता, या विवरण खोजें...',
      emptyList: 'कोई घटना इस फिल्टर से मेल नहीं खाती है।',
      hazardHeader: 'आपदा रिपोर्ट सूची',
      idLabel: 'आईडी',
      impactLabel: 'प्रभावित नागरिकों की संख्या',
      priorityLabel: 'वर्गीकृत प्राथमिकता रेटिंग',
      updatesLog: 'बचाव समयरेखा इतिहास',
      dispatchBtn: 'एनडीआरएफ बचाव दल तैनात करें',
      resolveBtn: 'आपदा को हल घोषित करें',
      assignedTeamLabel: 'नियुक्त बचाव दल का नाम',
      locationLabel: 'आपदा का पता',
      recLabel: 'एआई द्वारा तैयार बचाव निर्देश',
    }
  }[lang];

  // Calculations for stats meters
  const totalCount = incidents.length;
  const criticalCount = incidents.filter(inc => inc.severity === 'Critical').length;
  const dispatchedCount = incidents.filter(inc => inc.status === 'Dispatched').length;
  const resolvedCount = incidents.filter(inc => inc.status === 'Completed').length;

  const filteredIncidents = incidents.filter(inc => {
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || inc.severity === severityFilter;
    const matchesSearch = inc.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.disasterType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  const handleDispatchSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!teamInput.trim()) return;

    setSubmittingDispatch(id);
    // Simulate slight dispatch animation block
    setTimeout(() => {
      onUpdateStatus(id, 'Dispatched', teamInput);
      setTeamInput('');
      setSubmittingDispatch(null);
    }, 800);
  };

  const handleResolve = (id: string) => {
    onUpdateStatus(id, 'Completed');
  };

  return (
    <div className="space-y-6">
      {/* 1. Stat Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1: Total incidents */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-xl transition group-hover:bg-blue-500/10" />
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-500 block uppercase tracking-wider">{t.totalEmergency}</span>
            <span className="text-2xl font-extrabold text-blue-400 block">{totalCount}</span>
          </div>
          <div className="w-10 h-10 bg-blue-500/5 rounded-lg flex items-center justify-center border border-blue-500/10">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Stat 2: Critical Severity */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full filter blur-xl transition group-hover:bg-red-500/10" />
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-500 block uppercase tracking-wider">{t.criticalLevel}</span>
            <span className="text-2xl font-extrabold text-rose-500 block">{criticalCount}</span>
          </div>
          <div className="w-10 h-10 bg-red-500/5 rounded-lg flex items-center justify-center border border-red-500/10">
            <Siren className="w-5 h-5 text-rose-500 animate-pulse" />
          </div>
        </div>

        {/* Stat 3: Dispatched Crews */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full filter blur-xl transition group-hover:bg-orange-500/10" />
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-500 block uppercase tracking-wider">{t.activeDispatch}</span>
            <span className="text-2xl font-extrabold text-orange-400 block">{dispatchedCount}</span>
          </div>
          <div className="w-10 h-10 bg-orange-500/5 rounded-lg flex items-center justify-center border border-orange-500/10">
            <ShieldEllipsis className="w-5 h-5 text-orange-400" />
          </div>
        </div>

        {/* Stat 4: Resolved operations */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full filter blur-xl transition group-hover:bg-emerald-500/10" />
          <div className="space-y-1">
            <span className="text-[10.5px] font-bold text-slate-500 block uppercase tracking-wider">{t.resolvedTitle}</span>
            <span className="text-2xl font-extrabold text-emerald-400 block">{resolvedCount}</span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/5 rounded-lg flex items-center justify-center border border-emerald-500/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 2. Visual Analytics Metrics: Chart Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric A: Severity Load Breakdown Meter */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
            INCIDENT LOAD BY SEVERITY
          </h4>
          <div className="space-y-2.5">
            {/* Critical */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-red-400 font-semibold uppercase">Critical (Red Flag)</span>
                <span className="text-slate-400 font-mono">
                  {incidents.filter(i => i.severity === 'Critical').length} incidents
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${incidents.length ? (incidents.filter(i => i.severity === 'Critical').length / incidents.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* High */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-orange-400 font-semibold uppercase">High Alert</span>
                <span className="text-slate-400 font-mono px-1">
                  {incidents.filter(i => i.severity === 'High').length} incidents
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full" 
                  style={{ width: `${incidents.length ? (incidents.filter(i => i.severity === 'High').length / incidents.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium & Low Combined */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-yellow-400 font-semibold uppercase">Standard Emergency</span>
                <span className="text-slate-400 font-mono px-1">
                  {incidents.filter(i => i.severity === 'Medium' || i.severity === 'Low').length} incidents
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${incidents.length ? (incidents.filter(i => i.severity === 'Medium' || i.severity === 'Low').length / incidents.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric B: Category Spread Map */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:col-span-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
            DISASTER CATEGORY DISPATCH DISTRIBUTION
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {['Flood', 'Fire', 'Earthquake', 'Other'].map((type) => {
              const count = incidents.filter(i => i.disasterType.includes(type) || (type === 'Other' && !['Flood','Fire','Earthquake'].some(t => i.disasterType.includes(t)))).length;
              const percentage = totalCount ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={type} className="p-2.5 bg-slate-950 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">{type}</span>
                  <span className="text-base font-black text-white">{count}</span>
                  {/* Miniature ring simulator */}
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-600 block mt-1">{percentage}% Load</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Incidents Filter Controls Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5 uppercase mr-2 text-slate-400">
              <Filter className="w-3.5 h-3.5 text-orange-400" />
              {t.filterTitle}
            </span>

            {/* Status filters */}
            <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex gap-1">
              {['All', 'Reported', 'Dispatched', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st as any)}
                  className={`px-3 py-1 text-[10.5px] rounded transition-colors ${
                    statusFilter === st
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 font-semibold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {st === 'All' ? t.allOption : st}
                </button>
              ))}
            </div>

            {/* Severity filters */}
            <div className="bg-slate-950 p-0.5 rounded-lg border border-slate-800 flex gap-1">
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev as any)}
                  className={`px-3 py-1 text-[10.5px] rounded transition-colors ${
                    severityFilter === sev
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20 font-semibold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {sev === 'All' ? t.allOption : sev}
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchHolder}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* 4. Split panel layout: Left List, Right Detail Triage control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Incidents Stream (8 columns on large screens) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-2">
            {t.hazardHeader} ({filteredIncidents.length})
          </h3>

          {filteredIncidents.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-xs text-slate-600 block">{t.emptyList}</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`p-3.5 rounded-lg border transition-all text-xs cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-950/60 border-orange-500/50 shadow-md shadow-orange-500/5'
                        : 'bg-slate-950/30 border-slate-850 hover:bg-slate-950 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          inc.severity === 'Critical' ? 'bg-red-500' :
                          inc.severity === 'High' ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`} />
                        <h4 className="font-bold text-white text-[13px]">{inc.disasterType}</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[9px] text-slate-600 uppercase block">{t.idLabel} # {inc.id.slice(-6)}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(inc.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 line-clamp-2 leading-relaxed mb-3 font-sans italic">
                      "{inc.description}"
                    </p>

                    <div className="flex flex-wrap gap-y-2 justify-between items-center text-[10.5px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate max-w-xs">{inc.location.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>Trapped: <strong className="text-slate-300">{inc.affectedPeople}</strong></span>
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider ${
                          inc.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          inc.status === 'Dispatched' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-red-500/10 text-rose-500'
                        }`}>
                          {inc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Detail & Incident Action Triage Board (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedIncident ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full filter blur-3xl" />
              
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${
                      selectedIncident.severity === 'Critical' ? 'bg-red-500/10 text-red-400' :
                      selectedIncident.severity === 'High' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {selectedIncident.severity} Severity
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                      {selectedIncident.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedIncident.disasterType}</h3>
                </div>

                <div className="text-right p-1.5 bg-slate-950 border border-slate-800 rounded-lg min-w-16">
                  <span className="text-[9px] text-slate-500 bold block uppercase tracking-wider">TRIAGE SCORE</span>
                  <span className="text-xl font-black text-rose-500 font-mono tracking-tight">{selectedIncident.priorityScore}/10</span>
                </div>
              </div>

              {/* Citizen Description Card */}
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg text-xs space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  <span>CITIZEN FEED & PHOTO</span>
                  <span className="font-mono">{new Date(selectedIncident.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-300 leading-relaxed italic">
                  "{selectedIncident.description}"
                </p>

                {selectedIncident.imageUrl && (
                  <div className="mt-2.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                    <img 
                      src={selectedIncident.imageUrl} 
                      alt="Citizen raw capture" 
                      className="w-full h-32 object-cover rounded" 
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 pt-2 gap-2 text-slate-500 text-[10.5px]">
                  <div>Reporter: <strong className="text-slate-300 font-medium">{selectedIncident.reporterName}</strong></div>
                  <div>Contact: <strong className="text-slate-300 font-mono">{selectedIncident.reporterContact}</strong></div>
                </div>
              </div>

              {/* Coordinates Address */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs space-y-1">
                <span className="text-slate-500 uppercase text-[9px] tracking-wider block">{t.locationLabel}</span>
                <p className="text-slate-300 font-sans font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  {selectedIncident.location.address}
                </p>
                <div className="text-[10px] text-slate-600 font-mono pt-1">
                  Lat: {selectedIncident.location.latitude.toFixed(5)} / Lng: {selectedIncident.location.longitude.toFixed(5)}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-lg space-y-2 text-xs">
                <span className="text-[9.5px] font-bold text-orange-400 block tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  {t.recLabel}
                </span>
                <ul className="text-slate-300 space-y-1 my-1.5 list-disc list-inside">
                  {selectedIncident.recommendedActions.map((act, i) => (
                    <li key={i} className="leading-relaxed list-none flex items-start gap-1">
                      <span className="text-rose-500 font-bold mr-1">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dispatch / Update Operations Controls */}
              <div className="space-y-3 pt-2">
                {selectedIncident.status === 'Reported' && (
                  <form onSubmit={(e) => handleDispatchSubmit(e, selectedIncident.id)} className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">
                      {t.assignedTeamLabel}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={teamInput}
                        onChange={(e) => setTeamInput(e.target.value)}
                        placeholder="e.g. NDRF Boat Rescue Team 11"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingDispatch !== null}
                        className="py-1 px-3 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-slate-950 text-xs font-bold rounded-lg shrink-0 flex items-center justify-center transition"
                      >
                        {submittingDispatch === selectedIncident.id ? 'Deploying...' : t.dispatchBtn}
                      </button>
                    </div>
                  </form>
                )}

                {selectedIncident.status === 'Dispatched' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-500/5 border border-orange-500/20 text-xs text-orange-300 rounded-lg">
                      🛡️ Currently En Route: <strong className="text-white font-mono">{selectedIncident.assignedTeam}</strong>
                    </div>

                    <button
                      onClick={() => handleResolve(selectedIncident.id)}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs rounded-lg transition text-center flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-slate-950 animate-pulse" />
                      <span>{t.resolveBtn}</span>
                    </button>
                  </div>
                )}

                {selectedIncident.status === 'Completed' && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 rounded-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>The operation for this disaster alert is completed and resolved. All citizens rescued.</span>
                  </div>
                )}
              </div>

              {/* Rescue Log Timeline */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[9px] text-slate-500 block uppercase tracking-wider">{t.updatesLog}</span>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {selectedIncident.updates?.map((log, u) => (
                    <div key={u} className="text-[10px] text-slate-400 border-l border-slate-800 pl-2 pb-1 last:pb-0">
                      • {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 h-full flex flex-col justify-center items-center">
              <Siren className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-xs">
                {lang === 'en'
                  ? 'Select an active disaster incident checklist to dispatch crews, trigger state overrides, and inspect logs.'
                  : 'सक्रिय बचाव दल तैनात करने, राज्य ओवरराइड प्रतिक्रिया को सक्रिय करने और लॉग्स की जांच के लिए आपदा मामले का चयन करें।'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
