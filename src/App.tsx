import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ServicesView from './components/ServicesView';
import PortfolioView from './components/PortfolioView';
import ExperienceView from './components/ExperienceView';
import ContactView from './components/ContactView';
import AdminView from './components/AdminView';
import { ThemeProvider, useTheme } from './ThemeContext';
import { PortfolioDataProvider } from './PortfolioDataContext';

function MainApp() {
  const [activePage, setActivePage] = useState<string>('home');
  const { theme } = useTheme();

  // URL Path synchronization (Clean SEO Path Routing with Hash migration)
  useEffect(() => {
    const parsePath = () => {
      const validPages = ['home', 'about', 'services', 'portfolio', 'experience', 'contact', 'admin-usama'];
      
      // 1. Migrating legacy Hash links to clean Pathname links transparently
      if (window.location.hash) {
        const hash = window.location.hash.replace('#/', '').replace('#', '');
        if (hash && validPages.includes(hash)) {
          const cleanPath = hash === 'home' ? '/' : `/${hash}`;
          window.history.replaceState(null, '', cleanPath);
          setActivePage(hash);
          return;
        }
      }

      // 2. Standard path-based routing
      const pathname = window.location.pathname;
      const route = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      
      if (!route) {
        setActivePage('home');
      } else if (validPages.includes(route)) {
        setActivePage(route);
      } else {
        setActivePage('home');
        window.history.replaceState(null, '', '/');
      }
    };

    // Parse path on initial load
    parsePath();

    // Bind browser popstate listener (back/forward keys)
    window.addEventListener('popstate', parsePath);
    return () => window.removeEventListener('popstate', parsePath);
  }, []);

  const handleNavigate = (pageId: string) => {
    const targetPath = pageId === 'home' ? '/' : `/${pageId}`;
    window.history.pushState(null, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActivePage(pageId);
  };

  const renderActiveView = () => {
    switch (activePage) {
      case 'about':
        return <AboutView />;
      case 'services':
        return <ServicesView onNavigate={handleNavigate} />;
      case 'portfolio':
        return <PortfolioView />;
      case 'experience':
        return <ExperienceView />;
      case 'contact':
        return <ContactView />;
      case 'admin-usama':
        return <AdminView />;
      case 'home':
      default:
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  const isLight = theme === 'light';
  const showChrome = activePage !== 'admin-usama';

  if (!showChrome) {
    return (
      <div className="bg-[#070708] min-h-screen text-white selection:bg-[#00C853] selection:text-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col justify-between relative ${
      isLight 
        ? 'bg-[#F6F8FA] text-zinc-900 selection:bg-[#00C853] selection:text-white' 
        : 'bg-[#0A0A0A] text-white selection:bg-[#00C853] selection:text-black'
    }`}>
      {/* Dynamic Header */}
      <Header activePage={activePage} onNavigate={handleNavigate} />

      {/* Modern Multi-page Navigation Indicator Dot Strip (Sidebar Dots from Professional Polish) */}
      <div className={`fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4.5 hidden xl:flex z-45 backdrop-blur-xs px-3 py-5 rounded-full border transition-all ${
        isLight 
          ? 'bg-black/5 border-black/5 shadow-xs' 
          : 'bg-[#000000]/40 border-white/5 shadow-2xl'
      }`}>
        {['home', 'about', 'services', 'portfolio', 'experience', 'contact'].map((page) => {
          const isActive = activePage === page;
          return (
            <button
              key={page}
              onClick={() => handleNavigate(page)}
              className="group relative flex items-center justify-center focus:outline-hidden cursor-pointer"
              aria-label={`Navigate to ${page}`}
            >
              <span className={`absolute right-7 px-2 py-1 rounded border font-mono text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none select-none whitespace-nowrap shadow-2xl ${
                isLight 
                  ? 'bg-white border-zinc-200 text-[#006428]' 
                  : 'bg-[#1A1A1A] border-white/10 text-[#00C853]'
              }`}>
                {page}
              </span>
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? isLight
                      ? 'bg-[#00C853] scale-135 shadow-[0_0_8px_rgba(0,200,83,0.5)]'
                      : 'bg-[#00C853] scale-135 shadow-[0_0_8px_rgba(0,200,83,0.8)]' 
                    : isLight
                      ? 'bg-black/20 hover:bg-black/50 scale-100'
                      : 'bg-white/20 hover:bg-white/50 scale-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Main Pages with AnimatePresence exit/entry transitions */}
      <main className="flex-grow max-w-7xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} // smooth startup style curve
            className="w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PortfolioDataProvider>
        <MainApp />
      </PortfolioDataProvider>
    </ThemeProvider>
  );
}
