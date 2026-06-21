import React, { useState, useRef } from 'react';
import { Incident, DisasterType } from '../types';
import { Camera, MapPin, Send, AlertTriangle, Image as ImageIcon, Flame, Droplet, Hammer, CheckCircle } from 'lucide-react';

interface CitizenPortalProps {
  onReportSubmitted: (incident: Incident) => void;
  lang: 'en' | 'hi';
}

const PRESET_MOCK_IMAGES = [
  {
    name: 'Flooded Street / बाढ़ की सड़क',
    type: 'Flood',
    desc: 'Severe knee-deep flooding blocking roads and structural basement storage.',
    base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
  },
  {
    name: 'Building Smoke Fire / ढांचागत आग',
    type: 'Fire',
    desc: 'Dense black toxic smoke rising from the second-story windows of an residential block.',
    base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
  },
  {
    name: 'Collapsed Wall / ढही हुई दीवार',
    type: 'Earthquake',
    desc: 'Collapsed brick wall blocking transit safety lanes, causing concrete rubble.',
    base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
  }
];

export default function CitizenPortal({ onReportSubmitted, lang }: CitizenPortalProps) {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedMock, setSelectedMock] = useState<number | null>(null);

  // Default coordinate set for New Delhi CP area
  const [latitude, setLatitude] = useState(28.6304);
  const [longitude, setLongitude] = useState(77.2177);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Incident | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      title: 'Report Active Disaster Incident',
      subtitle: 'Submit an emergency alert. RescueAI automatically analyzes the severity, estimates affected residents, and drafts actionable instructions instantly to expedite rescue response.',
      name: 'Your Name (Optional)',
      phone: 'Your Contact Number',
      descLabel: 'Describe the Emergency in Detail',
      descPlaceholder: 'e.g., Water is entering residential ground floors, three children are stranded on an active roof top, current electric lines are submerged...',
      locLabel: 'Emergency Location (Address)',
      locPlaceholder: 'e.g., Pocket A-4, Rohini sector 8, New Delhi',
      latLngLabel: 'Geographic Sat GPS Coordinates',
      imageLabel: 'Attach Crisis Photograph (Upload or Select a Sample Report Scenario)',
      presetInfo: 'Try a Sample Report Scenario: Select to test the emergency analyzer instantly!',
      submitBtn: 'Broadcast SOS Alert',
      submitting: 'Analyzing and Prioritizing Incident Details...',
      newReport: 'Log Another Emergency Alert',
      successTitle: 'Emergency Broadcast Active!',
      successDesc: 'Your emergency request has been analyzed and processed by our emergency coordination system. Details have been registered and prepared for dispatching.'
    },
    hi: {
      title: 'सक्रिय आपदा रिपोर्ट दर्ज करें',
      subtitle: 'आपातकालीन सहायता अनुरोध भेजें। रेस्क्यूएआई तीव्रता और प्राथमिकता का विश्लेषण करने के लिए स्वचालित एआई का उपयोग करता है तथा सीधे बचाव दलों को दिशा-निर्देश प्रदान करता है।',
      name: 'आपका नाम (वैकल्पिक)',
      phone: 'आपका संपर्क नंबर',
      descLabel: 'आपातकाल का विस्तृत विवरण',
      descPlaceholder: 'उदाहरण: ग्राउंड फ्लोर पर पानी भर गया है, दो बिजली के पोल झुक गए हैं और चिंगारी निकल रही है...',
      locLabel: 'आपातकालीन स्थान (पता)',
      locPlaceholder: 'उदाहरण: पॉकेट ए -4, रोहिणी सेक्टर 8, नई दिल्ली',
      latLngLabel: 'भौगोलिक जीपीएस निर्देशांक',
      imageLabel: 'संकट फ़ोटो अटैच करें (अपलोड करें या एक नमूना परिदृश्य चुनें)',
      presetInfo: 'एक नमूना रिपोर्ट आज़माएं: आपातकालीन विश्लेषक का तुरंत परीक्षण करने के लिए किसी एक को चुनें!',
      submitBtn: 'एसओएस अलर्ट प्रसारित करें',
      submitting: 'आपदा विवरण का विश्लेषण और वर्गीकरण किया जा रहा है...',
      newReport: 'एक और अलर्ट दर्ज करें',
      successTitle: 'आपातकालीन अलर्ट सक्रिय!',
      successDesc: 'आपका आपातकालीन अनुरोध हमारे प्रतिक्रिया समन्वय कोर द्वारा संसाधित किया गया है और विवरण पंजीकृत कर दिए गए हैं।'
    }
  }[lang];

  // Map coordinates quick selection based on standard landmarks to ease testing
  const LANDMARKS = [
    { name: 'Connaught Place (CP)', lat: 28.6304, lng: 77.2177, addr: 'Inner Circle, Connaught Place, New Delhi' },
    { name: 'Rohini Sector 7', lat: 28.7056, lng: 77.1120, addr: 'Sector 7 Area, Rohini, New Delhi' },
    { name: 'Dwarka Sector 10', lat: 28.5818, lng: 77.0583, addr: 'Near Dwarka Sector 10 Metro, New Delhi' },
    { name: 'Vasant Kunj B Block', lat: 28.5414, lng: 77.1624, addr: 'Pocket 2, Vasant Kunj, New Delhi' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedMock(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedMock(idx);
    const preset = PRESET_MOCK_IMAGES[idx];
    setImageUrl(preset.base64);
    setDescription(preset.desc);
    
    // Auto populate realistic matching type coordinates slightly offset from Connaught Place
    if (preset.type === 'Flood') {
      setLatitude(28.7082);
      setLongitude(77.1012);
      setAddress('Pocket G-18, Rohini Sector 11, New Delhi');
    } else if (preset.type === 'Fire') {
      setLatitude(28.6290);
      setLongitude(77.2150);
      setAddress('Radial Road 3, Connaught Place, New Delhi');
    } else {
      setLatitude(28.5835);
      setLongitude(77.0550);
      setAddress('Main Road Sector 11, Dwarka, New Delhi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !address) {
      setErrorMsg(lang === 'en' ? 'Description and Address are mandatory.' : 'विवरण और पता अनिवार्य हैं।');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName: reporterName || undefined,
          reporterContact: reporterContact || undefined,
          description,
          latitude,
          longitude,
          address,
          imageUrl: imageUrl || undefined
        })
      });

      if (!response.ok) {
        throw new Error(lang === 'en' ? 'Failed to process report with Gemini server.' : 'जेमिनी सर्वर के साथ रिपोर्ट संसाधित करने में विफल।');
      }

      const completedIncident: Incident = await response.json();
      setSuccess(completedIncident);
      onReportSubmitted(completedIncident);

      // Clear state
      setDescription('');
      setAddress('');
      setReporterName('');
      setReporterContact('');
      setImageUrl(null);
      setSelectedMock(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'An emergency backend communication link occurred.');
    } finally {
      setLoading(false);
    }
  };

  const triggerReset = () => {
    setSuccess(null);
    setErrorMsg('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
      
      {success ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
            {t.successTitle}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
            {t.successDesc}
          </p>

          {/* AI Analyzed details response summary card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-left mb-8 max-w-md mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
              Emergency Response Summary Report
            </span>
            <div className="flex justify-between items-center text-sm font-semibold text-white border-b border-slate-800 pb-2 mb-3">
              <span>{success.disasterType} Incident</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                success.severity === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
              }`}>{success.severity} Priority</span>
            </div>
            
            <div className="space-y-2 mb-3 text-xs">
              <p className="text-slate-300"><strong>Priority Score:</strong> <span className="text-red-400 font-bold font-mono">{success.priorityScore}/10</span></p>
              <p className="text-slate-300"><strong>Est. Affected Citizens:</strong> <span className="font-mono text-slate-300">{success.affectedPeople}</span></p>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <span className="text-[10.5px] font-semibold text-orange-400 block mb-1.5">Action Directives Issued:</span>
              <ul className="text-slate-300 text-xs space-y-1">
                {success.recommendedActions.map((act, i) => (
                  <li key={i} className="flex gap-1.5 items-start">
                    <span className="text-red-500">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={triggerReset}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-lg text-xs transition border border-slate-700 hover:border-slate-600"
          >
            {t.newReport}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-500 animation-pulse" />
              {t.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-rose-400 text-xs p-3.5 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Preset Buttons for Demo */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-[12px] font-bold text-orange-400 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              {t.presetInfo}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_MOCK_IMAGES.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(i)}
                  className={`text-left p-3 rounded-lg border text-xs transition flex flex-col justify-between h-20 ${
                    selectedMock === i
                      ? 'bg-orange-500/10 border-orange-500/50 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-semibold block truncate">{p.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Auto-populates coordinates and description</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left side: descriptions and inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {t.name}
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Rahul Gupta"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {t.phone} <span className="text-slate-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="e.g. +91 9999012345"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {t.descLabel} <span className="text-slate-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Right side: Locations & Image attachment */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {t.locLabel} <span className="text-slate-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.locPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Coordinates Section */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-red-500" />
                  Select Emergency Coordinates Location
                </span>
                
                {/* Visual landmark picker to ease coordinate positioning in simple mock environments */}
                <div className="grid grid-cols-2 gap-1.5">
                  {LANDMARKS.map((lm, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setLatitude(lm.lat);
                        setLongitude(lm.lng);
                        setAddress(lm.addr);
                      }}
                      className="p-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] text-slate-300 truncate text-left transition"
                    >
                      📍 {lm.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 font-mono text-[11px] text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Photograph Attachment */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {t.imageLabel}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 text-xs text-slate-400 hover:text-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>Upload Image</span>
                  </button>

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-950/40 text-xs text-red-500 hover:text-red-400 rounded-lg transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {imageUrl && (
                  <div className="mt-2.5 p-1.5 bg-slate-950 border border-slate-800 rounded-lg">
                    <img
                      src={imageUrl}
                      alt="Disaster preview"
                      className="w-full h-24 object-cover rounded"
                    />
                    <span className="text-[9px] text-slate-500 block text-right mt-1">Image attached successfully</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 flex items-center justify-center gap-1.5 transition shadow-lg shadow-orange-500/20 ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-1" />
                  <span>{t.submitting}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>{t.submitBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
