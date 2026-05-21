import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolioData } from '../PortfolioDataContext';
import { useTheme } from '../ThemeContext';
import { Briefcase, GraduationCap, Users, Calendar, MapPin, CheckCircle } from 'lucide-react';

export default function ExperienceView() {
  const { timeline } = usePortfolioData();
  const [activeTab, setActiveTab] = useState<string>('All');
  const { theme } = useTheme();

  const isLight = theme === 'light';

  const filteredTimeline = activeTab === 'All'
    ? timeline
    : timeline.filter(event => {
        if (activeTab === 'academic') return event.category === 'academic';
        if (activeTab === 'professional') return event.category === 'professional';
        if (activeTab === 'volunteer') return event.category === 'volunteer';
        return true;
      });

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <GraduationCap className="w-4 h-4 text-[#00C853]" />;
      case 'volunteer':
        return <Users className="w-4 h-4 text-[#00C853]" />;
      default:
        return <Briefcase className="w-4 h-4 text-[#00C853]" />;
    }
  };

  return (
    <div id="experience-view" className="w-full pt-32 pb-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-left">
        
        {/* Page title header */}
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#00C853] font-semibold mb-3 block">04 // Chronological Career Pathway</span>
          <h1 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Journey Timeline
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-zinc-650' : 'text-zinc-440'
          }`}>
            Structuring high fidelity solutions requires cumulative research, voluntary organization leadership, client scope validations, and lab assays. Review my path so far.
          </p>
        </div>

        {/* Categories Tab selectors */}
        <div className={`flex border-b mb-16 ${isLight ? 'border-zinc-200' : 'border-white/5'}`}>
          {[
            { id: 'All', label: 'All Milestones' },
            { id: 'professional', label: 'Professional / Agency' },
            { id: 'academic', label: 'Academic / Labs' },
            { id: 'volunteer', label: 'Volunteer / Ecosystem' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-4 font-display text-xs font-bold tracking-wider uppercase transition-colors relative cursor-pointer focus:outline-hidden ${
                activeTab === tab.id 
                  ? 'text-[#00C853] font-black' 
                  : isLight 
                    ? 'text-zinc-500 hover:text-zinc-900 font-semibold' 
                    : 'text-zinc-400 hover:text-white font-semibold'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="timeline-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C853]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Vertical Timeline container */}
        <div className={`relative border-l pl-8 ml-4 sm:ml-6 space-y-12 transition-colors duration-500 ${
          isLight ? 'border-zinc-200' : 'border-white/5'
        }`}>
          
          <AnimatePresence mode="popLayout">
            {filteredTimeline.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative text-left group"
              >
                
                {/* 1. Bullet point node on the timeline line */}
                <div className={`absolute -left-[53px] top-1 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl border ${
                  isLight 
                    ? 'bg-zinc-50 border-zinc-250' 
                    : 'bg-[#0A0A0A] border-white/10 group-hover:border-[#00C853]/50'
                }`}>
                  {/* Subtle inner glowing radial backing */}
                  <div className="absolute inset-0 bg-radial from-[#00C853]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {getEventIcon(event.category)}
                </div>

                {/* 2. Content Card */}
                <div className={`p-8 border rounded-2xl transition-all shadow-lg ${
                  isLight 
                    ? 'bg-white border-zinc-200/85 hover:border-[#00C853]/45' 
                    : 'bg-[#121212] border-white/5 hover:border-[#00C853]/25 shadow-2xl'
                }`}>
                  {/* Title & dates info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className={`font-display font-bold text-lg group-hover:text-[#00C853] transition-colors leading-snug ${
                        isLight ? 'text-zinc-900' : 'text-white'
                      }`}>
                        {event.role}
                      </h3>
                      <p className="text-[#00C853] font-mono text-xs uppercase tracking-wider mt-0.5 font-bold">
                        {event.company}
                      </p>
                    </div>

                    {/* Meta timeline indicators */}
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] font-bold">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                        isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-black/40 border-white/5 text-zinc-400'
                      }`}>
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {event.duration}
                      </span>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${
                        isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-black/40 border-white/5 text-zinc-400'
                      }`}>
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {event.location}
                      </span>
                    </div>
                  </div>

                  {/* Bullet description text listings */}
                  <ul className="space-y-2 mb-6">
                    {(event.description || []).map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed font-sans">
                        <CheckCircle className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5" />
                        <span className={`${isLight ? 'text-zinc-650' : 'text-zinc-400'}`}>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Badges checklist */}
                  <div className={`flex flex-wrap gap-1.5 pt-4 border-t ${
                    isLight ? 'border-zinc-150' : 'border-white/5'
                  }`}>
                    {(event.skills || []).map((skill) => (
                      <span 
                        key={skill} 
                        className={`font-mono text-[9px] px-2.5 py-1 rounded border transition-colors ${
                          isLight 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-650' 
                            : 'bg-white/5 text-zinc-400 border-white/5'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty timeline Fallback when zero elements are present */}
          {filteredTimeline.length === 0 && (
            <div className={`py-12 text-center border border-dashed rounded-2xl ${
              isLight ? 'border-zinc-300 bg-zinc-50' : 'border-white/5'
            }`}>
              <span className="font-mono text-xs text-zinc-500">No events found fitting this category</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
