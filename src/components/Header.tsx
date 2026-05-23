import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../ThemeContext';
import { usePortfolioData } from '../PortfolioDataContext';

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ activePage, onNavigate }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { userInfo } = usePortfolioData();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'Experience', id: 'experience' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsOpen(false);
  };

  const isLight = theme === 'light';

  return (
    <header 
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? isLight 
            ? 'bg-white/85 backdrop-blur-md border-b border-black/5 py-3.5 shadow-xs' 
            : 'bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/5 py-4' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3.5 group cursor-pointer focus:outline-hidden"
          id="logo-button"
        >
          <div className="w-8 h-8 bg-[#00C853] rounded-sm flex items-center justify-center font-black text-black text-xs font-display tracking-tight shrink-0 transition-transform duration-300 group-hover:scale-105">
            UR
          </div>
          <div className="flex flex-col text-left">
            <span className={`font-display font-semibold text-base tracking-tight transition-colors group-hover:text-[#00C853] ${
              isLight ? 'text-zinc-900' : 'text-white'
            }`}>{userInfo?.fullName || "Usama Rasheed"}</span>
            <span className="font-mono text-[8px] text-[#00C853] font-bold tracking-widest">ENVIRO & AI SYSTEMS</span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <nav className={`hidden md:flex items-center gap-1 border px-2 py-1.5 rounded-full transition-colors ${
          isLight 
            ? 'bg-black/5 border-black/5' 
            : 'bg-white/5 border-white/5'
        }`} id="desktop-navigation">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 text-xs font-display tracking-wide uppercase transition-colors rounded-full cursor-pointer focus:outline-hidden font-bold ${
                  isActive 
                    ? 'text-[#00C853]' 
                    : isLight 
                      ? 'text-zinc-600 hover:text-black' 
                      : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className={`absolute inset-0 rounded-full ${
                      isLight ? 'bg-black/10' : 'bg-white/5'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Desktop Controls (CTA + Theme Switcher) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all cursor-pointer focus:outline-hidden hover:scale-105 active:scale-95 ${
              isLight 
                ? 'bg-black/5 border-black/5 text-zinc-700 hover:bg-black/10 hover:text-[#00C853]' 
                : 'bg-white/5 border-white/5 text-[#00C853]/90 hover:bg-white/10 hover:text-[#00C853]'
            }`}
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          <button
            id="header-cta"
            onClick={() => handleNavClick('contact')}
            className={`px-5 py-2.5 text-xs font-bold rounded-full transition-all duration-300 shadow-sm cursor-pointer hover:scale-103 ${
              isLight 
                ? 'bg-zinc-900 text-white hover:bg-[#00C853] hover:text-black' 
                : 'bg-white text-black hover:bg-[#00C853] hover:text-white'
            }`}
          >
            Contact Me
          </button>
        </div>

        {/* Mobile controls (Theme Switcher + Drawer trigger) */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all cursor-pointer focus:outline-hidden ${
              isLight 
                ? 'bg-black/5 border-black/5 text-zinc-700 hover:bg-black/10' 
                : 'bg-white/5 border-white/5 text-[#00C853]/90 hover:bg-white/10'
            }`}
            aria-label="Toggle Theme"
          >
            {isLight ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
          </button>

          <button
            id="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 border rounded-lg focus:outline-hidden cursor-pointer transition-colors ${
              isLight 
                ? 'text-zinc-700 bg-black/5 border-black/5 hover:text-black' 
                : 'text-zinc-400 bg-white/5 border-white/5 hover:text-white'
            }`}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden absolute top-full left-0 right-0 border-b overflow-hidden shadow-2xl ${
              isLight 
                ? 'bg-white border-black/10' 
                : 'bg-[#0A0A0A] border-white/10'
            }`}
          >
            <div className="px-6 py-8 flex flex-col gap-4">
              {navItems.map((item, idx) => {
                const isActive = activePage === item.id;
                return (
                  <motion.button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-colors text-left font-display text-sm tracking-wide uppercase font-bold ${
                      isActive 
                        ? 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/25' 
                        : isLight 
                          ? 'text-zinc-600 border-transparent hover:text-black hover:bg-zinc-50' 
                          : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="font-mono text-[9px] text-[#00C853]/40">0{idx + 1}</span>
                  </motion.button>
                );
              })}

              <button
                id="mobile-cta"
                onClick={() => handleNavClick('contact')}
                className="mt-4 flex items-center justify-center gap-2 py-4 bg-[#00C853] text-white font-display text-xs font-bold tracking-wide uppercase rounded-xl hover:bg-[#00963c] transition-colors"
              >
                Let's Talk
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
