import React from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle, Leaf, Cpu, Code, BookOpen, LineChart } from 'lucide-react';
import { motion } from 'motion/react';
import { USER_INFO, PROJECTS_DATA, CLIENT_REASONS, HOME_FUN_FACTS } from '../data';
import { useTheme } from '../ThemeContext';
import BrandedImage from './BrandedImage';

interface HomeViewProps {
  onNavigate: (page: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const { theme } = useTheme();
  const indexProjects = PROJECTS_DATA.slice(0, 3);
  const isLight = theme === 'light';

  // Map icon names from data to components
  const getExpertiseIcon = (title: string) => {
    switch (title) {
      case 'Environmental Engineering':
        return <Leaf className="w-5 h-5 text-[#00C853]" />;
      case 'AI Solutions':
        return <Cpu className="w-5 h-5 text-[#00C853]" />;
      case 'Web Development':
        return <Code className="w-5 h-5 text-[#00C853]" />;
      case 'Research':
        return <BookOpen className="w-5 h-5 text-[#00C853]" />;
      default:
        return <LineChart className="w-5 h-5 text-[#00C853]" />;
    }
  };

  const expertises = [
    { title: "Environmental Engineering", desc: "Modeling adsorption biochars, auditing wastewater metrics, and deploying solid waste control plans at MUET." },
    { title: "AI Solutions", desc: "Integrating YOLO object classification models, statistical turbine predictors, and automatic scope carbon scripts." },
    { title: "Web Development", desc: "Constructing lightning-fast responsive systems, headless client dashboards, and highly custom Shopify/WP setups." },
    { title: "Sustainability", desc: "Fusing eco-compliance structures with digital asset engineering to reduce data heat footprints and resource waste." },
    { title: "Research", desc: "Authoring sorption essays, localized GIS mapping, and participating actively in ecological student volunteer initiatives." }
  ];

  return (
    <div id="home-view" className="w-full">
      {/* 1. HERO SECTION */}
      <section id="hero-section" className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
        {/* Decorative background glow circles */}
        <div className={`absolute top-1/4 left-1/10 w-[300px] h-[300px] rounded-full filter blur-[120px] animate-pulse-glow ${
          isLight ? 'bg-[#00C853]/8' : 'bg-[#00C853]/5'
        }`} />
        <div className={`absolute bottom-1/4 right-1/10 w-[400px] h-[400px] rounded-full filter blur-[150px] animate-pulse-glow ${
          isLight ? 'bg-[#00C853]/5' : 'bg-[#00C853]/3'
        }`} style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10 w-full">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Status pill badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border mb-6 ${
                isLight 
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-800 shadow-xs' 
                  : 'bg-white/5 border-white/10 text-zinc-300'
              }`}
            >
              <span className="relative flex h-2 w-2 animate-pulse">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]"></span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold">Available for consulting & development</span>
            </motion.div>

            {/* Giant Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
            >
              Hi, I’m Usama Rasheed
            </motion.h1>

            {/* Subtitle */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className={`font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-6 leading-tight ${
                isLight ? 'text-zinc-800' : 'text-zinc-100'
              }`}
            >
              <span className={`text-transparent bg-clip-text bg-linear-to-r green-text-glow ${
                isLight ? 'from-zinc-950 via-[#006428] to-[#00C853]' : 'from-white via-[#00C853] to-emerald-400'
              }`}>
                Environmental Engineer & AI-Powered Tech Specialist
              </span>
            </motion.h2>

            {/* Subtitle description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-base sm:text-lg tracking-wide max-w-xl leading-relaxed mb-10 ${
                isLight ? 'text-zinc-650' : 'text-zinc-400'
              }`}
            >
              Passionate about combining sustainability, artificial intelligence, and modern development to create smart digital solutions for businesses, environmental projects, and future-focused innovation.
            </motion.p>

            {/* Call to Actions buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="https://drive.google.com/file/d/15oAFdRUyEchZFhiyjhTWuggGlVPmKHqm/view?usp=drive_link"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-6 py-3.5 bg-[#00C853] hover:bg-[#00963c] text-white font-display text-xs font-bold tracking-wider uppercase rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-[#00C853]/20 cursor-pointer"
              >
                Download Resume
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <button
                onClick={() => onNavigate('contact')}
                className={`group flex items-center gap-2 px-6 py-3.5 font-display text-xs font-bold tracking-wider uppercase rounded-xl border transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                  isLight 
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200 hover:border-zinc-300 shadow-xs' 
                    : 'bg-[#121212] hover:bg-white/5 text-white border-white/10 hover:border-white/20'
                }`}
              >
                Get In Touch
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>

            {/* Interactive Stats Counters */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-8 border-t ${
                isLight ? 'border-zinc-200' : 'border-white/5'
              }`}
            >
              {HOME_FUN_FACTS.map((fact, index) => (
                <div key={index} className="flex flex-col text-left">
                  <span className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>{fact.count}</span>
                  <span className={`font-sans text-[9px] uppercase tracking-widest mt-1.5 leading-tight ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400 font-semibold'
                  }`}>{fact.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Professional Image with Framed Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-[340px] sm:max-w-[380px] lg:max-w-full">
              {/* Premium image adjustments & lighting frame wrapper */}
              <BrandedImage 
                src={USER_INFO.images.hero} 
                alt="Usama Rasheed Portrait Hero" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED EXPERTISE */}
      <section id="expertise-section" className={`py-24 border-y transition-colors duration-500 ${
        isLight ? 'bg-zinc-100/50 border-zinc-200' : 'bg-[#0F0F0F] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mb-16 text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-black mb-3 block">Specialized Vectors</span>
            <h2 className={`font-display text-3xl sm:text-4xl font-black tracking-tight ${
              isLight ? 'text-zinc-900' : 'text-white'
            }`}>
              Fusing Environmental Science With Advanced Software Systems
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertises.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative p-8 border rounded-2xl transition-all duration-300 hover:shadow-xl ${
                  isLight 
                    ? 'bg-white border-zinc-200/80 hover:border-[#00C853]/40 hover:shadow-zinc-200' 
                    : 'bg-[#141414] border-white/5 hover:border-[#00C853]/30'
                }`}
              >
                {/* Accent line */}
                <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#00C853]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Icon wrapper */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-colors ${
                  isLight ? 'bg-zinc-100 border border-zinc-200 group-hover:bg-[#00C853]/10' : 'bg-white/5 border border-white/10 group-hover:border-[#00C853]/40'
                }`}>
                  {getExpertiseIcon(item.title)}
                </div>

                <h3 className={`font-display font-bold text-lg mb-3 group-hover:text-[#00C853] transition-colors ${
                  isLight ? 'text-zinc-900' : 'text-white'
                }`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed ${
                  isLight ? 'text-zinc-600' : 'text-zinc-400'
                }`}>{item.desc}</p>
              </motion.div>
            ))}

            {/* Custom Interactive Floating "Explore services" Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              onClick={() => onNavigate('services')}
              className={`group p-8 border border-dashed rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-md ${
                isLight 
                  ? 'bg-zinc-50 border-zinc-300 text-zinc-900 hover:border-[#00C853]/60' 
                  : 'bg-linear-to-br from-[#0A0A0A] to-[#121212] border-white/10 hover:border-[#00C853]/50'
              }`}
            >
              <div className="text-left">
                <span className="font-mono text-[9px] uppercase text-[#00C853]/80 tracking-widest font-black">Solutions Stack</span>
                <h3 className={`font-display font-extrabold text-xl mt-4 mb-2 ${
                  isLight ? 'text-zinc-900' : 'text-white'
                }`}>Need a custom workspace workflow?</h3>
                <p className={`text-xs leading-relaxed ${
                  isLight ? 'text-zinc-650' : 'text-zinc-400'
                }`}>
                  I configure custom administrative spreadsheets, local database sync pipelines, high converting storefront layouts, SEO audits, and eco-calculators tailored for your exact corporate roadmap.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#00C853] mt-8 font-black w-fit group-hover:translate-x-1.5 transition-transform">
                EXPLORE SERVICE MATRICES
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. WHY WORK WITH ME */}
      <section id="why-work-with-me" className="py-24 relative overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Narrative Text */}
            <div className="lg:col-span-5 text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-black mb-3 block">Corporate Value Proposition</span>
              <h2 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}>
                Why Hire Usama?
              </h2>
              <p className={`text-sm sm:text-base leading-relaxed mb-8 ${
                isLight ? 'text-zinc-650' : 'text-zinc-400'
              }`}>
                By marrying structural analysis from environmental studies with modern server architectures and AI models, I create secure, fast, and modern digital materials that elevate user conversion rates and professional compliance scores.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#00C853]/15 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00C853]" />
                  </div>
                  <span className={`text-sm font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                    Active problem solving tailored for exact customer bottlenecks
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#00C853]/15 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00C853]" />
                  </div>
                  <span className={`text-sm font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                    Minimalist, speed-optimized designs (inspired by Apple with strong grids)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded bg-[#00C853]/15 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00C853]" />
                  </div>
                  <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#00C853]">
                    CARBON-OPTIMIZED PORTFOLIO DEPLOYMENT
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('about')}
                className={`mt-10 group flex items-center gap-2 text-xs font-display font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
                  isLight ? 'text-zinc-900 hover:text-[#00C853]' : 'text-white hover:text-[#00C853]'
                }`}
              >
                Learn my background
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Right Side Cards List */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {CLIENT_REASONS.map((reason, idx) => (
                <div 
                  key={reason.id}
                  className={`p-6 border rounded-2xl transition-all text-left group hover:scale-[1.01] ${
                    isLight 
                      ? 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm' 
                      : 'bg-[#121212] border-white/5 hover:border-white/10 shadow-2xl'
                  }`}
                >
                  <span className="font-mono text-[9px] text-[#00C853] font-black tracking-widest block mb-2 uppercase">0{idx+1} // {reason.subtitle}</span>
                  <h3 className={`font-display font-bold text-base mb-2 group-hover:text-[#00C853] transition-colors ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>{reason.title}</h3>
                  <p className={`text-xs leading-relaxed ${
                    isLight ? 'text-zinc-600' : 'text-zinc-400'
                  }`}>{reason.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SELECTED PREVIEW PROJECTS */}
      <section id="mini-projects" className={`py-24 border-t transition-colors duration-500 ${
        isLight ? 'bg-zinc-100/50 border-zinc-200' : 'bg-[#0F0F0F] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div className="text-left">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-black mb-3 block">Selected Works</span>
              <h2 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isLight ? 'text-zinc-900' : 'text-zinc-100'
              }`}>
                Premium Portfolio Selections
              </h2>
            </div>
            <button
              onClick={() => onNavigate('portfolio')}
              className={`group flex items-center gap-2 px-5 py-2.5 font-display text-xs font-bold tracking-widest uppercase rounded-xl border transition-all duration-300 self-start sm:self-auto cursor-pointer ${
                isLight 
                  ? 'bg-zinc-900 text-white hover:bg-black border-zinc-900 shadow-sm' 
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              Enter Full Portfolio
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {indexProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group flex flex-col h-full border rounded-2xl overflow-hidden transition-all duration-300 text-left ${
                  isLight 
                    ? 'bg-white border-zinc-200/80 hover:border-[#00C853]/40 hover:shadow-lg' 
                    : 'bg-[#141414] border-white/5 hover:border-[#00C853]/25'
                }`}
              >
                {/* Visual Image container */}
                <div className="aspect-[16/10] relative overflow-hidden bg-zinc-850">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                  <div className={`absolute inset-0 opacity-70 transition-colors duration-500 ${
                    isLight ? 'bg-gradient-to-t from-white/95 to-transparent' : 'bg-gradient-to-t from-[#141414] to-transparent'
                  }`} />
                  
                  {/* Category Pill Tag */}
                  <span className={`absolute top-4 left-4 font-mono text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                    isLight 
                      ? 'bg-white/95 text-[#006428] border-zinc-200/50' 
                      : 'bg-[#0A0A0A]/85 text-[#00C853] border-white/5'
                  }`}>
                    {project.category}
                  </span>
                </div>

                {/* Card Info content */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className={`font-display font-bold text-lg mb-2 group-hover:text-[#00C853] transition-colors leading-snug ${
                      isLight ? 'text-zinc-900' : 'text-white'
                    }`}>
                      {project.title}
                    </h3>
                    <p className={`text-xs leading-relaxed line-clamp-3 mb-6 ${
                      isLight ? 'text-zinc-650' : 'text-zinc-450'
                    }`}>
                      {project.description}
                    </p>
                  </div>

                  {/* Tech item row */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.technologies.slice(0, 3).map((tech, idx) => (
                        <span 
                          key={idx} 
                          className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                            isLight 
                              ? 'bg-zinc-100 text-zinc-650 border-zinc-200/50' 
                              : 'bg-white/5 text-zinc-400 border-white/5'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className={`font-mono text-[9px] self-center pl-1 ${isLight ? 'text-zinc-450 font-semibold' : 'text-zinc-500'}`}>
                          +{project.technologies.length - 3} more
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate('portfolio')}
                      className="group/btn inline-flex items-center gap-1 text-xs font-mono font-black text-[#00C853] group-hover:translate-x-1.5 transition-transform cursor-pointer"
                    >
                      EXPLORE DEPLOYMENT MATRIX
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DUSTY RADIAL CALL TO ACTION BANNER */}
      <section id="cta-contact-section" className={`py-24 relative overflow-hidden transition-all duration-500 border-t ${
        isLight 
          ? 'bg-radial from-[#00C853]/6 to-zinc-50 border-zinc-200' 
          : 'bg-radial from-[#00C853]/10 to-[#0A0A0A] border-white/5'
      }`}>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 font-mono text-[10px] font-black rounded-full uppercase tracking-widest mb-6">
            Initiate Conversation
          </span>
          <h2 className={`font-display text-2xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Have an engineering blueprint, web project, or AI model in mind?
          </h2>
          <p className={`text-sm max-w-xl mx-auto leading-relaxed mb-10 ${
            isLight ? 'text-zinc-600' : 'text-zinc-400'
          }`}>
            Let's structure a plan to digitize your spreadsheets, integrate automated APIs, optimize visual Shopify/WordPress frontends, or deploy carbon studies.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-[#00C853] hover:bg-[#00963c] text-white font-display text-xs font-black tracking-widest uppercase rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-xl shadow-[#00C853]/20 cursor-pointer"
          >
            Launch Project Briefing
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </div>
  );
}
