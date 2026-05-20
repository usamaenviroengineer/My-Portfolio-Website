import React from 'react';
import { Leaf, Github, Mail, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { USER_INFO } from '../data';
import { useTheme } from '../ThemeContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  const isLight = theme === 'light';

  const handleNavClick = (id: string) => {
    onNavigate(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className={`border-t pt-16 pb-8 relative overflow-hidden transition-colors ${
      isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#0A0A0A] border-white/5'
    }`}>
      {/* Background soft glow radial */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-gradient-to-t from-[#00C853]/5 to-transparent filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* 4-column Pro Feature Bar Badge Array from Design HTML */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b text-left ${
          isLight ? 'border-zinc-200' : 'border-white/5'
        }`}>
          <div className="flex flex-col gap-1">
            <span className="text-[#00C853] font-mono text-[10px] uppercase tracking-widest font-black">Expertise</span>
            <span className={`text-sm font-bold ${isLight ? 'text-zinc-805' : 'text-zinc-200'}`}>Sustainability AI</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#00C853] font-mono text-[10px] uppercase tracking-widest font-black">Location</span>
            <span className={`text-[11px] font-bold leading-tight ${isLight ? 'text-zinc-805' : 'text-zinc-200'}`}>
              Fazalabad Colony,<br />Matli, Badin, Sindh
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#00C853] font-mono text-[10px] uppercase tracking-widest font-black">Studio</span>
            <span className={`text-sm font-bold ${isLight ? 'text-zinc-805' : 'text-zinc-200'}`}>Unscripted Studio</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#00C853] font-mono text-[10px] uppercase tracking-widest font-black">Focus</span>
            <span className={`text-sm font-bold ${isLight ? 'text-zinc-805' : 'text-zinc-200'}`}>Pollution Control & AI</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & Vision Column */}
          <div className="md:col-span-2 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded flex items-center justify-center border ${
                isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-white/5 border border-white/10'
              }`}>
                <Leaf className="w-4 h-4 text-[#00C853]" />
              </div>
              <span className={`font-display font-extrabold text-sm tracking-wider uppercase ${
                isLight ? 'text-zinc-950 font-black' : 'text-white'
              }`}>Usama Rasheed</span>
            </div>
            <p className={`text-sm max-w-sm leading-relaxed mb-6 ${
              isLight ? 'text-zinc-600' : 'text-zinc-400'
            }`}>
              Engineering solutions at the critical crossroads of physical environment sciences and AI automation networks. Let's construct a cleaner, optimized future.
            </p>
            {/* Social Grid */}
            <div className="flex items-center gap-3">
              <a 
                href={USER_INFO.socials.github} 
                target="_blank" 
                rel="noreferrer" 
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 border ${
                  isLight 
                    ? 'bg-white border-zinc-200 text-zinc-650 hover:text-[#00C853] hover:border-[#00C853]/45 shadow-xs' 
                    : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00C853] hover:border-[#00C853]/40'
                }`}
                aria-label="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href={USER_INFO.socials.youtube} 
                target="_blank" 
                rel="noreferrer" 
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 border ${
                  isLight 
                    ? 'bg-white border-zinc-200 text-zinc-650 hover:text-[#00C853] hover:border-[#00C853]/45 shadow-xs' 
                    : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00C853] hover:border-[#00C853]/40'
                }`}
                aria-label="YouTube Profile"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href={USER_INFO.socials.instagram} 
                target="_blank" 
                rel="noreferrer" 
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 border ${
                  isLight 
                    ? 'bg-white border-zinc-200 text-zinc-650 hover:text-[#00C853] hover:border-[#00C853]/45 shadow-xs' 
                    : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00C853] hover:border-[#00C853]/40'
                }`}
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={USER_INFO.socials.facebook} 
                target="_blank" 
                rel="noreferrer" 
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 border ${
                  isLight 
                    ? 'bg-white border-zinc-200 text-zinc-650 hover:text-[#00C853] hover:border-[#00C853]/45 shadow-xs' 
                    : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00C853] hover:border-[#00C853]/40'
                }`}
                aria-label="Facebook Profile"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={USER_INFO.socials.whatsapp} 
                target="_blank" 
                rel="noreferrer" 
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 border ${
                  isLight 
                    ? 'bg-white border-zinc-200 text-zinc-650 hover:text-[#00C853] hover:border-[#00C853]/45 shadow-xs' 
                    : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-[#00C853] hover:border-[#00C853]/40'
                }`}
                aria-label="WhatsApp Profile"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sitemaps Quick navigation */}
          <div className="text-left">
            <h4 className={`font-display font-bold text-xs uppercase tracking-wider mb-6 ${
              isLight ? 'text-zinc-950' : 'text-white'
            }`}>Directory</h4>
            <ul className="space-y-3 font-display text-xs">
              {['home', 'about', 'services', 'portfolio', 'experience', 'contact'].map((page) => (
                <li key={page}>
                  <button 
                    onClick={() => handleNavClick(page)}
                    className={`uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                      isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-400 hover:text-[#00C853]'
                    }`}
                  >
                    {page}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Node Details */}
          <div className="text-left">
            <h4 className={`font-display font-bold text-xs uppercase tracking-wider mb-6 ${
              isLight ? 'text-zinc-950' : 'text-white'
            }`}>Inquiries</h4>
            <div className="space-y-4">
              <a 
                href={`mailto:${USER_INFO.email}`}
                className={`group flex items-center gap-3 transition-colors ${
                  isLight ? 'text-zinc-600 hover:text-zinc-900 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center group-hover:border-[#00C853]/30 ${
                  isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-white/5 border border-white/5'
                }`}>
                  <Mail className="w-3.5 h-3.5 text-[#00C853]" />
                </div>
                <span className="text-xs break-all truncate font-mono">{USER_INFO.email}</span>
              </a>
              <div className="font-mono text-[10px] space-y-0.5">
                <div className="uppercase text-[#00C853] font-bold tracking-widest text-[9px]">Location Core</div>
                <div className={isLight ? 'text-zinc-600' : 'text-zinc-500'}>Fazalabad Colony Matli, Badin</div>
                <div className={isLight ? 'text-zinc-605' : 'text-zinc-500'}>Sindh - Pakistan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 ${
          isLight ? 'border-zinc-200' : 'border-white/5'
        }`}>
          <p className="text-zinc-500 text-xs font-mono">
            &copy; {currentYear} Usama Rasheed. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
            <span>Clean Code</span>
            <span className="text-[#00C853]">•</span>
            <span>Carbon Neutral Portal</span>
            <span className="text-[#00C853]">•</span>
            <span>Unscripted Studio Dev</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
