import React from 'react';
import { motion } from 'motion/react';
import { usePortfolioData } from '../PortfolioDataContext';
import * as LucideIcons from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import BrandedImage from './BrandedImage';

interface ServicesViewProps {
  onNavigate: (page: string) => void;
}

export default function ServicesView({ onNavigate }: ServicesViewProps) {
  const { services } = usePortfolioData();
  const { theme } = useTheme();

  const isLight = theme === 'light';
  
  // Icon drawing assistant
  const renderIcon = (name: string) => {
    // Dynamically fetch from LucideIcons object
    const IconComponent = (LucideIcons as any)[name];
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 text-[#00C853]" />;
    }
    return <LucideIcons.Settings className="w-5 h-5 text-[#00C853]" />;
  };

  return (
    <div id="services-view" className="w-full pt-32 pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
        
        {/* Page title header with premium side graphic */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7">
            <span className="font-mono text-xs uppercase tracking-widest text-[#00C853] font-semibold mb-3 block">02 // Client Consultation Offerings</span>
            <h1 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 ${
              isLight ? 'text-zinc-900' : 'text-white'
            }`}>
              Modular Services
            </h1>
            <p className={`text-sm sm:text-base leading-relaxed ${
              isLight ? 'text-zinc-650' : 'text-zinc-440'
            }`}>
              I offer a wide array of professional solutions, splitting efforts between physical environmental audits and digital startup assets. Every service is backed by documented client deliveries and scientific standards.
            </p>
          </div>
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <BrandedImage 
              src="https://myphotosss.netlify.app/4.png" 
              alt="Professional premium services illustration" 
              className="max-w-[420px] w-full"
              aspectRatio="aspect-square"
            />
          </div>
        </div>

        {/* Categories Separator Tabs / Headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv, index) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`group relative p-8 border rounded-2xl transition-all duration-500 flex flex-col justify-between hover:shadow-xl h-full ${
                isLight 
                  ? 'bg-white border-zinc-200 hover:border-[#00C853]/45 shadow-sm hover:shadow-[#00C853]/5' 
                  : 'bg-[#121212] border-white/5 hover:border-[#00C853]/40 hover:shadow-[#00C853]/5'
              }`}
            >
              {/* Dynamic hover bottom gradient line */}
              <div className="absolute inset-x-8 bottom-0 h-[2px] bg-linear-to-r from-transparent via-[#00C853]/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              
              {/* Top Accent corner highlight bracket */}
              <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden rounded-tr-2xl">
                <div className="absolute top-0 right-0 w-[40px] h-[40px] border-t-2 border-r-2 border-[#00C853]/0 group-hover:border-[#00C853]/80 group-hover:scale-100 transition-all duration-500 origin-top-right " />
              </div>

              <div>
                {/* Icon Circle */}
                <div className={`w-11 h-11 border rounded-xl flex items-center justify-center mb-6 transition-all ${
                  isLight 
                    ? 'bg-zinc-50 border-zinc-200 group-hover:border-[#00C853]/40' 
                    : 'bg-[#0A0A0A] border-white/5 group-hover:border-[#00C853]/30'
                }`}>
                  {renderIcon(srv.iconName)}
                </div>

                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className={`font-display font-bold text-lg group-hover:text-[#00C853] transition-colors leading-snug ${
                    isLight ? 'text-zinc-900' : 'text-white'
                  }`}>
                    {srv.title}
                  </h3>
                  {/* Category Pill Tag */}
                  <span className={`font-mono text-[8px] tracking-widest uppercase px-2.5 py-0.5 rounded border ${
                    isLight 
                      ? 'bg-zinc-100 text-zinc-500 border-zinc-250/50' 
                      : 'bg-black/40 text-zinc-400 border-white/5'
                  }`}>
                    {srv.category}
                  </span>
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                  isLight ? 'text-zinc-650' : 'text-zinc-440'
                }`}>
                  {srv.description}
                </p>

                {/* Bullets List */}
                <ul className={`space-y-2 mb-8 border-t pt-4 ${
                  isLight ? 'border-zinc-150' : 'border-white/5'
                }`}>
                  {(srv.bullets || []).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <span className="text-[#00C853] text-[10px] mt-0.5 select-none shrink-0 font-bold">◇</span>
                      <span className={`${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inquiry Action bottom bar */}
              <button
                onClick={() => onNavigate('contact')}
                className={`group/btn flex items-center justify-between text-left px-4 py-2.5 border rounded-lg transition-colors w-full cursor-pointer focus:outline-hidden ${
                  isLight 
                    ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700' 
                    : 'bg-[#0D0D0D] hover:bg-white/5 border-white/5 text-zinc-450'
                }`}
              >
                <span className={`font-mono text-[10px] uppercase font-bold transition-colors ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}>Request Spec Sheet</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-[#00C853] transition-colors" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Consulting guidelines note card */}
        <div className={`mt-16 p-8 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${
          isLight ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-[#0F0F0F] border-white/5'
        }`}>
          <div className="flex gap-4 items-start text-left max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#00C853]/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#00C853]" />
            </div>
            <div>
              <h4 className={`font-display font-bold text-sm uppercase tracking-wider ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}>Quality Guarantee Log</h4>
              <p className={`text-xs leading-relaxed mt-1 ${
                isLight ? 'text-zinc-650' : 'text-zinc-400'
              }`}>
                All software deployments delivered by Unscripted Studio come wrapped with 1-month high tier maintenance. Academic consulting reports pass standard peer-checked plagiarism engines.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className={`px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all self-start sm:self-auto cursor-pointer ${
              isLight 
                ? 'bg-zinc-900 text-white hover:bg-[#00C853] hover:text-black shadow-sm' 
                : 'bg-white text-black hover:bg-[#00C853] hover:text-white'
            }`}
          >
            Schedule Assessment
          </button>
        </div>

      </div>
    </div>
  );
}
