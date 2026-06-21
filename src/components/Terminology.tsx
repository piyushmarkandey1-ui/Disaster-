import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Activity, AlertCircle, ShieldCheck, MapPin, Search } from 'lucide-react';

interface TerminologyProps {
  lang: 'en' | 'hi';
}

export default function Terminology({ lang }: TerminologyProps) {
  const t = {
    en: {
      title: 'RescueAI Knowledge Base',
      subtitle: 'Understand how our AI triage and emergency handling system operates.',
      sections: [
        {
          icon: <Activity className="w-6 h-6 text-orange-500" />,
          title: "AI Triage & Priority Score (1-10)",
          desc: "Our Google Gemini AI reads emergency reports and assigns a Priority Score from 1 to 10. A score of 10 means immediate life-threatening danger requiring instant deployment. This helps rescue teams prioritize the most critical incidents over minor ones."
        },
        {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          title: "Severity Levels",
          desc: "Every incident is classified into severity levels: 'Critical' (Active fire, building collapse), 'High' (Severe flooding, trapped people), 'Medium' (Fallen trees, property damage), and 'Low' (Minor issues without immediate threat to life)."
        },
        {
          icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
          title: "Command Center Cockpit",
          desc: "The primary dashboard used by city officials and dispatchers. It aggregates all data, showing total active incidents, shelter occupancy, and a live tracking map of ongoing rescue operations."
        },
        {
          icon: <Search className="w-6 h-6 text-purple-500" />,
          title: "Citizen SOS Portal",
          desc: "The public-facing form where anyone can report a disaster. When a citizen types a description and location, the AI instantly analyzes it to determine the disaster type and suggests actionable steps for the rescue units."
        },
        {
          icon: <MapPin className="w-6 h-6 text-green-500" />,
          title: "Safe Shelters & Hospitals",
          desc: "The system dynamically tracks nearby safety zones and hospitals, updating their 'Current Occupancy' vs 'Maximum Capacity'. This ensures ambulances don't route victims to full hospitals."
        }
      ]
    },
    hi: {
      title: 'रेस्क्यू एआई (RescueAI) ज्ञानकोष',
      subtitle: 'समझें कि हमारी AI और आपातकालीन प्रबंधन प्रणाली कैसे काम करती है।',
      sections: [
        {
          icon: <Activity className="w-6 h-6 text-orange-500" />,
          title: "AI ट्राइएज और प्राथमिकता स्कोर (1-10)",
          desc: "हमारा गूगल जेमिनी AI रिपोर्ट पढ़ता है और 1 से 10 तक प्राथमिकता स्कोर देता है। 10 का अर्थ है तत्काल जानलेवा खतरा। इससे बचाव दलों को पहले सबसे गंभीर घटनाओं को संभालने में मदद मिलती है।"
        },
        {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          title: "गंभीरता के स्तर (Severity Levels)",
          desc: "हर घटना को बांटा जाता है: 'गंभीर' (आग, इमारत गिरना), 'उच्च' (बाढ़, फंसे हुए लोग), 'मध्यम' (पेड़ गिरना), और 'निम्न' (बिना जान के खतरे वाली समस्या)।"
        },
        {
          icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
          title: "कमांड सेंटर कॉकपिट",
          desc: "अधिकारियों का मुख्य डैशबोर्ड। यह सभी डेटा दिखाता है - कुल घटनाएं, आश्रय स्थल और राहत कार्यों का लाइव नक्शा।"
        },
        {
          icon: <Search className="w-6 h-6 text-purple-500" />,
          title: "नागरिक SOS पोर्टल",
          desc: "यहाँ कोई भी आपदा की रिपोर्ट कर सकता है। रिपोर्ट मिलते ही AI तुरंत विश्लेषण करता है और बचाव दलों के लिए सही कदम सुझाता है।"
        },
        {
          icon: <MapPin className="w-6 h-6 text-green-500" />,
          title: "सुरक्षित आश्रय और अस्पताल",
          desc: "प्रणाली आसपास के सुरक्षित स्थानों और अस्पतालों को ट्रैक करती है, उनकी 'वर्तमान क्षमता' और 'अधिकतम जगह' दिखाती है। इससे एम्बुलेंस भरे हुए अस्पतालों में नहीं जातीं।"
        }
      ]
    }
  }[lang];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center justify-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
        >
          <BookOpen className="w-8 h-8 text-blue-400" />
        </motion.div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
          {t.title}
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-medium">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {t.sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:shadow-black/40 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-100 tracking-wide">
                {section.title}
              </h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {section.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
