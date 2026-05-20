import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PROJECTS_DATA } from '../data';
import { Project } from '../types';
import { useTheme } from '../ThemeContext';
import { ExternalLink, Github, X, Compass, ShieldAlert, Award, ArrowRight } from 'lucide-react';

export default function PortfolioView() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { theme } = useTheme();

  const isLight = theme === 'light';

  const categories = ['All', 'Environmental Projects', 'AI Projects', 'Web Development', 'Research', 'Design Work'];

  const filteredProjects = activeCategory === 'All' 
    ? PROJECTS_DATA 
    : PROJECTS_DATA.filter(p => p.category === activeCategory);

  // Bind Escape key to exit modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="portfolio-view" className="w-full pt-32 pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
        
        {/* Page title header */}
        <div className="max-w-2xl mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-[#00C853] font-semibold mb-3 block">03 // Documented Lab & Enterprise Deliveries</span>
          <h1 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Project Archives
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-zinc-650' : 'text-zinc-440'
          }`}>
            A comprehensive, custom archive of peer-checked academic research, production web programs, machine intelligence models, and physical environmental rigs.
          </p>
        </div>

        {/* 1. FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 mb-12" id="portfolio-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-display tracking-wider uppercase transition-all duration-300 rounded-lg border cursor-pointer focus:outline-hidden font-bold ${
                activeCategory === cat 
                  ? isLight 
                    ? 'bg-zinc-900 text-white border-zinc-900' 
                    : 'bg-white text-black border-white' 
                  : isLight 
                    ? 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 shadow-xs' 
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 2. PROJECTS GRID */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          id="portfolio-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layoutId={`card-container-${project.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                onClick={() => setSelectedProject(project)}
                className={`group flex flex-col justify-between border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 h-full text-left ${
                  isLight 
                    ? 'bg-white border-zinc-200/85 hover:border-[#00C853]/45 shadow-sm hover:shadow-lg' 
                    : 'bg-[#121212] border-white/5 hover:border-[#00C853]/30 hover:shadow-2xl'
                }`}
              >
                <div>
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-zinc-850">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                    />
                    <div className={`absolute inset-0 opacity-80 ${
                      isLight ? 'bg-gradient-to-t from-white to-transparent' : 'bg-gradient-to-t from-[#121212] to-transparent'
                    }`} />
                    
                    {/* Floating top bar indicator */}
                    <span className={`absolute top-4 left-4 font-mono text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded border ${
                      isLight 
                        ? 'bg-white/95 text-[#006428] border-zinc-200/50' 
                        : 'bg-black/85 text-[#00C853] border-white/5'
                    }`}>
                      {project.category}
                    </span>
                  </div>

                  {/* Card Content info */}
                  <div className="p-6">
                    <h3 className={`font-display font-bold text-lg mb-2 group-hover:text-[#00C853] transition-colors leading-snug ${
                      isLight ? 'text-zinc-900' : 'text-white'
                    }`}>
                      {project.title}
                    </h3>
                    <p className={`text-xs leading-relaxed line-clamp-3 ${
                      isLight ? 'text-zinc-600' : 'text-zinc-400'
                    }`}>
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Footer and Tags */}
                <div className="p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.technologies.slice(0, 3).map((tech, idx) => (
                      <span 
                        key={idx} 
                        className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                          isLight 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-600' 
                            : 'bg-white/5 text-zinc-400 border-white/5'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className={`font-mono text-[9px] self-center pl-1 ${isLight ? 'text-zinc-450 font-bold' : 'text-zinc-500'}`}>
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center justify-between border-t pt-4 ${
                    isLight ? 'border-zinc-150' : 'border-white/5'
                  }`}>
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${isLight ? 'text-zinc-400 font-bold' : 'text-zinc-500'}`}>Case summary</span>
                    <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#00C853] font-bold">
                      Review Specs <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 3. CORE SPECS DETAIL POPUP MODAL */}
        <AnimatePresence>
          {selectedProject && (
            <div 
              id="portfolio-modal-overlay"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                layoutId={`card-container-${selectedProject.id}`}
                id="portfolio-modal-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()} // Stop propagation to avoid overlay close
                className={`border rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative ${
                  isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#121212] border-white/10 text-white'
                }`}
              >
                {/* Close Button top corner */}
                <button
                  id="portfolio-modal-close"
                  onClick={() => setSelectedProject(null)}
                  className={`absolute top-4 right-4 z-40 p-2.5 rounded-full border transition-colors cursor-pointer focus:outline-hidden ${
                    isLight 
                      ? 'bg-white/95 border-zinc-200 text-zinc-700 hover:bg-zinc-100' 
                      : 'bg-black/80 border-white/10 text-white hover:bg-white/10'
                  }`}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Hero Thumbnail banner inside modal */}
                <div className="aspect-[16/9] w-full relative bg-zinc-800">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 opacity-95 ${
                    isLight ? 'bg-gradient-to-t from-white' : 'bg-gradient-to-t from-[#121212]'
                  }`} />
                  
                  {/* Category overlay label */}
                  <span className="absolute bottom-6 left-6 font-mono text-xs uppercase tracking-widest text-[#00C853] font-black">
                    {selectedProject.category}
                  </span>
                </div>

                <div className="p-8 text-left">
                  {/* Heading */}
                  <h2 className={`font-display font-extrabold text-2xl sm:text-3xl mb-4 ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>
                    {selectedProject.title}
                  </h2>

                  {/* Skills/Tags in modal */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedProject.technologies.map((tech) => (
                      <span 
                        key={tech} 
                        className={`font-mono text-[10px] px-3 py-1 rounded-md border ${
                          isLight 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-700' 
                            : 'bg-white/5 border-white/5 text-zinc-300'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Summary brief */}
                  <p className={`text-sm leading-relaxed mb-8 ${isLight ? 'text-zinc-750' : 'text-zinc-400'}`}>
                    {selectedProject.description}
                  </p>

                  {/* Extra Case details splits */}
                  {selectedProject.extendedDetails && (
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-t pt-8 font-sans ${
                      isLight ? 'border-zinc-200' : 'border-white/5'
                    }`}>
                      <div className="flex flex-col">
                        <span className={`font-display font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                          isLight ? 'text-zinc-850' : 'text-white'
                        }`}>
                          <ShieldAlert className="w-4 h-4 text-[#00C853] shrink-0" /> Challenges
                        </span>
                        <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-650' : 'text-zinc-400'}`}>
                          {selectedProject.extendedDetails.challenge}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-display font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                          isLight ? 'text-zinc-850' : 'text-white'
                        }`}>
                          <Compass className="w-4 h-4 text-[#00C853] shrink-0" /> The Implementation
                        </span>
                        <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-650' : 'text-zinc-400'}`}>
                          {selectedProject.extendedDetails.solution}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-display font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                          isLight ? 'text-zinc-850' : 'text-white'
                        }`}>
                          <Award className="w-4 h-4 text-[#00C853] shrink-0" /> The Outcomes
                        </span>
                        <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-650' : 'text-zinc-400'}`}>
                          {selectedProject.extendedDetails.impact}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Actions redirects */}
                  <div className={`flex flex-wrap items-center gap-4 border-t pt-6 justify-between ${
                    isLight ? 'border-zinc-200' : 'border-white/5'
                  }`}>
                    <span className="font-mono text-[9px] text-[#00C853] uppercase tracking-widest font-black">UNSCRIPTED INTEGRATED CHECK</span>
                    <div className="flex items-center gap-3">
                      <a
                        href={selectedProject.githubUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className={`group inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] uppercase rounded-lg border transition-colors ${
                          isLight 
                            ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200/60' 
                            : 'bg-white/5 hover:bg-white/10 text-white border-white/5'
                        }`}
                      >
                        <Github className="w-3.5 h-3.5 text-[#00C853]" />
                        Source Code
                      </a>
                      <a
                        href={selectedProject.liveUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 px-4 py-2 bg-[#00C853] hover:bg-[#00963c] text-white font-mono text-[11px] uppercase rounded-lg transition-colors border border-transparent font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Blueprint
                      </a>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
