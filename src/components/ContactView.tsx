import React, { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolioData } from '../PortfolioDataContext';
import { useTheme } from '../ThemeContext';
import BrandedImage from './BrandedImage';
import { Mail, MapPin, Send, CheckCircle, Clock } from 'lucide-react';

export default function ContactView() {
  const { userInfo } = usePortfolioData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'AI Solutions & Web Dev',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { theme } = useTheme();

  const isLight = theme === 'light';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    // Completely client-side simulated logging and SLA registration
    setTimeout(() => {
      console.log("[Simulation Contact Logged] Spec Packets Dispatch Completed. Ready for incoming queues.");
      console.log("Client payload:", {
        name: formData.name,
        email: formData.email,
        subject: formData.service,
        message: formData.message,
        timestamp: new Date().toISOString()
      });
      setIsSuccess(true);
      setIsSubmitting(false);
      
      // Clear form inputs
      setFormData({
        name: '',
        email: '',
        service: 'AI Solutions & Web Dev',
        message: ''
      });
    }, 600);
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      service: e.target.value
    }));
  };

  const isFormValid = formData.name.trim() !== '' && formData.email.trim() !== '' && formData.message.trim() !== '';

  return (
    <div id="contact-view" className="w-full pt-32 pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
        
        {/* Page title header */}
        <div className="max-w-2xl mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#00C853] font-semibold mb-3 block">05 // System Convo & Specifications</span>
          <h1 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 ${
            isLight ? 'text-zinc-900' : 'text-white'
          }`}>
            Get In Touch
          </h1>
          <p className={`text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-zinc-650' : 'text-zinc-440'
          }`}>
            Ready to integrate automated solid-waste sorting pipelines, custom WordPress layouts, or responsive Next.js corporate projects? Dispatch your brief instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Cards, Map & Personal Portrait */}
          <div className="lg:col-span-5 space-y-8">
            {/* Quick Contact Info Info */}
            <div className="grid grid-cols-1 gap-4 font-display">
              <a 
                href={`mailto:${userInfo.email}`}
                className={`group flex items-center gap-4 p-5 border rounded-2xl transition-all ${
                  isLight 
                    ? 'bg-white border-zinc-200 hover:border-[#00C853]/45 shadow-sm' 
                    : 'bg-[#121212] border-white/5 hover:border-[#00C853]/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isLight ? 'bg-zinc-150 border border-zinc-200' : 'bg-white/5 border border-white/10'
                }`}>
                  <Mail className="w-4 h-4 text-[#00C853]" />
                </div>
                <div className="overflow-hidden p-0.5">
                  <span className={`block text-[9px] uppercase font-mono tracking-widest ${isLight ? 'text-zinc-450' : 'text-zinc-500'}`}>SECURE CONVERSATION</span>
                  <span className={`block text-xs font-bold truncate transition-colors leading-relaxed ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>{userInfo.email}</span>
                </div>
              </a>

              <div className={`flex items-center gap-4 p-5 border rounded-2xl ${
                isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#121212] border-white/5'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isLight ? 'bg-zinc-150 border border-zinc-200' : 'bg-white/5 border border-white/10'
                }`}>
                  <MapPin className="w-4 h-4 text-[#00C853]" />
                </div>
                <div className="p-0.5">
                  <span className={`block text-[9px] uppercase font-mono tracking-widest ${isLight ? 'text-zinc-450' : 'text-zinc-500'}`}>LOCAL REGION</span>
                  <span className={`block text-xs font-bold leading-relaxed ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>{userInfo.location}</span>
                </div>
              </div>
            </div>

            {/* Free-floating Branded Image representing Personal Contact Brand */}
            <div className="w-full pt-4 flex justify-center">
              <BrandedImage 
                src={userInfo.images?.contact || "https://myphotosss.netlify.app/3.png"} 
                className="max-w-[340px] w-full"
                alt="Usama contact artwork" 
                aspectRatio="aspect-[4/5]"
              />
            </div>
          </div>

          {/* Right Column: Interaction Form */}
          <div className={`lg:col-span-7 border rounded-3xl p-8 relative ${
            isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#121212] border-white/5'
          }`}>
            
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form 
                  key="contact-form"
                  id="contact-form-node"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className={`text-left mb-8 border-b pb-4 ${isLight ? 'border-zinc-150' : 'border-white/5'}`}>
                    <h3 className={`font-display font-bold text-lg ${isLight ? 'text-zinc-900' : 'text-white'}`}>Direct Message Receiver</h3>
                    <p className={`text-xs mt-1 leading-normal ${isLight ? 'text-zinc-650' : 'text-zinc-440'}`}>Form submissions are validated and logged for instant response queues.</p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-red-600/10 border border-red-500/20 text-red-400 font-mono text-xs rounded-xl text-left">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                    <div className="flex flex-col">
                      <label htmlFor="name" className={`font-display font-bold text-[10px] uppercase tracking-wider mb-2 ${
                        isLight ? 'text-zinc-500' : 'text-zinc-455'
                      }`}>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleTextChange}
                        disabled={isSubmitting}
                        required
                        placeholder="John Doe"
                        className={`px-4 py-3 rounded-xl text-xs outline-hidden transition-all focus:ring-1 focus:ring-[#00C853]/40 border ${
                          isLight 
                            ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 focus:border-[#00C853] text-zinc-800 focus:bg-white' 
                            : 'bg-black/40 border-white/5 hover:border-white/15 focus:border-[#00C853] text-zinc-350'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="email" className={`font-display font-bold text-[10px] uppercase tracking-wider mb-2 ${
                        isLight ? 'text-zinc-500' : 'text-zinc-455'
                      }`}>Corporate Email</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleTextChange}
                        disabled={isSubmitting}
                        required
                        placeholder="johndoe@agency.com"
                        className={`px-4 py-3 rounded-xl text-xs outline-hidden transition-all focus:ring-1 focus:ring-[#00C853]/40 border ${
                          isLight 
                            ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 focus:border-[#00C853] text-zinc-800 focus:bg-white' 
                            : 'bg-black/40 border-white/5 hover:border-white/15 focus:border-[#00C853] text-zinc-350'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Dropdown service selector */}
                  <div className="flex flex-col text-left">
                    <label htmlFor="service" className={`font-display font-bold text-[10px] uppercase tracking-wider mb-2 ${
                      isLight ? 'text-zinc-500' : 'text-zinc-455'
                    }`}>Core Requirement</label>
                    <select
                      name="service"
                      id="service"
                      value={formData.service}
                      onChange={handleSelectChange}
                      disabled={isSubmitting}
                      className={`px-4 py-3 rounded-xl text-xs outline-hidden transition-all focus:ring-1 focus:ring-[#00C853]/40 border ${
                        isLight 
                          ? 'bg-zinc-50 border-zinc-200 focus:border-[#00C853] text-zinc-805' 
                          : 'bg-black/40 border-white/5 focus:border-[#00C853] text-zinc-350'
                      }`}
                    >
                      <option className={isLight ? "bg-white text-zinc-90 w-full" : "bg-[#0a0a0a] text-white"} value="AI Solutions & Web Dev">AI Solutions & Web Development</option>
                      <option className={isLight ? "bg-white text-zinc-90 w-full" : "bg-[#0a0a0a] text-white"} value="Environmental Consulting">Environmental / Water Consultation</option>
                      <option className={isLight ? "bg-white text-zinc-90 w-full" : "bg-[#0a0a0a] text-white"} value="WordPress Custom Theme">WordPress Theme Customizer</option>
                      <option className={isLight ? "bg-white text-zinc-90 w-full" : "bg-[#0a0a0a] text-white"} value="Shopify Dropshipping E-commerce">Shopify Store Assembly</option>
                      <option className={isLight ? "bg-white text-zinc-90 w-full" : "bg-[#0a0a0a] text-white"} value="Branding & Media Post-Production">Branding or Video Editing</option>
                    </select>
                  </div>

                  <div className="flex flex-col text-left">
                    <label htmlFor="message" className={`font-display font-bold text-[10px] uppercase tracking-wider mb-2 ${
                      isLight ? 'text-zinc-500' : 'text-zinc-455'
                    }`}>Brief Specific Scopes</label>
                    <textarea
                      name="message"
                      id="message"
                      value={formData.message}
                      onChange={handleTextChange}
                      disabled={isSubmitting}
                      required
                      rows={5}
                      placeholder="List project schedules, required features, or ecological concerns..."
                      className={`px-4 py-3 rounded-xl text-xs outline-hidden transition-all focus:ring-1 focus:ring-[#00C853]/40 border resize-none ${
                        isLight 
                          ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 focus:border-[#00C853] text-zinc-800 focus:bg-white' 
                          : 'bg-black/40 border-white/5 hover:border-white/15 focus:border-[#00C853] text-zinc-350 bg-black/20'
                      }`}
                    />
                  </div>

                  {/* Action button */}
                  <button
                    type="submit"
                    id="submit-contact-form"
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full relative group overflow-hidden py-4 text-white font-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xl cursor-pointer ${
                      isSubmitting || !isFormValid
                        ? 'bg-zinc-200 border border-zinc-300 text-zinc-400 cursor-not-allowed'
                        : 'bg-[#00C853] hover:bg-[#00963c]'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2 relative z-10 transition-transform">
                      {isSubmitting ? 'Transmitting Specification...' : 'Transmit Specification Packet'}
                      <Send className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="contact-success"
                  id="contact-success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="py-12 px-6 text-center"
                >
                  <div className="w-16 h-16 bg-[#00C853]/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00C853]/55">
                    <CheckCircle className="w-8 h-8 text-[#00C853]" />
                  </div>
                  
                  <h3 className={`font-display font-bold text-2xl mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>Transmission Logged</h3>
                  <p className="text-[#00C853] font-mono text-xs uppercase tracking-widest font-bold mb-6">UNSCRIPTED STUDIO REGISTERED</p>
                  
                  <div className={`max-w-md mx-auto p-5 rounded-2xl border text-left mb-8 space-y-3 font-sans ${
                    isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#0A0A0A] border-white/5'
                  }`}>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-[#00C853] shrink-0 mt-0.5" />
                      <div>
                        <span className={`block text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Average Response SLA</span>
                        <span className={`block text-xs ${isLight ? 'text-zinc-650' : 'text-zinc-440'}`}>Within 10 hours directly to your corporate inbox.</span>
                      </div>
                    </div>
                    <div className={`border-t pt-3 mt-3 ${isLight ? 'border-zinc-200' : 'border-white/5'}`}>
                      <span className="block text-[10px] text-zinc-500 font-mono">ENCRYPTED TELEMETRY LOCK STATE // VALID</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSuccess(false)}
                    className={`px-6 py-3 font-display text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer ${
                      isLight 
                        ? 'bg-zinc-900 text-white hover:bg-[#00C853]' 
                        : 'bg-white text-black hover:bg-[#00C853] hover:text-white'
                    }`}
                  >
                    Send another packet
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
}
