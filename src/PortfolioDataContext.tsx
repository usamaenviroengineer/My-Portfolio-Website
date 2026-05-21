import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Service, TimelineEvent, SkillGroup } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  USER_INFO, 
  PROJECTS_DATA, 
  SERVICES_DATA, 
  TIMELINE_DATA, 
  SKILLS_DATA,
  CLIENT_REASONS,
  HOME_FUN_FACTS
} from './data';

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage?: string;
}

interface PortfolioDataContextType {
  userInfo: typeof USER_INFO;
  projects: Project[];
  services: Service[];
  timeline: TimelineEvent[];
  skills: SkillGroup[];
  reasons: typeof CLIENT_REASONS;
  funFacts: typeof HOME_FUN_FACTS;
  seoSettings: SEOSettings;
  loading: boolean;
  dbConnected: boolean;
  
  // CMS update hooks (Real-time and Direct Database Persistence)
  saveUserInfo: (data: typeof USER_INFO) => Promise<boolean>;
  saveProjects: (data: Project[]) => Promise<boolean>;
  saveServices: (data: Service[]) => Promise<boolean>;
  saveTimeline: (data: TimelineEvent[]) => Promise<boolean>;
  saveSkills: (data: SkillGroup[]) => Promise<boolean>;
  saveReasons: (data: typeof CLIENT_REASONS) => Promise<boolean>;
  saveFunFacts: (data: typeof HOME_FUN_FACTS) => Promise<boolean>;
  saveSEOSettings: (data: SEOSettings) => Promise<boolean>;
  
  // Seed database utility
  seedDatabase: () => Promise<boolean>;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<typeof USER_INFO>(USER_INFO);
  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [services, setServices] = useState<Service[]>(SERVICES_DATA);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(TIMELINE_DATA);
  const [skills, setSkills] = useState<SkillGroup[]>(SKILLS_DATA);
  const [reasons, setReasons] = useState<typeof CLIENT_REASONS>(CLIENT_REASONS);
  const [funFacts, setFunFacts] = useState<typeof HOME_FUN_FACTS>(HOME_FUN_FACTS);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    metaTitle: "Usama Rasheed — Environmental Engineer & AI Developer",
    metaDescription: "Bridging sustainability with digital innovation through AI tools, modern web setups, and pollution control vectors.",
    keywords: "Usama Rasheed, Environmental Engineer, AI Specialist, Unscripted Studio, Web Solutions, Biochar, Remote Sensing",
    ogImage: "https://myphotosss.netlify.app/5.png",
  });
  
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  // Apply SEO tags to the browser document dynamically (instant validation of save)
  useEffect(() => {
    if (seoSettings.metaTitle) {
      document.title = seoSettings.metaTitle;
    }
    
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      let element = isProperty 
        ? document.querySelector(`meta[property="${name}"]`)
        : document.querySelector(`meta[name="${name}"]`);
        
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    if (seoSettings.metaDescription) {
      updateMetaTag('description', seoSettings.metaDescription);
      updateMetaTag('og:description', seoSettings.metaDescription, true);
    }
    if (seoSettings.keywords) {
      updateMetaTag('keywords', seoSettings.keywords);
    }
    if (seoSettings.metaTitle) {
      updateMetaTag('og:title', seoSettings.metaTitle, true);
    }
    if (seoSettings.ogImage) {
      updateMetaTag('og:image', seoSettings.ogImage, true);
    }
  }, [seoSettings]);

  // Load configuration and dynamic tables from Supabase on init
  useEffect(() => {
    async function loadPortfolioData() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // A. Load Key-Value general configs
        const { data: configData, error: configError } = await supabase
          .from('configs')
          .select('*');

        if (!configError && configData) {
          setDbConnected(true);
          const mappedConfigs = configData.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});

          if (mappedConfigs.user_info) setUserInfo(mappedConfigs.user_info);
          if (mappedConfigs.reasons_data) setReasons(mappedConfigs.reasons_data);
          if (mappedConfigs.fun_facts_data) setFunFacts(mappedConfigs.fun_facts_data);
          if (mappedConfigs.skills_data) setSkills(mappedConfigs.skills_data);
          if (mappedConfigs.seo_data) setSeoSettings(mappedConfigs.seo_data);
        } else {
          console.warn('Configs table could not be fetched. Using default local fallback state.', configError);
        }

        // B. Load structured tables
        const [projectsRes, servicesRes, timelineRes] = await Promise.all([
          supabase.from('projects').select('*').order('created_at', { ascending: true }),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('timeline').select('*').order('created_at', { ascending: true })
        ]);

        if (!projectsRes.error && projectsRes.data && projectsRes.data.length > 0) {
          // Parse string array or parse complex structures
          const convertedProjects: Project[] = projectsRes.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category,
            imageUrl: p.imageUrl,
            technologies: Array.isArray(p.technologies) ? p.technologies : JSON.parse(p.technologies || '[]'),
            liveUrl: p.liveUrl || undefined,
            githubUrl: p.githubUrl || undefined,
            extendedDetails: p.extendedDetails || undefined
          }));
          setProjects(convertedProjects);
        }

        if (!servicesRes.error && servicesRes.data && servicesRes.data.length > 0) {
          const convertedServices: Service[] = servicesRes.data.map((s: any) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            bullets: Array.isArray(s.bullets) ? s.bullets : JSON.parse(s.bullets || '[]'),
            iconName: s.iconName,
            category: s.category
          }));
          setServices(convertedServices);
        }

        if (!timelineRes.error && timelineRes.data && timelineRes.data.length > 0) {
          const convertedTimeline: TimelineEvent[] = timelineRes.data.map((t: any) => ({
            id: t.id,
            role: t.role,
            company: t.company,
            location: t.location,
            duration: t.duration,
            description: Array.isArray(t.description) ? t.description : JSON.parse(t.description || '[]'),
            skills: Array.isArray(t.skills) ? t.skills : JSON.parse(t.skills || '[]'),
            category: t.category
          }));
          setTimeline(convertedTimeline);
        }

      } catch (err) {
        console.error('Error connecting with Supabase database:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolioData();
  }, []);

  // --- PERSISTENCE MUTATORS ---

  const saveUserInfo = async (data: typeof USER_INFO): Promise<boolean> => {
    setUserInfo(data); // Real-time front update
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('configs')
        .upsert({ key: 'user_info', value: data });
      return !error;
    } catch {
      return false;
    }
  };

  const saveReasons = async (data: typeof CLIENT_REASONS): Promise<boolean> => {
    setReasons(data);
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('configs')
        .upsert({ key: 'reasons_data', value: data });
      return !error;
    } catch {
      return false;
    }
  };

  const saveFunFacts = async (data: typeof HOME_FUN_FACTS): Promise<boolean> => {
    setFunFacts(data);
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('configs')
        .upsert({ key: 'fun_facts_data', value: data });
      return !error;
    } catch {
      return false;
    }
  };

  const saveSkills = async (data: SkillGroup[]): Promise<boolean> => {
    setSkills(data);
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('configs')
        .upsert({ key: 'skills_data', value: data });
      return !error;
    } catch {
      return false;
    }
  };

  const saveSEOSettings = async (data: SEOSettings): Promise<boolean> => {
    setSeoSettings(data);
    if (!supabase) return true;
    try {
      const { error } = await supabase
        .from('configs')
        .upsert({ key: 'seo_data', value: data });
      return !error;
    } catch {
      return false;
    }
  };

  const saveProjects = async (newProjects: Project[]): Promise<boolean> => {
    setProjects(newProjects);
    if (!supabase) return true;
    try {
      // Direct replace mapping
      // Delete all current rows in projects table and perform clean insert
      const { error: deletionError } = await supabase
        .from('projects')
        .delete()
        .neq('id', 'placeholder-uuid-unmatched'); // Delete all

      if (deletionError) throw deletionError;

      if (newProjects.length === 0) return true;

      const itemsToInsert = newProjects.map((p, idx) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        imageUrl: p.imageUrl,
        technologies: p.technologies,
        liveUrl: p.liveUrl || null,
        githubUrl: p.githubUrl || null,
        extendedDetails: p.extendedDetails || null,
        created_at: new Date(Date.now() + idx * 1000).toISOString() // Preserve order
      }));

      const { error } = await supabase
        .from('projects')
        .insert(itemsToInsert);

      return !error;
    } catch (err) {
      console.error('Error saving projects to database:', err);
      return false;
    }
  };

  const saveServices = async (newServices: Service[]): Promise<boolean> => {
    setServices(newServices);
    if (!supabase) return true;
    try {
      const { error: deletionError } = await supabase
        .from('services')
        .delete()
        .neq('id', 'placeholder-uuid-unmatched');

      if (deletionError) throw deletionError;

      if (newServices.length === 0) return true;

      const itemsToInsert = newServices.map((s, idx) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        bullets: s.bullets,
        iconName: s.iconName,
        category: s.category,
        created_at: new Date(Date.now() + idx * 1000).toISOString()
      }));

      const { error } = await supabase
        .from('services')
        .insert(itemsToInsert);

      return !error;
    } catch (err) {
      console.error('Error saving services to database:', err);
      return false;
    }
  };

  const saveTimeline = async (newTimeline: TimelineEvent[]): Promise<boolean> => {
    setTimeline(newTimeline);
    if (!supabase) return true;
    try {
      const { error: deletionError } = await supabase
        .from('timeline')
        .delete()
        .neq('id', 'placeholder-uuid-unmatched');

      if (deletionError) throw deletionError;

      if (newTimeline.length === 0) return true;

      const itemsToInsert = newTimeline.map((t, idx) => ({
        id: t.id,
        role: t.role,
        company: t.company,
        location: t.location,
        duration: t.duration,
        description: t.description,
        skills: t.skills,
        category: t.category,
        created_at: new Date(Date.now() + idx * 1000).toISOString()
      }));

      const { error } = await supabase
        .from('timeline')
        .insert(itemsToInsert);

      return !error;
    } catch (err) {
      console.error('Error saving timeline events to database:', err);
      return false;
    }
  };

  // --- SEED UTILITY (Allows a user to push default local data to their fresh Supabase db automatically) ---
  const seedDatabase = async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      setLoading(true);

      // 1. Seed general configs
      await supabase.from('configs').upsert({ key: 'user_info', value: USER_INFO });
      await supabase.from('configs').upsert({ key: 'reasons_data', value: CLIENT_REASONS });
      await supabase.from('configs').upsert({ key: 'fun_facts_data', value: HOME_FUN_FACTS });
      await supabase.from('configs').upsert({ key: 'skills_data', value: SKILLS_DATA });
      await supabase.from('configs').upsert({ key: 'seo_data', value: {
        metaTitle: "Usama Rasheed — Environmental Engineer & AI Developer",
        metaDescription: "Bridging sustainability with digital innovation through AI tools, modern web setups, and pollution control vectors.",
        keywords: "Usama Rasheed, Environmental Engineer, AI Specialist, Unscripted Studio, Web Solutions, Biochar, Remote Sensing",
        ogImage: "https://myphotosss.netlify.app/5.png"
      }});

      // 2. Seed projects
      await supabase.from('projects').delete().neq('id', 'placeholder');
      const projectsToInsert = PROJECTS_DATA.map((p, idx) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        imageUrl: p.imageUrl,
        technologies: p.technologies,
        liveUrl: p.liveUrl || null,
        githubUrl: p.githubUrl || null,
        extendedDetails: p.extendedDetails || null,
        created_at: new Date(Date.now() + idx * 1000).toISOString()
      }));
      await supabase.from('projects').insert(projectsToInsert);

      // 3. Seed services
      await supabase.from('services').delete().neq('id', 'placeholder');
      const servicesToInsert = SERVICES_DATA.map((s, idx) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        bullets: s.bullets,
        iconName: s.iconName,
        category: s.category,
        created_at: new Date(Date.now() + idx * 1000).toISOString()
      }));
      await supabase.from('services').insert(servicesToInsert);

      // 4. Seed timeline
      await supabase.from('timeline').delete().neq('id', 'placeholder');
      const timelineToInsert = TIMELINE_DATA.map((t, idx) => ({
        id: t.id,
        role: t.role,
        company: t.company,
        location: t.location,
        duration: t.duration,
        description: t.description,
        skills: t.skills,
        category: t.category,
        created_at: new Date(Date.now() + idx * 1000).toISOString()
      }));
      await supabase.from('timeline').insert(timelineToInsert);

      // Trigger re-read values instantly
      setUserInfo(USER_INFO);
      setReasons(CLIENT_REASONS);
      setFunFacts(HOME_FUN_FACTS);
      setSkills(SKILLS_DATA);
      setProjects(PROJECTS_DATA);
      setServices(SERVICES_DATA);
      setTimeline(TIMELINE_DATA);
      setDbConnected(true);
      return true;
    } catch (err) {
      console.error('Failed to seed Supabase database:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortfolioDataContext.Provider value={{
      userInfo,
      projects,
      services,
      timeline,
      skills,
      reasons,
      funFacts,
      seoSettings,
      loading,
      dbConnected,
      saveUserInfo,
      saveProjects,
      saveServices,
      saveTimeline,
      saveSkills,
      saveReasons,
      saveFunFacts,
      saveSEOSettings,
      seedDatabase
    }}>
      {children}
    </PortfolioDataContext.Provider>
  );
}

export function usePortfolioData() {
  const context = useContext(PortfolioDataContext);
  if (context === undefined) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
}
