import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  supabase, 
  isSupabaseConfigured,
  uploadImage 
} from '../supabaseClient';
import { usePortfolioData } from '../PortfolioDataContext';
import { Project, Service, TimelineEvent, SkillGroup } from '../types';
import { 
  Sliders, 
  Layers, 
  FolderGit, 
  Cpu, 
  Briefcase, 
  Globe, 
  Image as ImageIcon,
  CheckCircle, 
  AlertTriangle, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  RefreshCw, 
  FileCode, 
  KeyRound, 
  Mail, 
  Lock, 
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Database
} from 'lucide-react';

export default function AdminView() {
  const { 
    userInfo, 
    projects, 
    services, 
    timeline, 
    skills, 
    reasons, 
    funFacts, 
    seoSettings,
    loading: dataLoading,
    dbConnected,
    contactMessages,
    deleteContactMessage,
    toggleReadMessage,
    loadContactMessages,
    saveUserInfo,
    saveProjects,
    saveServices,
    saveTimeline,
    saveSkills,
    saveReasons,
    saveFunFacts,
    saveSEOSettings,
    seedDatabase
  } = usePortfolioData();

  // Auth State
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false);

  // Dashboard Control Panel Navigation
  const [activeTab, setActiveTab] = useState<string>('database');

  // Multi-state forms
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Local Form Buffers (Synced with context on mount/tabs change)
  const [heroForm, setHeroForm] = useState<any>(null);
  const [seoForm, setSeoForm] = useState<any>(null);
  const [skillsForm, setSkillsForm] = useState<SkillGroup[]>([]);
  const [reasonsForm, setReasonsForm] = useState<any[]>([]);
  const [funFactsForm, setFunFactsForm] = useState<any[]>([]);

  // Item Editing Modals Core States
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<Partial<TimelineEvent> | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [messagesFilter, setMessagesFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [messagesSearch, setMessagesSearch] = useState<string>('');

  // Image Upload Substates
  const [uploadLoading, setUploadLoading] = useState<string | null>(null); // tracks fields uploading like 'hero', 'about', or project-id

  // Load and subscribe to Auth states on mount
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setProfile(session?.user || null);
      setAuthLoading(false);
    });

    // Handle session state changes dynamically (Realtime auth tracking)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setProfile(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hydrate local forms from Context when available
  useEffect(() => {
    if (userInfo) {
      setHeroForm({ ...userInfo });
    }
    if (seoSettings) {
      setSeoForm({ ...seoSettings });
    }
    if (skills && skills.length > 0) {
      setSkillsForm(JSON.parse(JSON.stringify(skills))); // Deep copy
    }
    if (reasons && reasons.length > 0) {
      setReasonsForm(JSON.parse(JSON.stringify(reasons)));
    }
    if (funFacts && funFacts.length > 0) {
      setFunFactsForm(JSON.parse(JSON.stringify(funFacts)));
    }
  }, [userInfo, seoSettings, skills, reasons, funFacts, activeTab]);

  // Sync messages when Messages activeTab is visited
  useEffect(() => {
    if (activeTab === 'messages') {
      loadContactMessages();
    }
  }, [activeTab]);

  // Auth Submit Action handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setLoginError('Supabase is not configured yet. Add credentials in your code first.');
      return;
    }

    try {
      setLoginError(null);
      setAuthActionLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        throw error;
      }
      setProfile(data.user);
    } catch (err: any) {
      console.error('Auth failure:', err);
      setLoginError(err.message || 'Incorrect email and/or password coordinates.');
    } finally {
      setAuthActionLoading(false);
    }
  };

  // Sign out handle
  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (err) {
      console.error('Signout failed', err);
    }
  };

  // Helper flash toast trigger
  const triggerStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Image upload triggers
  const triggerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string, isProjectForm = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(targetField);
      // Upload raw image attachment toassets bucket on Supabase Storage
      const uploadedUrl = await uploadImage(file);
      
      if (!uploadedUrl) {
        triggerStatus('Image upload failed. Run storage setup SQL commands in Supabase first.', 'error');
        return;
      }

      if (isProjectForm && editingProject) {
        setEditingProject(prev => ({ ...prev, imageUrl: uploadedUrl }));
        triggerStatus('Project mock image uploaded to Supabase Assets successfully!');
      } else if (heroForm) {
        if (targetField.startsWith('images.')) {
          const key = targetField.split('.')[1];
          setHeroForm((prev: any) => ({
            ...prev,
            images: {
              ...prev.images,
              [key]: uploadedUrl
            }
          }));
          triggerStatus(`Dashboard design profile ${key} image updated! Submit changes to save.`);
        }
      }
    } catch (err) {
      console.error(err);
      triggerStatus('Error processing attachment file upload.', 'error');
    } finally {
      setUploadLoading(null);
    }
  };

  // Save General configs
  const handleSaveHeroAbout = async () => {
    if (!heroForm) return;

    // Required fields validation
    if (!heroForm.fullName?.trim() || !heroForm.role?.trim() || !heroForm.tagline?.trim()) {
      triggerStatus('Full Name, Professional Role, and Tagline are required fields.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const ok = await saveUserInfo(heroForm);
      if (ok) {
        triggerStatus('Hero identity parameters and socials updated live!');
      } else {
        triggerStatus('Failed to update Hero parameters. Verify credentials.', 'error');
      }
    } catch (err) {
      console.error(err);
      triggerStatus('Error persisting Hero values.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSEO = async () => {
    if (!seoForm) return;

    // Required fields validation
    if (!seoForm.metaTitle?.trim() || !seoForm.metaDescription?.trim()) {
      triggerStatus('Meta Title and Meta Description are required fields.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const ok = await saveSEOSettings(seoForm);
      if (ok) {
        triggerStatus('Global SEO headings, descriptions and metadata saved live!');
      } else {
        triggerStatus('Failed to update records. Try verifying the database configs.', 'error');
      }
    } catch {
      triggerStatus('Error persisting values.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSkills = async () => {
    if (!skillsForm || skillsForm.length === 0) {
      triggerStatus('Skills matrix cannot be completely empty.', 'error');
      return;
    }

    // Validate that categories are set
    for (const group of skillsForm) {
      if (!group.category?.trim()) {
        triggerStatus('All skill groups must have a category name.', 'error');
        return;
      }
      if (!group.skills || group.skills.length === 0) {
        triggerStatus(`Skill group "${group.category}" must have at least one skill.`, 'error');
        return;
      }
      for (const skill of group.skills) {
        if (!skill.name?.trim()) {
          triggerStatus('All skills must have a name.', 'error');
          return;
        }
      }
    }

    try {
      setActionLoading(true);
      const ok = await saveSkills(skillsForm);
      if (ok) {
        triggerStatus('Skills matrix ratios synced with cloud database!');
      } else {
        triggerStatus('Failed to update skills. Check Supabase setup.', 'error');
      }
    } catch {
      triggerStatus('Error saving skills values.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveReasonsAndFacts = async () => {
    try {
      setActionLoading(true);
      const okReasons = await saveReasons(reasonsForm);
      const okFacts = await saveFunFacts(funFactsForm);
      if (okReasons && okFacts) {
        triggerStatus('Client conversion facts and credentials synced!');
      } else {
        triggerStatus('Partial update failure. Verify database table schema configs.', 'error');
      }
    } catch {
      triggerStatus('Persistence error encountered.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Sub-items array actions (Add/Replace/Delete wrappers)
  const handleDeleteProject = async (projId: string) => {
    const verified = window.confirm('Are you sure you want to delete this project?');
    if (!verified) return;

    try {
      setActionLoading(true);
      const filtered = projects.filter(p => p.id !== projId);
      const ok = await saveProjects(filtered);
      if (ok) {
        triggerStatus('Project deleted from live website successfully!');
      } else {
        triggerStatus('Delete failed. Check table constraints.', 'error');
      }
    } catch {
      triggerStatus('Error writing to table.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveProjectForm = async () => {
    if (!editingProject) return;
    if (!editingProject.title || !editingProject.description) {
      triggerStatus('Title and project description cannot be left empty.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      let updatedList: Project[];
      
      if (editingProject.id) {
        // Edit existing
        updatedList = projects.map(p => p.id === editingProject.id ? (editingProject as Project) : p);
      } else {
        // Create new
        const newProj = {
          ...editingProject,
          id: `proj-${Math.random().toString(36).substring(2, 9)}`,
          technologies: editingProject.technologies || []
        } as Project;
        updatedList = [...projects, newProj];
      }

      const ok = await saveProjects(updatedList);
      if (ok) {
        triggerStatus(editingProject.id ? 'Project configuration updated!' : 'New project added to dynamic feed!');
        setEditingProject(null);
      } else {
        triggerStatus('Persistent transaction failed. Validate Supabase setup.', 'error');
      }
    } catch {
      triggerStatus('Database write transaction crashed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const verified = window.confirm('Are you sure you want to delete this service card?');
    if (!verified) return;

    try {
      setActionLoading(true);
      const filtered = services.filter(s => s.id !== serviceId);
      const ok = await saveServices(filtered);
      if (ok) {
        triggerStatus('Service card deleted successfully!');
      } else {
        triggerStatus('Failed to delete service. Verify table schema.', 'error');
      }
    } catch {
      triggerStatus('Database connection error.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveServiceForm = async () => {
    if (!editingService) return;
    if (!editingService.title || !editingService.description) {
      triggerStatus('Please fill in required fields.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      let updatedList: Service[];
      
      if (editingService.id) {
        updatedList = services.map(s => s.id === editingService.id ? (editingService as Service) : s);
      } else {
        const newSrv = {
          ...editingService,
          id: `srv-${Math.random().toString(36).substring(2, 9)}`,
          bullets: editingService.bullets || []
        } as Service;
        updatedList = [...services, newSrv];
      }

      const ok = await saveServices(updatedList);
      if (ok) {
        triggerStatus(editingService.id ? 'Service card updated!' : 'New service card added!');
        setEditingService(null);
      } else {
        triggerStatus('Failed to write service specifications to Supabase.', 'error');
      }
    } catch {
      triggerStatus('Database write exception occurred.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTimeline = async (timelineId: string) => {
    const verified = window.confirm('Delete this timeline experience record permanently?');
    if (!verified) return;

    try {
      setActionLoading(true);
      const filtered = timeline.filter(t => t.id !== timelineId);
      const ok = await saveTimeline(filtered);
      if (ok) {
        triggerStatus('Timeline record deleted live!');
      } else {
        triggerStatus('Delete query refused by database constraint.', 'error');
      }
    } catch {
      triggerStatus('Database transaction failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTimelineForm = async () => {
    if (!editingTimeline) return;
    if (!editingTimeline.role || !editingTimeline.company) {
      triggerStatus('Role name and Company are required coordinates.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      let updatedList: TimelineEvent[];
      
      if (editingTimeline.id) {
        updatedList = timeline.map(t => t.id === editingTimeline.id ? (editingTimeline as TimelineEvent) : t);
      } else {
        const newTime = {
          ...editingTimeline,
          id: `time-${Math.random().toString(36).substring(2, 9)}`,
          description: editingTimeline.description || [],
          skills: editingTimeline.skills || []
        } as TimelineEvent;
        updatedList = [...timeline, newTime];
      }

      const ok = await saveTimeline(updatedList);
      if (ok) {
        triggerStatus(editingTimeline.id ? 'Timeline experience updated!' : 'New experience milestone registered!');
        setEditingTimeline(null);
      } else {
        triggerStatus('Supabase refused write command. Verify connection settings.', 'error');
      }
    } catch {
      triggerStatus('Database write operation crashed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- TRIGGER SEED ---
  const handleDatabaseSeedTrigger = async () => {
    const ok = window.confirm(
      'Ready to automatically populate your active Supabase database with all modern portfolio defaults and structures?'
    );
    if (!ok) return;

    try {
      setActionLoading(true);
      const succeeded = await seedDatabase();
      if (succeeded) {
        triggerStatus('All defaults uploaded to your projects, services, timeline and general configs table successfully!');
      } else {
        triggerStatus('Initialization failed. Did you run the SQL definitions under SQL Editor in Supabase first?', 'error');
      }
    } catch {
      triggerStatus('Process crashed due to incomplete table schemas.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // --- RENDER SCREEN VIEWS ---

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070708] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00C853]" />
          <p className="font-mono text-xs tracking-widest uppercase opacity-60">Authenticating Environment Core...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated: Render Login Page
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070708] text-white py-12 px-4 relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00c8530e_1px,transparent_1px),linear-gradient(to_bottom,#00c8530e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#00C853]/5 blur-[120px]" />
        <div className="absolute -bottom-45 -right-45 w-96 h-96 rounded-full bg-[#00C853]/5 blur-[120px]" />

        <div className="max-w-md w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="bg-[#121214]/80 border border-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
          >
            {/* Header branding */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,200,83,0.15)]">
                <Database className="w-6 h-6 text-[#00C853]" />
              </div>
              <h1 className="font-sans font-medium text-lg tracking-tight uppercase text-white">Usama Portfolio CMS</h1>
              <p className="font-mono text-[10px] tracking-widest uppercase text-zinc-500 mt-1">Control Center Hub</p>
            </div>

            {/* Config Status indicator */}
            {!isSupabaseConfigured ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-4.5 mb-6 flex gap-3.5 leading-relaxed">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                <div>
                  <p className="font-sans font-medium mb-1">Unconfigured Supabase Instance</p>
                  <p className="text-[11px] opacity-85">
                    Your `.env` properties are missing. Paste your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#00C853]/5 border border-[#00C853]/10 text-emerald-400 text-xs rounded-xl p-3 mb-6 flex gap-2.5 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C853] animate-pulse" />
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#00C853]">Supabase Live Connection Active</p>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-mono uppercase tracking-wider mb-2">Admin Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-600" />
                  </span>
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usama@unscripted.com"
                    className="block w-full pl-10 pr-4 py-3 bg-[#18181C] border border-white/5 text-white placeholder-zinc-600 rounded-xl font-sans text-xs focus:ring-1 focus:ring-[#00C853]/40 focus:border-[#00C853]/40 outline-hidden transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-mono uppercase tracking-wider mb-2">Access Credentials</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-600" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-4 py-3 bg-[#18181C] border border-white/5 text-white placeholder-zinc-600 rounded-xl font-sans text-xs focus:ring-1 focus:ring-[#00C853]/40 focus:border-[#00C853]/40 outline-hidden transition-all duration-300"
                  />
                </div>
              </div>

              {loginError && (
                <div className="text-red-400 text-[11px] bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex gap-2 items-start font-mono">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authActionLoading || !isSupabaseConfigured}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#00C853] hover:bg-[#00E55F] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,200,83,0.15)] focus:ring-2 focus:ring-[#00C853]/20"
              >
                {authActionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-black" />
                    Authorize Session
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-white/5 pt-5 text-center">
              <p className="text-zinc-600 text-[10px] font-mono leading-relaxed uppercase tracking-wider">
                Requires active Supabase authentication database service and setup logic to initialize.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-[#070708] text-white">
      {/* Dynamic Toast System */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-6 py-4 rounded-xl border fill-neutral-50 backdrop-blur-xl shadow-2xl ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 border-[#00C853]/30 text-emerald-100 shadow-emerald-900/10'
                : 'bg-red-950/90 border-red-500/30 text-red-200 shadow-red-900/10'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#00C853]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <p className="font-sans text-xs font-semibold">{statusMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Lines background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00c85307_1px,transparent_1px),linear-gradient(to_bottom,#00c85307_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header Panel */}
      <header className="border-b border-white/5 bg-[#0D0D10]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#00C853]/10 border border-[#00C853]/20 flex items-center justify-center shadow-[0_0_12px_rgba(0,200,83,0.1)]">
              <Sliders className="w-5 h-5 text-[#00C853]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans font-medium text-sm uppercase tracking-wider text-white">Console Dashboard</h1>
                <span className="text-[9px] bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                  Admin Active
                </span>
              </div>
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Logged as {profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('/', '_blank')}
              className="px-4 py-2 hover:bg-white/5 border border-white/5 rounded-lg font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Site
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:text-black hover:border-red-500 duration-300 rounded-lg font-mono text-[10px] uppercase tracking-wider text-red-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Sidebar Nav Rail */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-4 sticky top-26">
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest px-3 mb-4">Website Sections</p>
            
            <nav className="space-y-1">
              {[
                { id: 'database', label: 'Database & Health', icon: Database },
                { id: 'hero', label: 'Hero & About Bio', icon: Cpu },
                { id: 'projects', label: 'Dynamic Projects', icon: FolderGit },
                { id: 'services', label: 'Services Grid', icon: Layers },
                { id: 'timeline', label: 'Career Timeline', icon: Briefcase },
                { id: 'skills', label: 'Expertise Skills', icon: Sliders },
                { id: 'seo', label: 'SEO & Meta Core', icon: Globe },
                { id: 'messages', label: 'Messages', icon: Mail },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const showBadge = tab.id === 'messages' && contactMessages.some(m => !m.read);
                const count = contactMessages.filter(m => !m.read).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setEditingProject(null);
                      setEditingService(null);
                      setEditingTimeline(null);
                    }}
                    className={`w-full text-left font-sans text-xs font-semibold tracking-wide py-3 px-3.5 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                      isActive 
                        ? 'bg-[#00C853]/15 border border-[#00C853]/20 text-[#00C853] shadow-[0_0_12px_rgba(0,200,83,0.05)]' 
                        : 'border border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00C853]' : 'text-zinc-500'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {showBadge && (
                      <span className="bg-red-500/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 animate-pulse">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-6 pt-5 border-t border-white/5 flex flex-col items-center">
              <div className="w-full bg-[#121215] border border-white/5 rounded-xl p-3 flex gap-2.5 items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${dbConnected ? 'bg-[#00C853] animate-pulse' : 'bg-zinc-700'}`} />
                <div>
                  <p className="font-mono text-[9px] tracking-wider uppercase text-zinc-400">Database Engine</p>
                  <p className="font-sans text-[10px] text-zinc-500 font-bold uppercase mt-0.5">
                    {dbConnected ? 'Supabase Synchronized' : 'Offline Sandbox'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Panels Frame */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* PANELS */}

              {/* 1. Database panel */}
              {activeTab === 'database' && (
                <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                    <div>
                      <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">Database Settings & Health</h2>
                      <p className="font-sans text-xs text-zinc-500 mt-1">
                        Configure Supabase tables, initialize default layouts, or copy the SQL queries.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleDatabaseSeedTrigger}
                        disabled={actionLoading}
                        className="px-4.5 py-2 px bg-[#00C853] hover:bg-[#00E55F] disabled:bg-zinc-800 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                        {actionLoading ? 'Seeding Tables...' : 'Seed Default Data'}
                      </button>
                    </div>
                  </div>

                  {/* Status indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#121215] border border-white/5 p-4 rounded-xl">
                      <h3 className="font-mono text-[10px] text-[#00C853] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#00C853]" /> Supabase Core Status
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        The website is connected directly to your client-side Supabase client instance. Read and write actions are performed in real-time.
                      </p>
                      <div className="mt-4 flex gap-4.5">
                        <div className="text-center bg-black/30 border border-white/5 py-2 px-4 rounded-lg flex-1">
                          <p className="font-sans font-medium text-base text-zinc-200">{projects.length}</p>
                          <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 mt-0.5">Projects</p>
                        </div>
                        <div className="text-center bg-black/30 border border-white/5 py-2 px-4 rounded-lg flex-1">
                          <p className="font-sans font-medium text-base text-zinc-200">{services.length}</p>
                          <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 mt-0.5">Services</p>
                        </div>
                        <div className="text-center bg-black/30 border border-white/5 py-2 px-4 rounded-lg flex-1">
                          <p className="font-sans font-medium text-base text-zinc-200">{contactMessages.length}</p>
                          <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-400 mt-0.5">Inbox</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121215] border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <h3 className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">Default Fallback Logic</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          If your tables are empty or tables are missing, the website automatically loads static presets from `src/data.ts` and uses standard key-value system profiles to ensure 100% runtime safety.
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-zinc-950/40 border border-[#00C853]/15 text-[#00C853] text-[10px] font-mono uppercase tracking-widest rounded-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00C853] shrink-0" />
                        Zero Interruption Safety Protocol Active
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step SQL Queries Setup */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-[#00C853]" />
                      <h3 className="font-sans font-medium text-xs text-white uppercase tracking-wider">Step-By-Step Setup Instruction Guide</h3>
                    </div>

                    <div className="bg-[#141418] border border-white/5 rounded-xl p-5 space-y-4 leading-relaxed font-sans text-xs text-zinc-400">
                      <p>
                        To enable fully operational admin dashboards with real-time message feeds from client submissions, paste and execute the SQL query directly under the <strong className="text-white">SQL Editor</strong> section of your Supabase project.
                      </p>

                      <div className="space-y-3">
                        <span className="block font-mono text-[10px] uppercase text-[#00C853]">Paste instructions under SQL Editor:</span>
                        <div className="bg-black/80 font-mono text-[11px] text-zinc-300 p-4.5 rounded-lg border border-white/5 overflow-x-auto max-h-72 select-all leading-normal whitespace-pre">
{`-- A. Key-Value configurations table for general sections (Hero, About, SEO, facts)
CREATE TABLE IF NOT EXISTS configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. Projects structured table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    imageUrl TEXT,
    technologies TEXT[],
    liveUrl TEXT,
    githubUrl TEXT,
    extendedDetails JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. Services structured table
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    bullets TEXT[],
    iconName TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. Career Timeline table
CREATE TABLE IF NOT EXISTS timeline (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    duration TEXT,
    description TEXT[],
    skills TEXT[],
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E. Clients Contact Form messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F. Enable Row Level Security (RLS) on all tables (Securing databases)
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- G. Allow public select / read operations where applicable (Static public details)
CREATE POLICY "Allow public read configs" ON configs FOR SELECT USING (true);
CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public read timeline" ON timeline FOR SELECT USING (true);

-- H. Allow clients the ability to insert messages through the contact form
CREATE POLICY "Allow public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- I. Allow authenticated admins full control over all sections
CREATE POLICY "Allow authenticated full control configs" ON configs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full control projects" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full control services" ON services FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full control timeline" ON timeline FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full control contact_messages" ON contact_messages FOR ALL TO authenticated USING (true);
`}
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 text-[11px] border-t border-white/5 pt-4">
                        <p className="font-semibold text-white uppercase">Storage Bucket setup for Image Uploads:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Create a new bucket named <strong className="text-white font-mono text-xs">assets</strong> inside Supabase Storage dashboard.</li>
                          <li>Toggle the <strong className="text-[#00C853]">Public</strong> switch to ON so image attachments resolve properly as live public URLs on your website.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Hero & About panel */}
              {activeTab === 'hero' && heroForm && (
                <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">Hero Profile & Bio Parameters</h2>
                      <p className="font-sans text-xs text-zinc-500 mt-1">Configure profile copy, photo attachments, and social channels dynamically.</p>
                    </div>
                    <button
                      onClick={handleSaveHeroAbout}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Save Identity Configs
                    </button>
                  </div>

                  {/* Coordinates / Details row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Full Display Name</label>
                      <input
                        type="text"
                        value={heroForm.fullName || ''}
                        onChange={(e) => setHeroForm({ ...heroForm, fullName: e.target.value })}
                        className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Display Roles/Title</label>
                      <input
                        type="text"
                        value={heroForm.role || ''}
                        onChange={(e) => setHeroForm({ ...heroForm, role: e.target.value })}
                        className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Homepage Tagline Overlay</label>
                    <textarea
                      rows={2}
                      value={heroForm.tagline || ''}
                      onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                      className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]/40 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Detailed Biography Text (About Slide)</label>
                    <textarea
                      rows={3}
                      value={heroForm.aboutBrief || ''}
                      onChange={(e) => setHeroForm({ ...heroForm, aboutBrief: e.target.value })}
                      className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]/40 leading-relaxed"
                    />
                  </div>

                  {/* Profile Images Configs */}
                  <div className="border-t border-white/5 pt-5 space-y-4">
                    <h3 className="font-mono text-[10px] text-[#00C853] uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#00C853]" /> Profile Assets & Image Uploads
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Hero Photo Card */}
                      <div className="bg-[#121215] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                        <img 
                          src={heroForm.images?.hero || 'https://myphotosss.netlify.app/5.png'} 
                          alt="Hero thumbnail" 
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-lg border border-white/10 shrink-0" 
                        />
                        <div className="flex-1 space-y-2">
                          <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Main Hero Photo</span>
                          
                          <div className="flex gap-2">
                            <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2">
                              <Upload className="w-3 h-3" />
                              {uploadLoading === 'images.hero' ? 'Uploading...' : 'Upload File'}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => triggerFileUpload(e, 'images.hero')}
                                className="hidden" 
                              />
                            </label>
                            <input 
                              type="text" 
                              value={heroForm.images?.hero || ''}
                              onChange={(e) => {
                                const url = e.target.value;
                                setHeroForm((prev: any) => ({
                                  ...prev,
                                  images: { ...prev.images, hero: url }
                                }));
                              }}
                              placeholder="Direct URL Link"
                              className="bg-black/40 border border-white/5 text-[10px] p-1.5 rounded-md flex-1 text-zinc-300 font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* About Photo Card */}
                      <div className="bg-[#121215] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                        <img 
                          src={heroForm.images?.about || 'https://myphotosss.netlify.app/1.png'} 
                          alt="About thumbnail" 
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-lg border border-white/10 shrink-0" 
                        />
                        <div className="flex-1 space-y-2">
                          <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold">About Section Profile</span>
                          
                          <div className="flex gap-2">
                            <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2">
                              <Upload className="w-3 h-3" />
                              {uploadLoading === 'images.about' ? 'Uploading...' : 'Upload File'}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => triggerFileUpload(e, 'images.about')}
                                className="hidden" 
                              />
                            </label>
                            <input 
                              type="text" 
                              value={heroForm.images?.about || ''}
                              onChange={(e) => {
                                const url = e.target.value;
                                setHeroForm((prev: any) => ({
                                  ...prev,
                                  images: { ...prev.images, about: url }
                                }));
                              }}
                              placeholder="Direct URL Link"
                              className="bg-black/40 border border-white/5 text-[10px] p-1.5 rounded-md flex-1 text-zinc-300 font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Targets */}
                  <div className="border-t border-white/5 pt-5 space-y-4">
                    <h3 className="font-mono text-[10px] text-[#00C853] uppercase tracking-widest">Social Channels Links</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-white">
                      {['github', 'youtube', 'facebook', 'instagram', 'whatsapp'].map((socKey) => (
                        <div key={socKey} className="flex gap-2.5 items-center">
                          <span className="w-24 uppercase font-mono text-[9px] text-zinc-400 font-semibold">{socKey}:</span>
                          <input
                            type="text"
                            value={heroForm.socials?.[socKey] || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setHeroForm({
                                ...heroForm,
                                socials: {
                                  ...heroForm.socials,
                                  [socKey]: v
                                }
                              });
                            }}
                            className="bg-[#141418] border border-white/5 p-2 rounded-lg text-zinc-300 font-sans flex-1 text-xs focus:outline-hidden focus:border-[#00C853]/40"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reasons & Facts panel */}
                  <div className="border-t border-white/5 pt-5 space-y-5">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-mono text-[10px] text-[#00C853] uppercase tracking-widest">
                        Conversion Credential Factors ({reasonsForm.length} Reasons & {funFactsForm.length} Stats)
                      </h3>
                      <button
                        onClick={handleSaveReasonsAndFacts}
                        disabled={actionLoading}
                        className="px-4.5 py-2 hover:bg-white/5 border border-white/10 hover:border-[#00C853]/20 hover:text-[#00C853] text-[9.5px] rounded-lg font-mono uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Sync Factors
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-4.5 bg-black/20 border border-white/5 p-4 rounded-xl">
                        <span className="block font-mono text-[9px] uppercase tracking-widest text-[#00C853] border-b border-white/5 pb-2">Fun Fact Stats</span>
                        {funFactsForm.map((item, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={item.count || ''}
                              onChange={(e) => {
                                const newFacts = [...funFactsForm];
                                newFacts[idx].count = e.target.value;
                                setFunFactsForm(newFacts);
                              }}
                              className="w-16 bg-[#18181C] border border-white/5 p-2 rounded-md font-sans text-xs text-[#00C853] font-bold text-center"
                              placeholder="95%"
                            />
                            <input
                              type="text"
                              value={item.label || ''}
                              onChange={(e) => {
                                const newFacts = [...funFactsForm];
                                newFacts[idx].label = e.target.value;
                                setFunFactsForm(newFacts);
                              }}
                              className="flex-1 bg-[#18181C] border border-white/5 p-2 rounded-md font-sans text-xs text-zinc-300"
                              placeholder="Description"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 bg-black/20 border border-white/5 p-4 rounded-xl">
                        <span className="block font-mono text-[9px] uppercase tracking-widest text-[#00C853] border-b border-white/5 pb-2">Why Hire Me Bullet Props</span>
                        {reasonsForm.map((item, idx) => (
                          <div key={idx} className="space-y-2.5 pb-2 border-b border-dashed border-white/5 last:border-0">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => {
                                  const newReasons = [...reasonsForm];
                                  newReasons[idx].title = e.target.value;
                                  setReasonsForm(newReasons);
                                }}
                                className="font-semibold text-xs text-white bg-[#18181C] border border-white/5 p-2 rounded-md flex-1"
                                placeholder="Title"
                              />
                              <input
                                type="text"
                                value={item.subtitle || ''}
                                onChange={(e) => {
                                  const newReasons = [...reasonsForm];
                                  newReasons[idx].subtitle = e.target.value;
                                  setReasonsForm(newReasons);
                                }}
                                className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-400 bg-[#18181C] border border-white/5 p-2 rounded-md flex-1"
                                placeholder="Subtitle"
                              />
                            </div>
                            <textarea
                              rows={2}
                              value={item.description || ''}
                              onChange={(e) => {
                                const newReasons = [...reasonsForm];
                                newReasons[idx].description = e.target.value;
                                setReasonsForm(newReasons);
                              }}
                              className="text-zinc-500 font-sans text-xs bg-[#18181C] border border-white/5 p-2.5 rounded-md w-full"
                              placeholder="Detail block text..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Projects panel */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  {/* List / Form triggers */}
                  {!editingProject ? (
                    <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">Dynamic Projects Portfolio Feed</h2>
                          <p className="font-sans text-xs text-zinc-500 mt-1">Deploy, swap, or configure your works and scientific credentials.</p>
                        </div>
                        <button
                          onClick={() => setEditingProject({
                            title: '',
                            description: '',
                            category: 'Environmental Projects',
                            imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
                            technologies: [],
                            extendedDetails: { challenge: '', solution: '', impact: '' }
                          })}
                          className="px-4.5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-black" /> Add Project
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((proj) => (
                          <div key={proj.id} className="bg-[#121215]/80 border border-white/5 rounded-xl p-4.5 space-y-3.5 flex flex-col justify-between">
                            <div className="flex gap-4">
                              <img 
                                src={proj.imageUrl} 
                                alt={proj.title} 
                                referrerPolicy="no-referrer"
                                className="w-16 h-16 object-cover rounded-lg border border-white/10 shrink-0" 
                              />
                              <div>
                                <span className="text-[9px] bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest font-bold">
                                  {proj.category}
                                </span>
                                <h3 className="font-sans font-bold text-xs text-white uppercase tracking-wide mt-1.5 leading-tight">{proj.title}</h3>
                                <p className="text-zinc-500 font-sans text-[11.5px] line-clamp-2 mt-1 leading-normal">{proj.description}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {proj.technologies.slice(0, 5).map((tech, idx) => (
                                <span key={`${tech}-${idx}`} className="bg-white/5 border border-white/5 text-[9px] font-mono px-1.5 py-0.5 rounded-md text-zinc-400">
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1.5">
                              <span className="font-mono text-[9px] text-zinc-600">ID: {proj.id}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingProject(JSON.parse(JSON.stringify(proj)))}
                                  className="p-1 px-2 hover:bg-[#00C853]/10 text-[#00C853] hover:border hover:border-[#00C853]/20 rounded-md font-mono text-[9.5px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Edit className="w-3 h-3 text-[#00C853]" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id)}
                                  className="p-1 px-2 hover:bg-red-500/10 text-red-400 hover:border hover:border-red-500/20 rounded-md font-mono text-[9.5px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Edit/Add Project Panel Mode
                    <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">
                          {editingProject.id ? `Modifying Project: "${editingProject.title}"` : 'Construct New Portfolio Project'}
                        </h2>
                        <button
                          onClick={() => setEditingProject(null)}
                          className="px-4 py-2 hover:bg-white/5 border border-white/5 rounded-lg font-mono text-[9px] uppercase tracking-wider text-zinc-400 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Project Title</label>
                          <input
                            type="text"
                            required
                            value={editingProject.title || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                            className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]/40"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Service Category</label>
                          <select
                            value={editingProject.category || 'Web Development'}
                            onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as any })}
                            className="w-full bg-[#141418] border border-[#1b1b22] p-3 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]/40 cursor-pointer"
                          >
                            <option value="Environmental Projects">Environmental Projects</option>
                            <option value="AI Projects">AI Projects</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Research">Research</option>
                            <option value="Design Work">Design Work</option>
                          </select>
                        </div>
                      </div>

                      {/* Cover attachment */}
                      <div className="bg-[#121215] border border-white/5 p-4 rounded-xl flex items-center gap-4">
                        <img 
                          src={editingProject.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'} 
                          alt="Cover thumbnail" 
                          referrerPolicy="no-referrer"
                          className="w-18 h-18 object-cover rounded-lg border border-white/10 shrink-0" 
                        />
                        <div className="flex-1 space-y-2">
                          <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Project Display Graphic Cover</span>
                          
                          <div className="flex gap-2">
                            <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-mono text-[9.5px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2">
                              <Upload className="w-3.5 h-3.5" />
                              {uploadLoading === 'project_img' ? 'Uploading...' : 'Upload Attachment'}
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => triggerFileUpload(e, 'project_img', true)}
                                className="hidden" 
                              />
                            </label>
                            <input 
                              type="text" 
                              value={editingProject.imageUrl || ''}
                              onChange={(e) => setEditingProject({ ...editingProject, imageUrl: e.target.value })}
                              placeholder="Figma or Unsplash Direct URL Address link"
                              className="bg-black/40 border border-white/5 text-[10px] p-2 rounded-md flex-1 text-zinc-300 font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Short Brief Description</label>
                        <textarea
                          rows={2}
                          value={editingProject.description || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                          className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white focus:outline-hidden focus:border-[#00C853]/40 leading-relaxed"
                          placeholder="Provide a concise summary profile layout."
                        />
                      </div>

                      {/* URLs + Tags */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">GitHub Repository URL (Optional)</label>
                          <input
                            type="text"
                            value={editingProject.githubUrl || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                            className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white placeholder-zinc-650 focus:outline-hidden"
                            placeholder="https://github.com/..."
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Live Demo URL (Optional)</label>
                          <input
                            type="text"
                            value={editingProject.liveUrl || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                            className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs text-white placeholder-zinc-650 focus:outline-hidden"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">
                          Technologies Used (Comma-separated string tags)
                        </label>
                        <input
                          type="text"
                          value={editingProject.technologies?.join(', ') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingProject({
                              ...editingProject,
                              technologies: val.split(',').map(t => t.trim()).filter(Boolean)
                            });
                          }}
                          className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs font-mono text-[#00C853] placeholder-zinc-650 focus:outline-hidden"
                          placeholder="React, PyTorch, YOLOv8, SvelteKit"
                        />
                      </div>

                      {/* Extended Modal Specs */}
                      <div className="border-t border-white/5 pt-5 space-y-4">
                        <span className="block font-mono text-[9px] uppercase tracking-widest text-[#00C853]">Extended Project Case Study Specifics</span>
                        
                        <div className="space-y-4 font-sans text-xs">
                          <div>
                            <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">The Challenge Block</label>
                            <textarea
                              rows={2}
                              value={editingProject.extendedDetails?.challenge || ''}
                              onChange={(e) => setEditingProject({
                                ...editingProject,
                                extendedDetails: {
                                  challenge: e.target.value,
                                  solution: editingProject.extendedDetails?.solution || '',
                                  impact: editingProject.extendedDetails?.impact || ''
                                }
                              })}
                              className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-zinc-300 focus:outline-hidden"
                              placeholder="Describe the problematic system coordinates."
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Your Engineered Solution</label>
                            <textarea
                              rows={2}
                              value={editingProject.extendedDetails?.solution || ''}
                              onChange={(e) => setEditingProject({
                                ...editingProject,
                                extendedDetails: {
                                  challenge: editingProject.extendedDetails?.challenge || '',
                                  solution: e.target.value,
                                  impact: editingProject.extendedDetails?.impact || ''
                                }
                              })}
                              className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-zinc-300 focus:outline-hidden"
                              placeholder="Describe your design and framework implementation."
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Obtained Industrial Impact</label>
                            <textarea
                              rows={2}
                              value={editingProject.extendedDetails?.impact || ''}
                              onChange={(e) => setEditingProject({
                                ...editingProject,
                                extendedDetails: {
                                  challenge: editingProject.extendedDetails?.challenge || '',
                                  solution: editingProject.extendedDetails?.solution || '',
                                  impact: e.target.value
                                }
                              })}
                              className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-zinc-300 focus:outline-hidden"
                              placeholder="e.g. 98% prediction rate accuracy, or 18% fuel reduction indexes."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-5 flex justify-end gap-3.5">
                        <button
                          onClick={() => setEditingProject(null)}
                          className="px-4.5 py-2.5 bg-zinc-855 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProjectForm}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Submit Project Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Services panel */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  {!editingService ? (
                    <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">Engineering Services Settings</h2>
                          <p className="font-sans text-xs text-zinc-500 mt-1">Configure available corporate services, icons and key bullet summaries.</p>
                        </div>
                        <button
                          onClick={() => setEditingService({
                            title: '',
                            description: '',
                            bullets: [],
                            iconName: 'Cpu',
                            category: 'core'
                          })}
                          className="px-4.5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-black" /> Add Service
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((srv) => (
                          <div key={srv.id} className="bg-[#121215]/80 border border-white/5 rounded-xl p-4.5 flex flex-col justify-between space-y-3.5">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[8.5px] bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/15 py-0.5 px-2.5 rounded-full font-mono uppercase tracking-widest font-bold">
                                  {srv.category}
                                </span>
                              </div>
                              <h3 className="font-sans font-bold text-xs text-white uppercase mt-2">{srv.title}</h3>
                              <p className="text-zinc-500 text-[11.5px] font-sans mt-1 line-clamp-2 leading-relaxed">{srv.description}</p>
                              
                              <ul className="mt-2.5 space-y-1">
                                {srv.bullets.slice(0, 3).map((b, idx) => (
                                  <li key={idx} className="text-[10px] font-sans text-zinc-400 flex items-center gap-1.5 font-medium">
                                    <ChevronRight className="w-3 h-3 text-[#00C853]" /> {b}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                              <span className="text-[9px] font-mono text-zinc-600">Icon: {srv.iconName}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingService(JSON.parse(JSON.stringify(srv)))}
                                  className="p-1 px-2 hover:bg-[#00C853]/10 text-[#00C853] rounded-md font-mono text-[9.5px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Edit className="w-3 h-3" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteService(srv.id)}
                                  className="p-1 px-2 hover:bg-red-500/10 text-red-000 rounded-md font-mono text-[9.5px] uppercase flex items-center gap-1 transition-all cursor-pointer text-red-400"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Service editor panel
                    <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">
                          {editingService.id ? `Editing Service Card: "${editingService.title}"` : 'Construct Brand Service Panel'}
                        </h2>
                        <button
                          onClick={() => setEditingService(null)}
                          className="px-4 py-2 hover:bg-white/5 border border-white/5 rounded-lg font-mono text-[9px] uppercase tracking-wider text-zinc-450 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-xs">
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Service Title Name</label>
                          <input
                            type="text"
                            value={editingService.title || ''}
                            onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                            className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-sans text-xs focus:outline-hidden"
                            placeholder="e.g. AI-Powered Turbidity Predictor"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Lucide Icon ID</label>
                            <input
                              type="text"
                              value={editingService.iconName || 'Cpu'}
                              onChange={(e) => setEditingService({ ...editingService, iconName: e.target.value })}
                              className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-mono text-xs focus:outline-hidden"
                              placeholder="Droplet, Cpu, Code, Palette"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Target Segment</label>
                            <select
                              value={editingService.category || 'core'}
                              onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                              className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-sans text-xs focus:outline-hidden cursor-pointer"
                            >
                              <option value="core">Core Engineering</option>
                              <option value="digital">Digital Development</option>
                              <option value="creative">Creative Arts</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Main Bullet Summary details</label>
                        <textarea
                          rows={2}
                          value={editingService.description || ''}
                          onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                          className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs leading-relaxed text-white focus:outline-hidden"
                          placeholder="Provide a general high value delivery statement."
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">
                          Core Offering Deliverables (Comma-separated listed array)
                        </label>
                        <input
                          type="text"
                          value={editingService.bullets?.join(', ') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingService({
                              ...editingService,
                              bullets: val.split(',').map(b => b.trim()).filter(Boolean)
                            });
                          }}
                          className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs font-mono text-[#00C853] placeholder-zinc-650 focus:outline-hidden"
                          placeholder="YOLO Waste Classification, Predictive models, High SEO core maps"
                        />
                      </div>

                      <div className="border-t border-white/5 pt-5 flex justify-end gap-3.5">
                        <button
                          onClick={() => setEditingService(null)}
                          className="px-4.5 py-2.5 bg-zinc-855 text-zinc-300 rounded-lg text-xs font-mono uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveServiceForm}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-bold rounded-lg uppercase transition-all cursor-pointer"
                        >
                          Submit Service Card
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. Career Timeline panel */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  {!editingTimeline ? (
                    <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                          <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">Academics & Career Progressions</h2>
                          <p className="font-sans text-xs text-zinc-500 mt-1">Add, rearrange or edit milestones within your professional track.</p>
                        </div>
                        <button
                          onClick={() => setEditingTimeline({
                            role: '',
                            company: '',
                            location: '',
                            duration: '',
                            description: [],
                            skills: [],
                            category: 'professional'
                          })}
                          className="px-4.5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-black" /> Add Experience
                        </button>
                      </div>

                      <div className="space-y-4">
                        {timeline.map((item) => (
                          <div key={item.id} className="bg-[#121215]/80 border border-white/5 rounded-xl p-4.5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-[8.5px] bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/15 py-0.5 px-2.5 rounded-full font-mono uppercase tracking-widest font-bold">
                                  {item.category}
                                </span>
                                <span className="font-mono text-[9px] text-[#00C853]">{item.duration}</span>
                              </div>
                              <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-white mt-1.5">
                                {item.role} <span className="text-zinc-500 font-sans font-medium">@ {item.company}</span>
                              </h3>
                              <p className="text-zinc-500 font-mono text-[9.5px] tracking-wider uppercase mt-1">Location: {item.location}</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingTimeline(JSON.parse(JSON.stringify(item)))}
                                className="p-1 px-3 hover:bg-[#00C853]/10 border border-white/5 hover:border-[#00C853]/20 rounded-md font-mono text-[9.5px] uppercase flex items-center gap-1.5 cursor-pointer text-[#00C853] transition-all"
                              >
                                <Edit className="w-3 h-3" /> Modify
                              </button>
                              <button
                                onClick={() => handleDeleteTimeline(item.id)}
                                className="p-1 px-3 hover:bg-red-500/10 border border-white/5 hover:border-red-500/10 rounded-md font-mono text-[9.5px] uppercase flex items-center gap-1.5 cursor-pointer text-red-400 transition-all"
                              >
                                <Trash2 className="w-3 h-3" /> Dismiss
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Experience Editor panel
                    <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">
                          {editingTimeline.id ? `Modifying Milestone: "${editingTimeline.role}"` : 'Construct New Milestone'}
                        </h2>
                        <button
                          onClick={() => setEditingTimeline(null)}
                          className="px-4 py-2 hover:bg-white/5 border border-white/5 rounded-lg font-mono text-[9px] uppercase tracking-wider text-zinc-450 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-xs">
                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Role Name</label>
                          <input
                            type="text"
                            value={editingTimeline.role || ''}
                            onChange={(e) => setEditingTimeline({ ...editingTimeline, role: e.target.value })}
                            className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white"
                            placeholder="e.g. Environmental Consultant"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Company Name</label>
                          <input
                            type="text"
                            value={editingTimeline.company || ''}
                            onChange={(e) => setEditingTimeline({ ...editingTimeline, company: e.target.value })}
                            className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white"
                            placeholder="e.g. Mehran U.E.T / Freelance"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Milestone Lifespan / Duration</label>
                          <input
                            type="text"
                            value={editingTimeline.duration || ''}
                            onChange={(e) => setEditingTimeline({ ...editingTimeline, duration: e.target.value })}
                            className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-mono"
                            placeholder="e.g. 2024 - Present"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Office Location</label>
                            <input
                              type="text"
                              value={editingTimeline.location || ''}
                              onChange={(e) => setEditingTimeline({ ...editingTimeline, location: e.target.value })}
                              className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-mono"
                              placeholder="Karachi, Remote"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Milestone Segment</label>
                            <select
                              value={editingTimeline.category || 'professional'}
                              onChange={(e) => setEditingTimeline({ ...editingTimeline, category: e.target.value as any })}
                              className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white cursor-pointer"
                            >
                              <option value="professional">Professional Careers</option>
                              <option value="academic">Academic Journey</option>
                              <option value="volunteer">Volunteer Service</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">
                          Core Task Achievements (Comma-separated achievements listing list)
                        </label>
                        <textarea
                          rows={3}
                          value={editingTimeline.description?.join('\n') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingTimeline({
                              ...editingTimeline,
                              description: val.split('\n').map(l => l.trim()).filter(Boolean)
                            });
                          }}
                          className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs leading-relaxed text-zinc-300 focus:outline-hidden"
                          placeholder="List achievements... (Separate each achievement bullet with a new line)"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">
                          Leveraged Technologies & Skills (Comma-separated list tags)
                        </label>
                        <input
                          type="text"
                          value={editingTimeline.skills?.join(', ') || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditingTimeline({
                              ...editingTimeline,
                              skills: val.split(',').map(s => s.trim()).filter(Boolean)
                            });
                          }}
                          className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-xs font-mono text-[#00C853] placeholder-zinc-650 focus:outline-hidden"
                          placeholder="Chemistry, Wastewater models, Python, Excel scripting"
                        />
                      </div>

                      <div className="border-t border-white/5 pt-5 flex justify-end gap-3.5">
                        <button
                          onClick={() => setEditingTimeline(null)}
                          className="px-4.5 py-2.5 bg-zinc-855 text-zinc-300 rounded-lg text-xs font-mono uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveTimelineForm}
                          disabled={actionLoading}
                          className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-bold rounded-lg uppercase cursor-pointer"
                        >
                          Submit Experience Record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Skills Group panel */}
              {activeTab === 'skills' && skillsForm && (
                <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">Expertise Index (Skill Ratios)</h2>
                      <p className="font-sans text-xs text-zinc-500 mt-1">Configure sliders, names and matrices to convey skill density parameters.</p>
                    </div>
                    <button
                      onClick={handleSaveSkills}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Save Skills State
                    </button>
                  </div>

                  <div className="space-y-6">
                    {skillsForm.map((group, groupIdx) => (
                      <div key={`${group.category}-${groupIdx}`} className="bg-[#121215]/60 hover:bg-[#121215]/90 duration-300 border border-white/5 rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <input
                            type="text"
                            value={group.category}
                            onChange={(e) => {
                              const updated = [...skillsForm];
                              updated[groupIdx].category = e.target.value;
                              setSkillsForm(updated);
                            }}
                            className="font-mono text-[10px] uppercase text-[#00C853] font-bold bg-transparent border-0 focus:ring-1 focus:ring-[#00C853]/15 w-64 p-1 rounded-sm"
                          />
                          <span className="font-mono text-[9px] text-zinc-500">{group.skills.length} Slots</span>
                        </div>

                        <div className="space-y-4 font-sans text-xs">
                          {group.skills.map((skill, skillIdx) => (
                            <div key={`${skill.name}-${skillIdx}`} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => {
                                  const updated = [...skillsForm];
                                  updated[groupIdx].skills[skillIdx].name = e.target.value;
                                  setSkillsForm(updated);
                                }}
                                className="font-semibold text-zinc-200 bg-[#18181C] border border-white/5 p-1.5 rounded-md text-xs w-64"
                              />

                              <div className="flex items-center gap-3.5 flex-1 max-w-md">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={skill.percentage}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const updated = [...skillsForm];
                                    updated[groupIdx].skills[skillIdx].percentage = val;
                                    setSkillsForm(updated);
                                  }}
                                  className="flex-1 accent-[#00C853] cursor-pointer"
                                />
                                <span className="font-mono text-xs text-[#00C853] font-bold w-10 text-right">{skill.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. SEO Configuration panel */}
              {activeTab === 'seo' && seoForm && (
                <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider">SEO Core Settings</h2>
                      <p className="font-sans text-xs text-zinc-500 mt-1">Adjust site labels, indexing search patterns, and Open Graph links.</p>
                    </div>
                    <button
                      onClick={handleSaveSEO}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Save SEO Config
                    </button>
                  </div>

                  <div className="space-y-5 font-sans text-xs">
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Browser Meta Title</label>
                      <input
                        type="text"
                        value={seoForm.metaTitle || ''}
                        onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                        className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-semibold leading-relaxed"
                        placeholder="Usama Rasheed — Professional Track Portfolio"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Meta Description (Snippet indexer description on Google)</label>
                      <textarea
                        rows={3}
                        value={seoForm.metaDescription || ''}
                        onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                        className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white leading-relaxed"
                        placeholder="Enter description parameters..."
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Meta Keywords (Comma-separated queries list)</label>
                      <input
                        type="text"
                        value={seoForm.keywords || ''}
                        onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                        className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-mono"
                        placeholder="Usama Rasheed, Unscripted Studio, Biochar filtration"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-[10px] font-mono uppercase tracking-wider mb-2">Open Graph Image (Social Link Media Image preview URL)</label>
                      <input
                        type="text"
                        value={seoForm.ogImage || ''}
                        onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })}
                        className="w-full bg-[#141418] border border-white/5 p-3 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Messages panel */}
              {activeTab === 'messages' && (
                <div className="bg-[#0D0D10]/80 border border-white/5 rounded-2xl p-6.5 space-y-6">
                  {/* Messages Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div>
                      <h2 className="font-sans font-medium text-base text-white uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#00C853]" /> Client Inquiry Feed
                      </h2>
                      <p className="font-sans text-xs text-zinc-500 mt-1">Review, flag, or reply to specifications sent through the contact form.</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          setActionLoading(true);
                          await loadContactMessages();
                          setActionLoading(false);
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold rounded-lg uppercase tracking-wider duration-300 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                        Sync Mailbox
                      </button>
                    </div>
                  </div>

                  {/* Messages Search and Filter Controls */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={messagesSearch}
                        onChange={(e) => setMessagesSearch(e.target.value)}
                        className="w-full bg-[#141418] border border-white/5 pl-10 pr-4 py-3 rounded-xl text-xs text-white placeholder-zinc-500 transition-colors focus:border-[#00C853]/50 focus:bg-zinc-900/60 font-sans leading-relaxed outline-none"
                        placeholder="Search messages by name, email, or keywords..."
                      />
                    </div>
                    <div className="flex gap-1.5 shrink-0 bg-black/40 border border-white/5 p-1 rounded-xl">
                      {(['all', 'unread', 'read'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setMessagesFilter(opt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans capitalize transition-all cursor-pointer ${
                            messagesFilter === opt
                              ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/20'
                              : 'text-zinc-500 hover:text-white border border-transparent'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Grid Layout for Message List and Message Detail */}
                  {contactMessages.length === 0 ? (
                    <div className="border border-dashed border-white/5 bg-[#121215]/20 rounded-2xl py-16 px-4 text-center max-w-xl mx-auto space-y-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto text-zinc-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-sans font-medium text-zinc-300 text-xs uppercase tracking-wider">No specification logs found</h4>
                        <p className="font-sans text-xs text-zinc-500 mt-2 leading-relaxed">
                          Your client communication channel is completely calibrated. When someone submits an inquiry on the front page, it will sync here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      // Filter messages logic
                      const filtered = contactMessages.filter(msg => {
                        const matchesFilter = 
                          messagesFilter === 'all' 
                            || (messagesFilter === 'unread' && !msg.read)
                            || (messagesFilter === 'read' && msg.read);

                        const text = `${msg.name} ${msg.email} ${msg.subject} ${msg.message}`.toLowerCase();
                        const matchesSearch = text.includes(messagesSearch.toLowerCase());

                        return matchesFilter && matchesSearch;
                      });

                      const selectedMsg = filtered.find(m => m.id === selectedMessageId) || filtered[0];

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                          {/* Messages Left Master Selection Stream */}
                          <div className="lg:col-span-2 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                            {filtered.length === 0 ? (
                              <div className="text-center py-12 text-zinc-500 font-sans text-xs">
                                No messages matched your filters.
                              </div>
                            ) : (
                              filtered.map((msg) => {
                                const isSelected = selectedMsg?.id === msg.id;
                                const dateStr = new Date(msg.created_at).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });

                                return (
                                  <div
                                    key={msg.id}
                                    onClick={() => {
                                      setSelectedMessageId(msg.id);
                                      if (!msg.read) {
                                        // Auto mark as read on click
                                        toggleReadMessage(msg.id);
                                      }
                                    }}
                                    className={`p-3.5 rounded-xl cursor-pointer duration-200 border transition-all text-left flex justify-between gap-3 ${
                                      isSelected
                                        ? 'bg-[#00C853]/10 border-[#00C853]/30 text-white'
                                        : 'bg-[#141418]/60 hover:bg-[#18181f]/70 border-white/5 hover:border-white/10 text-zinc-400'
                                    }`}
                                  >
                                    <div className="space-y-1.5 overflow-hidden flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${msg.read ? 'bg-zinc-700' : 'bg-red-500 animate-pulse'}`} />
                                        <h4 className="font-sans font-semibold text-xs leading-none text-zinc-200 truncate">{msg.name}</h4>
                                      </div>
                                      <p className="font-mono text-[9px] text-zinc-500 leading-none truncate">{msg.email}</p>
                                      <p className="font-sans text-xs font-semibold text-zinc-300 leading-normal truncate">{msg.subject}</p>
                                      <span className="block font-mono text-[9px] text-zinc-500">{dateStr}</span>
                                    </div>
                                    <div className="flex flex-col justify-between items-end shrink-0">
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          if (confirm("Are you sure you want to delete this specification record?")) {
                                            await deleteContactMessage(msg.id);
                                            if (selectedMessageId === msg.id) {
                                              setSelectedMessageId(null);
                                            }
                                          }
                                        }}
                                        className="p-1.5 hover:bg-red-500/15 hover:text-red-500 duration-200 text-zinc-500 border border-transparent rounded-lg shrink-0 cursor-pointer"
                                        title="Delete Message Record"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Messages Right Detail View Panel */}
                          <div className="lg:col-span-3">
                            {selectedMsg ? (
                              <div className="bg-[#121215]/80 border border-white/5 rounded-2xl p-5 space-y-4">
                                <div className="flex justify-between items-start gap-4 flex-wrap border-b border-white/5 pb-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2.5">
                                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedMsg.read ? 'bg-zinc-700' : 'bg-red-500 animate-pulse'}`} />
                                      <h3 className="font-sans font-medium text-sm text-white">{selectedMsg.name}</h3>
                                    </div>
                                    <p className="font-mono text-xs text-zinc-400">Email: <a href={`mailto:${selectedMsg.email}`} className="hover:text-[#00C853] underline">{selectedMsg.email}</a></p>
                                    <p className="font-mono text-[10px] text-zinc-500">Received On: {new Date(selectedMsg.created_at).toLocaleString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => toggleReadMessage(selectedMsg.id)}
                                      className={`px-3 py-1.5 text-[10px] font-mono tracking-wider uppercase rounded-lg border cursor-pointer duration-200 transition-all ${
                                        selectedMsg.read
                                          ? 'bg-zinc-950/20 text-zinc-400 border-white/5 hover:bg-white/5'
                                          : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                      }`}
                                    >
                                      {selectedMsg.read ? 'Mark Unread' : 'Mark As Read'}
                                    </button>
                                    <a
                                      href={`mailto:${selectedMsg.email}?subject=RE: ${encodeURIComponent(selectedMsg.subject)}`}
                                      className="px-3 py-1.5 bg-[#00C853] hover:bg-[#00E55F] text-black text-[10px] font-mono tracking-wider font-semibold uppercase rounded-lg duration-200 flex items-center gap-1.5 shrink-0"
                                    >
                                      <ExternalLink className="w-3 h-3" /> Reply Client
                                    </a>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="bg-black/25 border border-white/5 p-3 rounded-lg">
                                    <span className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Subject Matter</span>
                                    <p className="font-sans text-xs text-white leading-normal font-medium">{selectedMsg.subject}</p>
                                  </div>

                                  <div className="bg-[#141418] border border-white/5 p-4 rounded-xl text-left">
                                    <span className="block font-mono text-[9px] text-[#00C853] uppercase tracking-widest mb-2.5">Specification Body / Message</span>
                                    <p className="font-sans text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap select-text">{selectedMsg.message}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-[#121215]/40 border border-dashed border-white/5 rounded-2xl h-full flex flex-col items-center justify-center p-8 text-zinc-500 text-center text-xs font-sans">
                                Select a client message from the left feed stream to review metadata specifications.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
