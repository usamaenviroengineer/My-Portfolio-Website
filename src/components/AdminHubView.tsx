import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolioData } from '../PortfolioDataContext';
import { useTheme } from '../ThemeContext';
import { 
  Plus, Edit2, Trash2, Check, X, Shield, RefreshCw, Mail, 
  Layers, ChevronRight, Save, LayoutGrid, Calendar, LogOut, 
  Sliders, MessageSquare, AlertCircle, Trash, Globe, MapPin, 
  ExternalLink, Code, User, Copy
} from 'lucide-react';
import { Project, Service, TimelineEvent, SkillGroup } from '../types';

export default function AdminHubView() {
  const { theme } = useTheme();
  const {
    userInfo,
    projects,
    services,
    timeline,
    skills,
    messages,
    loading,
    updateUserInfo,
    updateProjects,
    updateServices,
    updateTimeline,
    updateSkills,
    fetchMessages,
    deleteMessage
  } = usePortfolioData();

  const isLight = theme === 'light';

  // --- ADMINISTRATION SECURE ACCESS ENGINE ---
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('ur_cms_authorized') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsAuthorizing(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('ur_cms_authorized', 'true');
        setIsAuthorized(true);
        showStatus("Secure admin shell unlocked successfully!");
      } else {
        setAuthError(data.error || "The passcode entered is incorrect.");
      }
    } catch (err: any) {
      console.error("Login verification network failure:", err);
      setAuthError(`Network error: ${err?.message || String(err)}. Please try again.`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'projects' | 'services' | 'timeline' | 'skills' | 'profile' | 'inbox'>('projects');
  
  // Status feedback states
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for items
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});

  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);
  const [timelineForm, setTimelineForm] = useState<Partial<TimelineEvent>>({});

  const [skillsState, setSkillsState] = useState<SkillGroup[]>([]);
  const [profileState, setProfileState] = useState<typeof userInfo | null>(null);

  // Trigger loading message logs
  useEffect(() => {
    fetchMessages();
  }, []);

  // Sync state values on data load
  useEffect(() => {
    if (skills) setSkillsState(JSON.parse(JSON.stringify(skills)));
    if (userInfo) setProfileState({ ...userInfo });
  }, [skills, userInfo]);

  const showStatus = (msg: string, isOk = true) => {
    setSaveStatus({ success: isOk, message: msg });
    setTimeout(() => setSaveStatus(null), 5000);
  };

  // --- DATABASE DIAGNOSTICS & SYNC STATUS ---
  interface DbStatus {
    configured: boolean;
    supabaseUrl: string | null;
    configsTableOk: boolean;
    messagesTableOk: boolean;
    errors: string[];
  }
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [loadingDbStatus, setLoadingDbStatus] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchDbStatus = async () => {
    setLoadingDbStatus(true);
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error("Failed fetching database diagnostics status:", err);
    } finally {
      setLoadingDbStatus(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchDbStatus();
    }
  }, [isAuthorized]);

  const copySqlSchema = () => {
    const sql = `-- A. Table: portfolio_configs
CREATE TABLE IF NOT EXISTS portfolio_configs (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE portfolio_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON portfolio_configs FOR SELECT USING (true);
CREATE POLICY "Allow admin writes" ON portfolio_configs FOR ALL USING (true);

-- B. Table: contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin operations" ON contact_messages FOR ALL USING (true);`;
    
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // --- PROJECT MANAGEMENT ---
  const handleAddNewProject = () => {
    setEditingProjectId('new');
    setProjectForm({
      id: `proj-${Date.now()}`,
      title: '',
      description: '',
      category: 'Environmental Projects',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
      technologies: [],
      liveUrl: '#',
      githubUrl: '#',
      extendedDetails: {
        challenge: '',
        solution: '',
        impact: ''
      }
    });
  };

  const handleEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectForm({ ...p, extendedDetails: p.extendedDetails || { challenge: '', solution: '', impact: '' } });
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const filtered = projects.filter(p => p.id !== id);
    setIsSaving(true);
    const ok = await updateProjects(filtered);
    setIsSaving(false);
    if (ok) showStatus("Project deleted successfully!");
    else showStatus("Failed to delete project on server", false);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.description) {
      alert("Please fill in project Title and Description fields");
      return;
    }

    let updatedList: Project[];
    if (editingProjectId === 'new') {
      updatedList = [...projects, projectForm as Project];
    } else {
      updatedList = projects.map(p => p.id === editingProjectId ? (projectForm as Project) : p);
    }

    setIsSaving(true);
    const ok = await updateProjects(updatedList);
    setIsSaving(false);
    if (ok) {
      setEditingProjectId(null);
      showStatus("Project configurations saved successfully!");
    } else {
      showStatus("Failed to save projects to the backend server", false);
    }
  };

  // --- SERVICE MANAGEMENT ---
  const handleAddNewService = () => {
    setEditingServiceId('new');
    setServiceForm({
      id: `srv-${Date.now()}`,
      title: '',
      description: '',
      bullets: ['', '', ''],
      iconName: 'Code',
      category: 'core'
    });
  };

  const handleEditService = (s: Service) => {
    setEditingServiceId(s.id);
    setServiceForm({ ...s });
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    const filtered = services.filter(s => s.id !== id);
    setIsSaving(true);
    const ok = await updateServices(filtered);
    setIsSaving(false);
    if (ok) showStatus("Service deleted successfully!");
    else showStatus("Failed to delete service on server", false);
  };

  const handleSaveService = async () => {
    if (!serviceForm.title || !serviceForm.description) {
      alert("Please fill in service Title and Description");
      return;
    }

    let updatedList: Service[];
    if (editingServiceId === 'new') {
      updatedList = [...services, serviceForm as Service];
    } else {
      updatedList = services.map(s => s.id === editingServiceId ? (serviceForm as Service) : s);
    }

    setIsSaving(true);
    const ok = await updateServices(updatedList);
    setIsSaving(false);
    if (ok) {
      setEditingServiceId(null);
      showStatus("Service configs saved successfully!");
    } else {
      showStatus("Failed to save services", false);
    }
  };

  // --- TIMELINE EXPERIENCES ---
  const handleAddNewTimeline = () => {
    setEditingTimelineId('new');
    setTimelineForm({
      id: `time-${Date.now()}`,
      role: '',
      company: '',
      location: '',
      duration: '',
      description: ['', ''],
      skills: [],
      category: 'professional'
    });
  };

  const handleEditTimeline = (t: TimelineEvent) => {
    setEditingTimelineId(t.id);
    setTimelineForm({ ...t });
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this timeline event?")) return;
    const filtered = timeline.filter(t => t.id !== id);
    setIsSaving(true);
    const ok = await updateTimeline(filtered);
    setIsSaving(false);
    if (ok) showStatus("Timeline event deleted!");
    else showStatus("Failed to delete timeline event", false);
  };

  const handleSaveTimeline = async () => {
    if (!timelineForm.role || !timelineForm.company) {
      alert("Role and Company are required");
      return;
    }

    let updatedList: TimelineEvent[];
    if (editingTimelineId === 'new') {
      updatedList = [...timeline, timelineForm as TimelineEvent];
    } else {
      updatedList = timeline.map(t => t.id === editingTimelineId ? (timelineForm as TimelineEvent) : t);
    }

    setIsSaving(true);
    const ok = await updateTimeline(updatedList);
    setIsSaving(false);
    if (ok) {
      setEditingTimelineId(null);
      showStatus("Timeline experiences updated live!");
    } else {
      showStatus("Server write failed for timeline data", false);
    }
  };

  // --- SKILLS SLIDERS ---
  const handleSkillPercentageChange = (groupIndex: number, skillIndex: number, val: number) => {
    const updated = [...skillsState];
    updated[groupIndex].skills[skillIndex].percentage = val;
    setSkillsState(updated);
  };

  const handleSaveSkills = async () => {
    setIsSaving(true);
    const ok = await updateSkills(skillsState);
    setIsSaving(false);
    if (ok) showStatus("Skills matrix calibrated dynamically!");
    else showStatus("Failed to save skills back to server", false);
  };

  // --- PROFILE DATA ---
  const handleSaveProfile = async () => {
    if (!profileState) return;
    setIsSaving(true);
    const ok = await updateUserInfo(profileState);
    setIsSaving(false);
    if (ok) showStatus("Profile identity properties updated!");
    else showStatus("Failed to transmit profile data properties", false);
  };

  // --- INBOX MESSAGE OPERATIONS ---
  const handleDeleteInboxMessage = async (id: string) => {
    if (!window.confirm("Remove this client request permanently from database?")) return;
    const ok = await deleteMessage(id);
    if (ok) showStatus("Client message discarded.");
    else showStatus("Failed to discard message on server", false);
  };

  // Exit/Signout behavior redirects back to standard client environment
  const handleSignOut = () => {
    sessionStorage.removeItem('ur_cms_authorized');
    setIsAuthorized(false);
    window.location.hash = '#home';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-10 h-10 text-[#00C853] animate-spin mb-4" />
        <p className="font-mono text-xs text-[#00C853] uppercase tracking-widest font-bold">Decrypting portfolio properties...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className={`min-h-screen pt-28 pb-20 px-4 sm:px-6 flex items-center justify-center relative ${
        isLight ? 'bg-[#F6F8FA]' : 'bg-[#0A0A0A]'
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(#00C853_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
        
        <div className={`w-full max-w-md p-8 border rounded-3xl relative z-10 text-left backdrop-blur-md ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-950/80 border-white/5'
        }`}>
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,200,83,0.15)]">
              <Shield className="w-5 h-5 text-[#00C853]" />
            </div>
            <div>
              <h1 className={`font-display text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-900' : 'text-white'}`}>BRANDING CONSOLE CMS</h1>
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Authorized operations gateway</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-400 mb-2">Input Secure Verification Passcode</label>
              <input 
                type="password" 
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full p-3 rounded-xl border font-mono text-sm outline-hidden ${
                  isLight ? 'bg-zinc-50 border-zinc-200 text-black' : 'bg-black/50 border-white/10 text-white focus:border-[#00C853]/50'
                }`}
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-400 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isAuthorizing || !passcode}
              className="w-full py-3 bg-[#00C853] hover:bg-[#00E676] active:scale-[0.98] text-black font-semibold font-sans rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAuthorizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Unlocking Gateway...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Authorize Session
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-500/10 flex items-center justify-between font-mono text-[9px] text-zinc-500 font-bold">
            <span>SECURE SYSTEM: V2.5</span>
            <a href="#home" className="hover:text-[#00C853] transition-colors uppercase">← Abort & Safe Go Back</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-28 pb-20 px-4 sm:px-6 relative text-left ${
      isLight ? 'bg-[#F6F8FA]' : 'bg-[#0A0A0A]'
    }`}>
      {/* Decorative Matrix Code Background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#00C853_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Console Banner info */}
        <div className={`p-6 sm:p-8 border rounded-3xl mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative backdrop-blur-md ${
          isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900/30 border-white/5'
        }`}>
          {/* Neon green pulsing left glow corner */}
          <div className="absolute -left-12 -top-12 w-24 h-24 bg-[#00C853]/20 rounded-full filter blur-xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#00C853]/10 border border-[#00C853]/35 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-[#00C853]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#00C853] font-black bg-[#00C853]/10 px-2 py-0.5 rounded">ADMIN HQ SECURE SHELL</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-ping" />
              </div>
              <h1 className={`font-display text-2xl font-black tracking-tight mt-1 ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}>
                Branding Studio CMS
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button 
              onClick={fetchMessages}
              className={`px-3.5 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-2 cursor-pointer transition-all ${
                isLight ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200' : 'bg-black/50 hover:bg-black/70 border-white/5'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Synchronize
            </button>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600/15 text-red-400 hover:bg-red-600/20 border border-red-500/10 rounded-xl font-mono text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Return To Home
            </button>
          </div>
        </div>

        {/* Dynamic Save Action Feedback alert */}
        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-xl border mb-6 flex items-center gap-3 font-mono text-xs ${
                saveStatus.success 
                  ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveStatus.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace grid: left menu, right form panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Side rails */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            {[
              { id: 'projects', label: 'Portfolio Projects', icon: LayoutGrid, count: projects.length },
              { id: 'services', label: 'Consulting Services', icon: Layers, count: services.length },
              { id: 'timeline', label: 'Experience Timeline', icon: Calendar, count: timeline.length },
              { id: 'skills', label: 'Skills & Metrics', icon: Sliders, count: null },
              { id: 'profile', label: 'Identity/Profile', icon: User, count: null },
              { id: 'inbox', label: 'Client Messages Inbox', icon: MessageSquare, count: messages.filter(m => !m.isRead).length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setEditingProjectId(null);
                    setEditingServiceId(null);
                    setEditingTimelineId(null);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#00C853]/10 border-[#00C853]/40 text-[#00C853] font-bold shadow-xs' 
                      : isLight 
                        ? 'bg-white border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300' 
                        : 'bg-[#121212]/30 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00C853]' : 'text-zinc-500'}`} />
                    <span className="font-display text-sm tracking-wide">{tab.label}</span>
                  </div>
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#00C853] text-black' : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Database Cloud Sync Health Station */}
            <div className={`mt-4 p-5 rounded-2xl border text-left flex flex-col gap-3.5 relative overflow-hidden ${
              isLight ? 'bg-white border-zinc-200 shadow-xs' : 'bg-[#121212]/30 border-white/5'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#00C853] font-black">Supabase Sync Status</span>
                <button 
                  onClick={fetchDbStatus} 
                  disabled={loadingDbStatus}
                  className="font-mono text-[9px] text-[#00C853] hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${loadingDbStatus ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {loadingDbStatus ? (
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-3 bg-zinc-500/20 rounded w-2/3" />
                  <div className="h-2.5 bg-zinc-500/20 rounded w-1/2" />
                </div>
              ) : dbStatus ? (
                <div className="space-y-3">
                  {/* Row 1: Configurations Table */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Configs Table:</span>
                    {dbStatus.configsTableOk ? (
                      <span className="text-[#00C853] bg-[#00C853]/10 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-bold">
                        <Check className="w-2.5 h-2.5" /> OK
                      </span>
                    ) : (
                      <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                        Offline Fallback
                      </span>
                    )}
                  </div>

                  {/* Row 2: Messages Table */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Messages Table:</span>
                    {dbStatus.messagesTableOk ? (
                      <span className="text-[#00C853] bg-[#00C853]/10 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-bold">
                        <Check className="w-2.5 h-2.5" /> OK
                      </span>
                    ) : (
                      <span className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                        Offline Fallback
                      </span>
                    )}
                  </div>

                  {/* Warning advice block if tables do not exist */}
                  {(!dbStatus.configsTableOk || !dbStatus.messagesTableOk) && (
                    <div className="pt-2.5 border-t border-zinc-500/10 space-y-2">
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                        ⚠️ <span className="font-bold text-amber-500">PGRST125</span>: Tables are missing on Supabase. Copy & run the table SQL inside your Supabase project console SQL Editor to activate real-time cloud storage:
                      </p>
                      <button
                        onClick={copySqlSchema}
                        className="w-full py-2 bg-[#00C853]/10 hover:bg-[#00C853]/20 active:scale-[0.98] border border-[#00C853]/35 text-[#00C853] font-mono text-[9px] uppercase font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {copiedSql ? (
                          <>
                            <Check className="w-3 h-3" /> SQL copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" /> Copy SQL Setup code
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {dbStatus.configsTableOk && dbStatus.messagesTableOk && (
                    <div className="pt-1.5 text-[9px] text-[#00C853] font-mono flex items-center gap-1.5 bg-[#00C853]/5 p-2 rounded-xl">
                      <Shield className="w-4 h-4 shrink-0 text-[#00C853]" /> Cloud connection validated & synced.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-zinc-500 font-mono">
                  Diagnostics not loaded.
                </div>
              )}
            </div>
          </div>

          {/* Dynamic configuration dashboard panel split */}
          <div className="lg:col-span-9">

            {/* A: PROJECTS CONFIGURATION */}
            {activeTab === 'projects' && (
              <div className={`p-6 sm:p-8 border rounded-3xl text-left ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'
              }`}>
                {!editingProjectId ? (
                  <div>
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-500/10">
                      <div>
                        <h2 className={`font-display text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>Active Portfolio Listings</h2>
                        <p className="text-xs text-zinc-400 mt-1">Add, edit, structure, or hide records appearing inside work showcase grids.</p>
                      </div>
                      <button 
                        onClick={handleAddNewProject}
                        className="px-4 py-2 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                      >
                        <Plus className="w-4 h-4" /> Add Project
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map(p => (
                        <div 
                          key={p.id} 
                          className={`p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/20 border-white/5'
                          }`}
                        >
                          <div className="space-y-2 truncate">
                            <span className="font-mono text-[9px] text-[#00C853] font-bold uppercase">{p.category}</span>
                            <h3 className={`font-display font-bold text-sm truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>{p.title}</h3>
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{p.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1.5">
                              {p.technologies.slice(0, 3).map((t, idx) => (
                                <span key={idx} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-400">{t}</span>
                              ))}
                              {p.technologies.length > 3 && (
                                <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-400">+{p.technologies.length - 3}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                            <button 
                              onClick={() => handleEditProject(p)}
                              className="w-10 h-10 rounded-xl bg-zinc-500/10 border border-zinc-500/5 hover:border-[#00C853]/45 flex items-center justify-center text-zinc-400 hover:text-[#00C853] cursor-pointer transition-all"
                              title="Edit project properties"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProject(p.id)}
                              className="w-10 h-10 rounded-xl bg-red-500/5 border border-transparent hover:border-red-500/20 flex items-center justify-center text-zinc-500 hover:text-red-400 cursor-pointer transition-all"
                              title="Discard project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-500/10">
                      <h3 className={`font-display font-black text-lg ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {editingProjectId === 'new' ? 'Create Portfolio Piece' : `Configure: ${projectForm.title}`}
                      </h3>
                      <button 
                        onClick={() => setEditingProjectId(null)}
                        className="w-8 h-8 rounded-full border border-zinc-500/20 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Project Form Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Title</label>
                          <input 
                            type="text" 
                            value={projectForm.title || ''} 
                            onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                            className={`w-full p-3 rounded-xl border font-sans text-sm outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250 text-black' : 'bg-black/40 border-white/5 text-white focus:border-[#00C853]/50'
                            }`}
                            placeholder="e.g. Chemical Bioreactor Monitoring Kit"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Refuse/Skill Category Type</label>
                          <select 
                            value={projectForm.category || ''} 
                            onChange={e => setProjectForm({...projectForm, category: e.target.value as any})}
                            className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300 focus:border-[#00C853]/50'
                            }`}
                          >
                            <option value="Environmental Projects">Environmental Projects</option>
                            <option value="AI Projects">AI Projects</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Research">Research</option>
                            <option value="Design Work">Design Work</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Description</label>
                          <textarea 
                            rows={4}
                            value={projectForm.description || ''} 
                            onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                            className={`w-full p-3 rounded-xl border font-sans text-sm outline-hidden leading-relaxed ${
                              isLight ? 'bg-zinc-50 border-zinc-250 text-black' : 'bg-black/40 border-white/5 text-white focus:border-[#00C853]/50'
                            }`}
                            placeholder="Briefly state objectives, highlights, and features..."
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Asset/Screenshot URL</label>
                          <input 
                            type="text" 
                            value={projectForm.imageUrl || ''} 
                            onChange={e => setProjectForm({...projectForm, imageUrl: e.target.value})}
                            className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300 focus:border-[#00C853]/50'
                            }`}
                            placeholder="unsplash, netlify or external CDN path"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Technologies (Comma-separated)</label>
                          <input 
                            type="text" 
                            value={projectForm.technologies?.join(', ') || ''} 
                            onChange={e => setProjectForm({...projectForm, technologies: e.target.value.split(',').map(item => item.trim()).filter(Boolean)})}
                            className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300 focus:border-[#00C853]/50'
                            }`}
                            placeholder="React, PyTorch, YOLOv8, SvelteKit"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Live Demo URL</label>
                            <input 
                              type="text" 
                              value={projectForm.liveUrl || ''} 
                              onChange={e => setProjectForm({...projectForm, liveUrl: e.target.value})}
                              className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                                isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                              }`}
                              placeholder="#"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">GitHub Repos URL</label>
                            <input 
                              type="text" 
                              value={projectForm.githubUrl || ''} 
                              onChange={e => setProjectForm({...projectForm, githubUrl: e.target.value})}
                              className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                                isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                              }`}
                              placeholder="#"
                            />
                          </div>
                        </div>

                        {/* Extended Details (Challenge, Solution, Impact) */}
                        <div className="space-y-3 pt-2">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-bold">Extended Auditing Details (Accordion)</span>
                          
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1">Challenge</label>
                            <input 
                              type="text" 
                              value={projectForm.extendedDetails?.challenge || ''} 
                              onChange={e => setProjectForm({
                                ...projectForm, 
                                extendedDetails: { ...(projectForm.extendedDetails || { challenge: '', solution: '', impact: '' }), challenge: e.target.value }
                              })}
                              className={`w-full p-2.5 rounded-lg border font-sans text-xs outline-hidden ${
                                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/30 border-white/5 text-white'
                              }`}
                              placeholder="Problem statements..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1">Solution</label>
                            <input 
                              type="text" 
                              value={projectForm.extendedDetails?.solution || ''} 
                              onChange={e => setProjectForm({
                                ...projectForm, 
                                extendedDetails: { ...(projectForm.extendedDetails || { challenge: '', solution: '', impact: '' }), solution: e.target.value }
                              })}
                              className={`w-full p-2.5 rounded-lg border font-sans text-xs outline-hidden ${
                                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/30 border-white/5 text-white'
                              }`}
                              placeholder="Engineered answers..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-zinc-400 mb-1">Impact Measure</label>
                            <input 
                              type="text" 
                              value={projectForm.extendedDetails?.impact || ''} 
                              onChange={e => setProjectForm({
                                ...projectForm, 
                                extendedDetails: { ...(projectForm.extendedDetails || { challenge: '', solution: '', impact: '' }), impact: e.target.value }
                              })}
                              className={`w-full p-2.5 rounded-lg border font-sans text-xs outline-hidden ${
                                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/30 border-white/5 text-white'
                              }`}
                              placeholder="Metrics achieved e.g. 18% less effluent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-500/10">
                      <button
                        onClick={handleSaveProject}
                        disabled={isSaving}
                        className="px-6 py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> {isSaving ? 'Processing...' : 'Confirm & Save'}
                      </button>
                      <button
                        onClick={() => setEditingProjectId(null)}
                        className={`px-5 py-3 border rounded-xl font-mono text-xs cursor-pointer ${
                          isLight ? 'bg-zinc-105 border-zinc-200 hover:bg-zinc-201 text-zinc-700' : 'bg-transparent border-white/5 hover:bg-white/5 text-zinc-400'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* B: SERVICES CONFIGURATION */}
            {activeTab === 'services' && (
              <div className={`p-6 sm:p-8 border rounded-3xl text-left ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'
              }`}>
                {!editingServiceId ? (
                  <div>
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-500/10">
                      <div>
                        <h2 className={`font-display text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>Consultation Service Offerings</h2>
                        <p className="text-xs text-zinc-400 mt-1">Manage core engineering solutions and creative digital developer assets.</p>
                      </div>
                      <button 
                        onClick={handleAddNewService}
                        className="px-4 py-2 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                      >
                        <Plus className="w-4 h-4" /> Add Service
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map(s => (
                        <div 
                          key={s.id} 
                          className={`p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/20 border-white/5'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] text-[#00C853] bg-[#00C853]/10 px-1.5 py-0.5 rounded font-black uppercase">{s.category}</span>
                              <span className="font-mono text-[9px] text-zinc-400 font-medium">Icon: {s.iconName}</span>
                            </div>
                            <h3 className={`font-display font-bold text-sm mt-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>{s.title}</h3>
                            <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{s.description}</p>
                            <span className="block font-mono text-[8px] text-[#00C853]/80 mt-2 font-bold uppercase">{s.bullets?.length || 0} Scope Bullet points</span>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                            <button 
                              onClick={() => handleEditService(s)}
                              className="w-10 h-10 rounded-xl bg-zinc-500/10 border border-zinc-500/5 hover:border-[#00C853]/45 flex items-center justify-center text-zinc-400 hover:text-[#00C853] cursor-pointer transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteService(s.id)}
                              className="w-10 h-10 rounded-xl bg-red-500/5 border border-transparent hover:border-red-500/20 flex items-center justify-center text-zinc-500 hover:text-red-400 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-500/10">
                      <h3 className={`font-display font-black text-lg ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {editingServiceId === 'new' ? 'Build Consulting Service' : `Configure: ${serviceForm.title}`}
                      </h3>
                      <button 
                        onClick={() => setEditingServiceId(null)}
                        className="w-8 h-8 rounded-full border border-zinc-500/20 flex items-center justify-center text-zinc-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Service Title</label>
                          <input 
                            type="text" 
                            value={serviceForm.title || ''} 
                            onChange={e => setServiceForm({...serviceForm, title: e.target.value})}
                            className={`w-full p-3 rounded-xl border text-sm outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250 text-black' : 'bg-black/40 border-white/5 text-white focused:border-[#00C853]'
                            }`}
                            placeholder="e.g. YOLOv8 Sorting Rig Deployments"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Category Segment</label>
                          <select 
                            value={serviceForm.category || ''} 
                            onChange={e => setServiceForm({...serviceForm, category: e.target.value as any})}
                            className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                            }`}
                          >
                            <option value="core">Core Engineering (Biosorbents, EIA, Audits)</option>
                            <option value="digital">Digital Development (React, SEO, Shopify)</option>
                            <option value="creative">Creative Workspace (UI/UX Design, Videos)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Service Description</label>
                          <textarea 
                            rows={3}
                            value={serviceForm.description || ''} 
                            onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                            className={`w-full p-3 rounded-xl border text-sm outline-hidden leading-relaxed ${
                              isLight ? 'bg-zinc-50 border-zinc-250 text-black' : 'bg-black/40 border-white/5 text-white'
                            }`}
                            placeholder="Deliver a descriptive summary explaining scientific background..."
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Lucide Dynamic Icon Name</label>
                          <input 
                            type="text" 
                            value={serviceForm.iconName || ''} 
                            onChange={e => setServiceForm({...serviceForm, iconName: e.target.value})}
                            className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                            }`}
                            placeholder="e.g. Droplet, Cpu, Code, Globe, Palette, TrendingUp"
                          />
                        </div>
                      </div>

                      <div>
                        {/* Scope/Bullet checklist fields */}
                        <div className="space-y-4">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-bold">Scope Deliverables (Checked bullets)</span>
                          
                          {[0, 1, 2, 3].map((idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="font-mono text-xs text-zinc-500 pt-3">{idx + 1}</span>
                              <input 
                                type="text" 
                                value={serviceForm.bullets?.[idx] || ''} 
                                onChange={e => {
                                  const temp = [...(serviceForm.bullets || ['', '', '', ''])];
                                  temp[idx] = e.target.value;
                                  setServiceForm({...serviceForm, bullets: temp});
                                }}
                                className={`w-full p-2.5 rounded-xl border text-xs outline-hidden ${
                                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5 text-white'
                                }`}
                                placeholder="Core deliverable item line..."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-500/10">
                      <button
                        onClick={handleSaveService}
                        disabled={isSaving}
                        className="px-6 py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> {isSaving ? 'Processing...' : 'Confirm & Save'}
                      </button>
                      <button
                        onClick={() => setEditingServiceId(null)}
                        className={`px-5 py-3 border rounded-xl font-mono text-xs cursor-pointer ${
                          isLight ? 'bg-zinc-105 border-zinc-200 hover:bg-zinc-201 text-zinc-700' : 'bg-transparent border-white/5 hover:bg-white/5 text-zinc-400'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* C: EXPERIENCE TIMELINE */}
            {activeTab === 'timeline' && (
              <div className={`p-6 sm:p-8 border rounded-3xl text-left ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'
              }`}>
                {!editingTimelineId ? (
                  <div>
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-500/10">
                      <div>
                        <h2 className={`font-display text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>Academic & Professional Timeline</h2>
                        <p className="text-xs text-zinc-400 mt-1">Manage physical engineering stages, Unscripted Studio projects, and voluntary climate logs.</p>
                      </div>
                      <button 
                        onClick={handleAddNewTimeline}
                        className="px-4 py-2 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                      >
                        <Plus className="w-4 h-4" /> Add Event
                      </button>
                    </div>

                    <div className="space-y-4">
                      {timeline.map(t => (
                        <div 
                          key={t.id} 
                          className={`p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                            isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/20 border-white/5'
                          }`}
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono">
                              <span className="text-[#00C853] bg-[#00C853]/10 px-1.5 py-0.5 rounded font-black uppercase">{t.category}</span>
                              <span className="text-zinc-400">{t.duration}</span>
                              <span className="text-zinc-500">• {t.location}</span>
                            </div>
                            <h3 className={`font-display font-bold text-sm mt-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                              {t.role} <span className="text-zinc-400 font-normal">at</span> {t.company}
                            </h3>
                            <ul className="list-disc list-inside text-xs text-zinc-400 mt-2 space-y-1.5 leading-relaxed">
                              {t.description.slice(0, 2).map((desc, idx) => (
                                <li key={idx} className="line-clamp-1">{desc}</li>
                              ))}
                            </ul>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {t.skills.map((sk, idx) => (
                                <span key={idx} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-zinc-500/15 text-zinc-400">{sk}</span>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                            <button 
                              onClick={() => handleEditTimeline(t)}
                              className="w-10 h-10 rounded-xl bg-zinc-500/10 border border-zinc-500/5 hover:border-[#00C853]/45 flex items-center justify-center text-zinc-400 hover:text-[#00C853] cursor-pointer transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTimeline(t.id)}
                              className="w-10 h-10 rounded-xl bg-red-500/5 border border-transparent hover:border-red-500/20 flex items-center justify-center text-zinc-500 hover:text-red-400 cursor-pointer transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-500/10">
                      <h3 className={`font-display font-black text-lg ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {editingTimelineId === 'new' ? 'Build Timeline Event' : `Configure: ${timelineForm.role}`}
                      </h3>
                      <button 
                        onClick={() => setEditingTimelineId(null)}
                        className="w-8 h-8 rounded-full border border-zinc-500/20 flex items-center justify-center text-zinc-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Role Title</label>
                          <input 
                            type="text" 
                            value={timelineForm.role || ''} 
                            onChange={e => setTimelineForm({...timelineForm, role: e.target.value})}
                            className={`w-full p-3 rounded-xl border text-sm outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250 text-black' : 'bg-black/40 border-white/5 text-white focus:border-[#00C853]'
                            }`}
                            placeholder="e.g. Lead Environmental Auditor"
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Company / Institution Name</label>
                          <input 
                            type="text" 
                            value={timelineForm.company || ''} 
                            onChange={e => setTimelineForm({...timelineForm, company: e.target.value})}
                            className={`w-full p-3 rounded-xl border text-sm outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250 text-black' : 'bg-black/40 border-white/5 text-white'
                            }`}
                            placeholder="Mehran U.E.T or Unscripted Studio"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Duration / Years</label>
                            <input 
                              type="text" 
                              value={timelineForm.duration || ''} 
                              onChange={e => setTimelineForm({...timelineForm, duration: e.target.value})}
                              className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                                isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                              }`}
                              placeholder="e.g. 2025 - 2029"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Location Coordinates</label>
                            <input 
                              type="text" 
                              value={timelineForm.location || ''} 
                              onChange={e => setTimelineForm({...timelineForm, location: e.target.value})}
                              className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                                isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                              }`}
                              placeholder="Matli, Badin, Pakistan"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Classification Node</label>
                          <select 
                            value={timelineForm.category || ''} 
                            onChange={e => setTimelineForm({...timelineForm, category: e.target.value as any})}
                            className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                            }`}
                          >
                            <option value="professional">Professional Careers</option>
                            <option value="academic">Academic / Mehran U.E.T Research</option>
                            <option value="volunteer">Volunteer & Climate Activism</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Skills Utilized (Comma-separated)</label>
                          <input 
                            type="text" 
                            value={timelineForm.skills?.join(', ') || ''} 
                            onChange={e => setTimelineForm({...timelineForm, skills: e.target.value.split(',').map(item => item.trim()).filter(Boolean)})}
                            className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-300'
                            }`}
                            placeholder="GIS, Water Treatment, OpenCV"
                          />
                        </div>

                        <div className="space-y-3">
                          <span className="block font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-bold">Key Responsibilities</span>
                          
                          {[0, 1, 2].map((idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="font-mono text-xs text-zinc-500 pt-3">{idx + 1}</span>
                              <input 
                                type="text" 
                                value={timelineForm.description?.[idx] || ''} 
                                onChange={e => {
                                  const temp = [...(timelineForm.description || ['', '', ''])];
                                  temp[idx] = e.target.value;
                                  setTimelineForm({...timelineForm, description: temp});
                                }}
                                className={`w-full p-2.5 rounded-xl border text-xs outline-hidden ${
                                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5 text-white'
                                }`}
                                placeholder="Core action achievement detail..."
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-500/10">
                      <button
                        onClick={handleSaveTimeline}
                        disabled={isSaving}
                        className="px-6 py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" /> {isSaving ? 'Processing...' : 'Confirm & Save'}
                      </button>
                      <button
                        onClick={() => setEditingTimelineId(null)}
                        className={`px-5 py-3 border rounded-xl font-mono text-xs cursor-pointer ${
                          isLight ? 'bg-zinc-105 border-zinc-200 hover:bg-zinc-201 text-zinc-700' : 'bg-transparent border-white/5 hover:bg-white/5 text-zinc-400'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* D: SKILLS & METRICS */}
            {activeTab === 'skills' && (
              <div className={`p-6 sm:p-8 border rounded-3xl text-left ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'
              }`}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-500/10">
                  <div>
                    <h2 className={`font-display text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>Cognitive Skill Metrics</h2>
                    <p className="text-xs text-zinc-400 mt-1">Calibrate proficiency scales (percentages) shown inside visual graphs across four key competencies.</p>
                  </div>
                  <button 
                    onClick={handleSaveSkills}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#00C853] hover:bg-[#00E676] text-black font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Matrix'}
                  </button>
                </div>

                <div className="space-y-8">
                  {skillsState.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-4">
                      <h3 className="font-mono text-xs uppercase tracking-widest text-[#00C853] font-black">{group.category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {group.skills.map((sk, skIdx) => (
                          <div 
                            key={skIdx} 
                            className={`p-4 rounded-xl border space-y-2 ${
                              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/20 border-white/5'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className={`font-semibold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>{sk.name}</span>
                              <span className="font-mono text-[#00C853] font-bold">{sk.percentage}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="1" 
                              max="100" 
                              value={sk.percentage} 
                              onChange={e => handleSkillPercentageChange(groupIdx, skIdx, parseInt(e.target.value))}
                              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-700 accent-[#00C853]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* E: PROFILE IDENTITY */}
            {activeTab === 'profile' && profileState && (
              <div className={`p-6 sm:p-8 border rounded-3xl text-left ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'
              }`}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-500/10">
                  <div>
                    <h2 className={`font-display text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>Personal Identity parameters</h2>
                    <p className="text-xs text-zinc-400 mt-1">Configure global text tags, location pins, emails, socials, and visual CDN assets.</p>
                  </div>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#00C853] hover:bg-[#00E676] text-black font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                  >
                    <Save className="w-4 h-4" /> {isSaving ? 'Processing...' : 'Save Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Full Label</label>
                      <input 
                        type="text" 
                        value={profileState.fullName || ''} 
                        onChange={e => setProfileState({...profileState, fullName: e.target.value})}
                        className={`w-full p-3 rounded-xl border text-sm outline-hidden ${
                          isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Display Roles</label>
                      <input 
                        type="text" 
                        value={profileState.role || ''} 
                        onChange={e => setProfileState({...profileState, role: e.target.value})}
                        className={`w-full p-3 rounded-xl border text-sm outline-hidden ${
                          isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Audenda taglines</label>
                      <input 
                        type="text" 
                        value={profileState.tagline || ''} 
                        onChange={e => setProfileState({...profileState, tagline: e.target.value})}
                        className={`w-full p-3 rounded-xl border text-sm outline-hidden ${
                          isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Inboxed Bio Details</label>
                      <textarea 
                        rows={4}
                        value={profileState.aboutBrief || ''} 
                        onChange={e => setProfileState({...profileState, aboutBrief: e.target.value})}
                        className={`w-full p-3 rounded-xl border text-sm outline-hidden leading-relaxed ${
                          isLight ? 'bg-zinc-50 border-zinc-250 text-black' : 'bg-black/40 border-white/5 text-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Secure Contact eMail</label>
                      <input 
                        type="email" 
                        value={profileState.email || ''} 
                        onChange={e => setProfileState({...profileState, email: e.target.value})}
                        className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                          isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-zinc-350'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-2">Location Coordinates</label>
                      <input 
                        type="text" 
                        value={profileState.location || ''} 
                        onChange={e => setProfileState({...profileState, location: e.target.value})}
                        className={`w-full p-3 rounded-xl border text-sm outline-hidden ${
                          isLight ? 'bg-zinc-50 border-zinc-250' : 'bg-black/40 border-white/5 text-white'
                        }`}
                      />
                    </div>

                    <div className="space-y-3">
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-bold">Social Handles URLs</span>
                      
                      {Object.keys(profileState.socials || {}).map((socKey) => (
                        <div key={socKey} className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500 w-16 uppercase">{socKey}</span>
                          <input 
                            type="text" 
                            value={(profileState.socials as any)[socKey] || ''} 
                            onChange={e => {
                              const socTemp = { ...profileState.socials };
                              (socTemp as any)[socKey] = e.target.value;
                              setProfileState({ ...profileState, socials: socTemp as any });
                            }}
                            className={`w-full p-2 rounded-lg border font-mono text-[11px] outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5 text-zinc-400'
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="block font-mono text-[10px] uppercase tracking-widest text-[#00C853] font-bold">Graphic Asset Links (Netlify/CDN)</span>
                      
                      {Object.keys(profileState.images || {}).map((imgKey) => (
                        <div key={imgKey} className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500 w-16 uppercase">{imgKey}</span>
                          <input 
                            type="text" 
                            value={(profileState.images as any)[imgKey] || ''} 
                            onChange={e => {
                              const imgTemp = { ...profileState.images };
                              (imgTemp as any)[imgKey] = e.target.value;
                              setProfileState({ ...profileState, images: imgTemp as any });
                            }}
                            className={`w-full p-2 rounded-lg border font-mono text-[11px] outline-hidden ${
                              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5 text-zinc-400'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* F: CLIENT INBOX LIST */}
            {activeTab === 'inbox' && (
              <div className={`p-6 sm:p-8 border rounded-3xl text-left ${
                isLight ? 'bg-white border-zinc-200' : 'bg-[#121212] border-white/5'
              }`}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-500/10">
                  <div>
                    <h2 className={`font-display text-lg font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>Consultation Request Inbox</h2>
                    <p className="text-xs text-zinc-400 mt-1">Direct message requests captured down in real-time. Automatically logged and preserved.</p>
                  </div>
                  <span className="font-mono text-xs text-[#00C853] font-black bg-[#00C853]/10 px-3 py-1.5 border border-[#00C853]/20 rounded-xl">
                    {messages.length} Requests Received
                  </span>
                </div>

                {messages.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <Mail className="w-10 h-10 text-zinc-600 mx-auto" strokeWidth={1} />
                    <p className="font-mono text-xs text-zinc-500 uppercase">Inbox is completely clean.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m) => (
                      <div 
                        key={m.id}
                        className={`p-6 border rounded-2xl relative transition-all flex flex-col md:flex-row items-start justify-between gap-4 ${
                          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-black/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="space-y-3 text-left">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                            <span className="text-white font-black bg-[#00C853] px-2 py-0.5 rounded shadow-sm">{m.name}</span>
                            <a href={`mailto:${m.email}`} className="text-[#00C853] hover:underline flex items-center gap-1">
                              {m.email} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <span className="text-zinc-500">• {new Date(m.timestamp).toLocaleString()}</span>
                            <span className="text-zinc-500">• IP: {m.ipAddress || 'Unknown'}</span>
                          </div>

                          <div>
                            <span className="block font-mono text-[9px] text-[#00C853] font-black uppercase tracking-wider">Subject</span>
                            <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{m.subject}</h4>
                          </div>

                          <div className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                            isLight ? 'bg-white text-zinc-700' : 'bg-[#0E0E0E] text-zinc-300'
                          }`}>
                            {m.message}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteInboxMessage(m.id)}
                          className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/10 flex items-center justify-center shrink-0 cursor-pointer self-end md:self-start transition-all"
                          title="Purge request records"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
