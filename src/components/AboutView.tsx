import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePortfolioData } from '../PortfolioDataContext';
import { useTheme } from '../ThemeContext';
import BrandedImage from './BrandedImage';
import { Building, Flame, Trees, Droplets, Wind, Settings } from 'lucide-react';

export default function AboutView() {
  const { userInfo, skills } = usePortfolioData();
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("");
  const { theme } = useTheme();

  const isLight = theme === 'light';

  useEffect(() => {
    if (skills && skills.length > 0 && !selectedSkillCategory) {
      setSelectedSkillCategory(skills[0].category);
    }
  }, [skills]);

  const stats = [
    { value: "3.30 / 4.00", label: "GPA (1st Semester) core" },
    { value: "4.9 / 5.0", label: "Studio Client review" },
    { value: "3+", label: "Academic Research Labs" },
    { value: "20+", label: "Delivered Web Portals" }
  ];

  const highlights = [
    { icon: <Droplets className="w-5 h-5 text-[#00C853]" />, label: "Water Isolation Treatment", desc: "Formulating biochars via agricultural wheat husks to biosorb carcinogenic heavy metals." },
    { icon: <Wind className="w-5 h-5 text-[#00C853]" />, label: "Climate Intelligence Tools", desc: "Setting up telemetry pipelines tracking particulates and localized atmospheric temperature alerts." },
    { icon: <Trees className="w-5 h-5 text-[#00C853]" />, label: "Bio-Circular Economies", desc: "Integrating YOLO vision networks on rapid sorting channels to reduce compost cross-contaminations." },
    { icon: <Flame className="w-5 h-5 text-[#00C853]" />, label: "Renewable Integration Core", desc: "Configuring custom interactive calculators evaluating solar output potentials for consultants." }
  ];

  const activeCategorySkills = skills.find(grp => grp.category === selectedSkillCategory)?.skills || [];

  return (
    <div id="about-view" className="w-full pt-32 pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
        
        {/* Page title header */}
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#00C853] font-semibold mb-3 block">01 // Academic Bio & Ambition</span>
          <h1 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Meet {userInfo?.fullName || "Usama Rasheed"}
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-zinc-650' : 'text-zinc-440'
          }`}>
            {userInfo?.aboutBrief || "I study Environmental Engineering at Mehran U.E.T - Jamshoro. Parallel to laboratory chemical assays and water treatment designs, I develop high-performance software systems and automated AI platforms addressing critical environmental and digital milestones."}
          </p>
        </div>

        {/* Two-Column split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          
          {/* Left Frame column: Portrait Image */}
          <div className="lg:col-span-5">
            <div className="w-full max-w-[340px] sm:max-w-[380px] lg:max-w-full mx-auto">
              <BrandedImage 
                src={userInfo.images?.about || "https://myphotosss.netlify.app/6.png"} 
                alt="Usama Rasheed Portrait About Page" 
              />
            </div>
            
            {/* Quick university block below portrait */}
            <div className={`mt-8 p-6 border rounded-2xl flex items-center gap-4 ${
              isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#121212] border-white/5'
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isLight ? 'bg-zinc-100 border border-zinc-200' : 'bg-white/5 border border-white/10'
              }`}>
                <Building className="w-5 h-5 text-[#00C853]" />
              </div>
              <div>
                <h4 className={`font-display font-semibold text-xs uppercase tracking-wider ${
                  isLight ? 'text-zinc-800' : 'text-white'
                }`}>Education Hub</h4>
                <p className={`text-xs ${isLight ? 'text-zinc-550' : 'text-zinc-400'}`}>Mehran U.E.T - Jamshoro</p>
              </div>
            </div>
          </div>

          {/* Right Core Info column */}
          <div className="lg:col-span-7">
            <h2 className={`font-display text-2xl sm:text-3xl font-extrabold mb-6 leading-tight ${
              isLight ? 'text-zinc-900' : 'text-white'
            }`}>
              Engineering Clean Futures Through Science & Binary Logic
            </h2>
            
            <div className={`space-y-6 text-sm leading-relaxed mb-10 ${
              isLight ? 'text-zinc-650' : 'text-zinc-400'
            }`}>
              <p>
                My educational focus at Mehran U.E.T center around the mechanics of environmental protection: configuring biological oxygen demands, examining wastewater treatment stages, setting up municipal recycling routines, and drafting environmental impact logs. 
              </p>
              <p>
                However, I discovered that physical science becomes exponentially more potent when injected with automated software structures. I began mastering modern digital technologies—engineering custom WordPress configurations, headless Shopify environments, full-stack React systems, and training machine learning algorithms (such as computer vision models and regression systems).
              </p>
              <p>
                Whether as the founder of Unscripted Studio optimizing core client speed indices, or inside laboratories evaluating heavy-metal sorption rates from agricultural wheat waste, my focus is absolute: deliver clean, modular, and fast results that satisfy rigorous corporate guidelines.
              </p>
            </div>

            {/* Real Stats Grid */}
            <div className={`grid grid-cols-2 gap-6 p-8 border rounded-2xl ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#0F0F0F] border-white/5'
            }`}>
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col border-l border-[#00C853]/50 pl-4">
                  <span className={`font-display font-extrabold text-lg sm:text-xl tracking-tight ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>{stat.value}</span>
                  <span className={`font-sans text-[10px] uppercase tracking-widest mt-1 leading-tight ${
                    isLight ? 'text-zinc-450' : 'text-zinc-500'
                  }`}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. SPECIFIC RESEARCH & PASSION AREAS */}
        <div className={`py-20 border-t mb-24 ${isLight ? 'border-zinc-200' : 'border-white/5'}`}>
          <div className="max-w-3xl mb-12">
            <span className="font-mono text-xs uppercase text-[#00C853] font-black tracking-widest block mb-2">Technical Core Vectors</span>
            <h2 className={`font-display text-3xl font-extrabold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Sustainability & Climate Core</h2>
            <p className={`text-xs sm:text-sm mt-3 ${isLight ? 'text-zinc-650' : 'text-zinc-440'}`}>
              Where environmental studies find robust analytical answers through modern tech loops.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Highlights Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {highlights.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 border rounded-2xl transition-all flex gap-5 group text-left ${
                    isLight 
                      ? 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm' 
                      : 'bg-[#121212] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-11 h-11 border rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isLight 
                      ? 'bg-zinc-50 border-zinc-200 group-hover:bg-[#00C853]/10' 
                      : 'bg-[#0A0A0A] border-white/5 group-hover:border-[#00C853]/40'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className={`font-display font-bold text-sm mb-2 group-hover:text-[#00C853] transition-colors ${
                      isLight ? 'text-zinc-900' : 'text-white'
                    }`}>{item.label}</h3>
                    <p className={`text-xs leading-relaxed ${
                      isLight ? 'text-zinc-650' : 'text-zinc-400'
                    }`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium Free Floating Image */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <BrandedImage 
                src="https://myphotosss.netlify.app/6.png" 
                alt="Technical Core Vectors design asset" 
                className="max-w-[420px] w-full"
                aspectRatio="aspect-square"
              />
            </div>
          </div>
        </div>

        {/* 3. DYNAMIC SKILLS SHOWCASE */}
        {skills && skills.length > 0 && (
          <div className={`py-20 border-t relative ${isLight ? 'border-zinc-200' : 'border-white/5'}`}>
            <div className="max-w-3xl mb-16">
              <span className="font-mono text-xs uppercase text-[#00C853] font-black tracking-widest block mb-2">Systems Index</span>
              <h2 className={`font-display text-3xl font-extrabold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Technical Proficiency Matrix</h2>
              <p className={`text-xs sm:text-sm mt-3 ${isLight ? 'text-zinc-650' : 'text-zinc-440'}`}>
                An honest visual breakdown of skills acquired through MUET coursework and independent software client pipelines.
              </p>
            </div>

            {/* Interactive tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">
              {/* Left categories list */}
              <div className="lg:col-span-4 flex flex-col gap-2.5 w-full">
                {skills.map((grp, idx) => (
                  <button
                    key={`${grp.category}-${idx}`}
                    onClick={() => setSelectedSkillCategory(grp.category)}
                    className={`py-4 px-6 rounded-xl border font-display text-xs font-bold tracking-wider uppercase transition-all duration-300 text-left cursor-pointer focus:outline-hidden ${
                      selectedSkillCategory === grp.category
                        ? isLight
                          ? 'bg-[#00C853]/10 border-[#00C853] text-[#006428]'
                          : 'bg-white/5 border-[#00C853] text-[#00c853]'
                        : isLight
                          ? 'border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                          : 'border-white/5 text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {grp.category}
                  </button>
                ))}
              </div>

              {/* Right progress sliders */}
              <div className={`lg:col-span-8 p-8 border rounded-2xl w-full ${
                isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#121212] border-white/5'
              }`}>
                <h3 className={`font-display font-semibold text-sm uppercase tracking-wider mb-8 border-b pb-4 ${
                  isLight ? 'text-zinc-900 border-zinc-200' : 'text-white border-white/5'
                }`}>
                  {selectedSkillCategory} Breakdown
                </h3>
                
                <div className="space-y-6">
                  {activeCategorySkills.map((skill, idx) => (
                    <div key={`${skill.name}-${idx}`} className="flex flex-col text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium font-display leading-tight ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>{skill.name}</span>
                        <span className="text-xs font-mono text-[#00C853] font-bold">{skill.percentage}%</span>
                      </div>
                      {/* Progress slider track */}
                      <div className={`h-2.5 w-full rounded-full overflow-hidden border ${
                        isLight ? 'bg-zinc-150 border-zinc-200/50' : 'bg-black/40 border-white/5'
                      }`}>
                        <motion.div
                          className="h-full bg-[#00C853] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          key={`${selectedSkillCategory}-${skill.name}`} // Re-trigger on category swap
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Specification note */}
                <div className="mt-8 flex items-start gap-2 text-[10px] font-mono leading-normal uppercase text-zinc-500">
                  <Settings className="w-3.5 h-3.5 text-[#00C853] spin shrink-0 mt-0.5" />
                  <span>Percentage figures are computed based on project count deployments and certified MUET mechanical assessments.</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
