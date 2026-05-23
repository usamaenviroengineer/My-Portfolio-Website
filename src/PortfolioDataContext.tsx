import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Service, TimelineEvent, SkillGroup, ContactMessage } from './types';
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
  
  // Contact Form Messages state
  contactMessages: ContactMessage[];
  addContactMessage: (data: Omit<ContactMessage, 'id' | 'created_at' | 'read'>) => Promise<boolean>;
  deleteContactMessage: (id: string) => Promise<boolean>;
  toggleReadMessage: (id: string) => Promise<boolean>;
  loadContactMessages: () => Promise<void>;
  
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
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

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

  // --- PORTFOLIO DUAL-SCHEMA UTILITY ENGINE ---
  const upsertConfigHelper = async (key: string, value: any): Promise<boolean> => {
    if (!supabase) return true;
    try {
      // 1. Try 'portfolio_configs' first (Standard schema)
      const { error } = await supabase
        .from('portfolio_configs')
        .upsert({ 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        });

      if (!error) return true;

      // 2. Fallback to 'configs' table if portfolio_configs relation doesn't exist (error code 42P01)
      if (error.code === '42P01') {
        const { error: fallbackError } = await supabase
          .from('configs')
          .upsert({ 
            key, 
            value 
          });

        if (fallbackError) {
          console.error(`Fallback 'configs' write transaction failed for key [${key}]:`, fallbackError);
          return false;
        }
        return true;
      }

      console.error(`Standard 'portfolio_configs' write query failed [${error.code}]:`, error.message, error.details);
      return false;
    } catch (err) {
      console.error(`Critical exception in upsertConfigHelper for key [${key}]:`, err);
      return false;
    }
  };  // Load configuration and dynamic tables from Supabase on init
  useEffect(() => {
    async function loadPortfolioData() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // A. Load Key-Value general configs with self-healing table naming
        let configData = null;
        let configError = null;

        try {
          const res = await supabase.from('portfolio_configs').select('*');
          configData = res.data;
          configError = res.error;
        } catch (e) {
          configError = e;
        }

        if (configError || !configData) {
          // Retry with fallback "configs" table
          const resFallback = await supabase.from('configs').select('*');
          if (!resFallback.error && resFallback.data) {
            configData = resFallback.data;
            setDbConnected(true);
          } else {
            console.warn('Config databases could not find configs or portfolio_configs. Standard defaults will be used.', resFallback.error);
          }
        } else {
          setDbConnected(true);
        }

        const mappedConfigs: any = {};
        if (configData) {
          configData.forEach((curr: any) => {
            mappedConfigs[curr.key] = curr.value;
          });

          if (mappedConfigs.user_info) setUserInfo(mappedConfigs.user_info);
          if (mappedConfigs.reasons_data) setReasons(mappedConfigs.reasons_data);
          if (mappedConfigs.fun_facts_data) setFunFacts(mappedConfigs.fun_facts_data);
          
          if (mappedConfigs.skills_data) {
            // Sanitize skill lists
            const sanitizedSkills = Array.isArray(mappedConfigs.skills_data) 
              ? mappedConfigs.skills_data.map((g: any) => ({
                  category: g.category || '',
                  skills: Array.isArray(g.skills) 
                    ? g.skills.map((s: any) => ({
                        name: s.name || '',
                        percentage: typeof s.percentage === 'number' ? s.percentage : (Number(s.percentage) || 100)
                      })) 
                    : []
                }))
              : SKILLS_DATA;
            setSkills(sanitizedSkills);
          }
          if (mappedConfigs.seo_data) setSeoSettings(mappedConfigs.seo_data);
        }

        // B1. Load Projects (resolving snake_case fields / camelCase compatibility)
        let loadedProjects: Project[] = [];
        try {
          const { data: rawProjects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: true });

          if (!projectsError && rawProjects && rawProjects.length > 0) {
            loadedProjects = rawProjects.map((p: any) => {
              // Unpack technologies TEXT[] safely
              let techArray: string[] = [];
              if (Array.isArray(p.technologies)) {
                techArray = p.technologies;
              } else if (p.technologies) {
                try {
                  const parsed = JSON.parse(p.technologies);
                  techArray = Array.isArray(parsed) ? parsed : [p.technologies];
                } catch {
                  techArray = [p.technologies];
                }
              }
              techArray = techArray.map(t => String(t).trim()).filter(Boolean);

              // Handle optional case study extended text fields or nested json
              let caseStudy = undefined;
              if (p.challenge || p.solution || p.impact) {
                caseStudy = {
                  challenge: p.challenge || '',
                  solution: p.solution || '',
                  impact: p.impact || ''
                };
              } else if (p.extendedDetails) {
                try {
                  const details = typeof p.extendedDetails === 'string' ? JSON.parse(p.extendedDetails) : p.extendedDetails;
                  if (details) {
                    caseStudy = {
                      challenge: details.challenge || '',
                      solution: details.solution || '',
                      impact: details.impact || ''
                    };
                  }
                } catch {
                  // Return empty
                }
              }

              return {
                id: p.id,
                title: p.title || '',
                description: p.description || '',
                category: p.category || 'Web Development',
                imageUrl: p.image_url || p.imageUrl || '',
                technologies: techArray,
                liveUrl: p.live_url || p.liveUrl || undefined,
                githubUrl: p.github_url || p.githubUrl || undefined,
                extendedDetails: caseStudy
              };
            });
          }
        } catch (err) {
          console.error("Dedicated projects load exception:", err);
        }

        if (loadedProjects.length > 0) {
          setProjects(loadedProjects);
        } else if (mappedConfigs.projects_data) {
          setProjects(mappedConfigs.projects_data);
        }

        // B2. Load Services 
        let loadedServices: Service[] = [];
        try {
          const { data: rawServices, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: true });

          if (!servicesError && rawServices && rawServices.length > 0) {
            loadedServices = rawServices.map((s: any) => {
              let bulletsArray: string[] = [];
              if (Array.isArray(s.bullets)) {
                bulletsArray = s.bullets;
              } else if (s.bullets) {
                try {
                  const parsed = JSON.parse(s.bullets);
                  bulletsArray = Array.isArray(parsed) ? parsed : [s.bullets];
                } catch {
                  bulletsArray = [s.bullets];
                }
              }
              bulletsArray = bulletsArray.map(b => String(b).trim()).filter(Boolean);

              return {
                id: s.id,
                title: s.title || '',
                description: s.description || '',
                bullets: bulletsArray,
                iconName: s.icon_name || s.iconName || 'Code',
                category: s.category || 'core'
              };
            });
          }
        } catch (err) {
          console.error("Dedicated services load exception:", err);
        }

        if (loadedServices.length > 0) {
          setServices(loadedServices);
        } else if (mappedConfigs.services_data) {
          setServices(mappedConfigs.services_data);
        }

        // B3. Load Timeline Events (with dynamic mapping corresponding to tables)
        let loadedTimeline: TimelineEvent[] = [];
        try {
          let timelineRes = await supabase.from('timeline_events').select('*');
          let isTimelineEventsTable = true;
          if (timelineRes.error) {
            timelineRes = await supabase.from('timeline').select('*');
            isTimelineEventsTable = false;
          }

          if (!timelineRes.error && timelineRes.data && timelineRes.data.length > 0) {
            // Sort items locally to preserve chronological order
            const sortedTimeline = [...timelineRes.data].sort((a: any, b: any) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateA - dateB;
            });

            loadedTimeline = sortedTimeline.map((t: any) => {
              let descArray: string[] = [];
              if (isTimelineEventsTable) {
                // Parse serialized string descriptions inside timeline_events table
                try {
                  const parsed = JSON.parse(t.description);
                  descArray = Array.isArray(parsed) ? parsed : [t.description];
                } catch {
                  descArray = t.description ? t.description.split('\n').map((s: string) => s.trim()).filter(Boolean) : [];
                }

                // Parse list of skills
                let skillsArray: string[] = [];
                if (Array.isArray(t.skills)) {
                  skillsArray = t.skills;
                } else if (t.skills) {
                  try {
                    const parsed = JSON.parse(t.skills);
                    skillsArray = Array.isArray(parsed) ? parsed : [];
                  } catch {
                    // Fallback
                  }
                }

                return {
                  id: t.id,
                  role: t.title || '',
                  company: t.company || '',
                  location: t.location || 'Local / Pakistan',
                  duration: t.year || '',
                  description: descArray.filter(Boolean),
                  skills: skillsArray.filter(Boolean),
                  category: t.category || 'professional'
                };
              } else {
                // Direct timeline mapping
                if (Array.isArray(t.description)) {
                  descArray = t.description;
                } else if (t.description) {
                  try {
                    const parsed = JSON.parse(t.description);
                    descArray = Array.isArray(parsed) ? parsed : [t.description];
                } catch {
                    descArray = [t.description];
                  }
                }

                let skillsArray: string[] = [];
                if (Array.isArray(t.skills)) {
                  skillsArray = t.skills;
                } else if (t.skills) {
                  try {
                    const parsed = JSON.parse(t.skills);
                    skillsArray = Array.isArray(parsed) ? parsed : [];
                  } catch {
                    // Fallback
                  }
                }

                return {
                  id: t.id,
                  role: t.role || '',
                  company: t.company || '',
                  location: t.location || 'Local / Pakistan',
                  duration: t.duration || '',
                  description: descArray.filter(Boolean),
                  skills: skillsArray.filter(Boolean),
                  category: t.category || 'professional'
                };
              }
            });
          }
        } catch (err) {
          console.error("Dedicated timeline load exception:", err);
        }

        if (loadedTimeline.length > 0) {
          setTimeline(loadedTimeline);
        } else if (mappedConfigs.timeline_data) {
          setTimeline(mappedConfigs.timeline_data);
        }

        // B4. Load Contact Messages
        let loadedMessages: ContactMessage[] = [];
        try {
          const { data: rawMessages, error: messagesError } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

          if (!messagesError && rawMessages) {
            loadedMessages = rawMessages.map((m: any) => ({
              id: m.id,
              name: m.name || '',
              email: m.email || '',
              subject: m.subject || m.service || 'Inquiry',
              message: m.message || '',
              created_at: m.created_at || new Date().toISOString(),
              read: m.read === true
            }));
          }
        } catch (err) {
          console.error("Dedicated contact messages load error:", err);
        }

        if (loadedMessages.length > 0) {
          setContactMessages(loadedMessages);
        } else if (mappedConfigs.contact_messages) {
          const mList = Array.isArray(mappedConfigs.contact_messages) ? mappedConfigs.contact_messages : [];
          const sorted = [...mList].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setContactMessages(sorted);
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
    setUserInfo(data);
    return await upsertConfigHelper('user_info', data);
  };

  const saveReasons = async (data: typeof CLIENT_REASONS): Promise<boolean> => {
    setReasons(data);
    return await upsertConfigHelper('reasons_data', data);
  };

  const saveFunFacts = async (data: typeof HOME_FUN_FACTS): Promise<boolean> => {
    setFunFacts(data);
    return await upsertConfigHelper('fun_facts_data', data);
  };

  const saveSkills = async (data: SkillGroup[]): Promise<boolean> => {
    setSkills(data);
    // Sanitize skills formatting securely
    const sanitizedData = data.map(g => ({
      category: g.category || '',
      skills: Array.isArray(g.skills) 
        ? g.skills.map(s => ({
            name: s.name || '',
            percentage: typeof s.percentage === 'number' ? s.percentage : (Number(s.percentage) || 100)
          })) 
        : []
    }));
    return await upsertConfigHelper('skills_data', sanitizedData);
  };

  const saveSEOSettings = async (data: SEOSettings): Promise<boolean> => {
    setSeoSettings(data);
    return await upsertConfigHelper('seo_data', data);
  };

  const loadContactMessages = async () => {
    if (!supabase) return;
    try {
      const { data: rawMessages, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!messagesError && rawMessages) {
        const loaded = rawMessages.map((m: any) => ({
          id: m.id,
          name: m.name || '',
          email: m.email || '',
          subject: m.subject || m.service || 'Inquiry',
          message: m.message || '',
          created_at: m.created_at || new Date().toISOString(),
          read: m.read === true
        }));
        setContactMessages(loaded);
        return;
      }

      // Retry/fallback on key/value storage if relation does not exist
      let configData = null;
      const res = await supabase.from('portfolio_configs').select('*').eq('key', 'contact_messages').single();
      if (res.data) {
        configData = res.data;
      } else {
        const resFallback = await supabase.from('configs').select('*').eq('key', 'contact_messages').single();
        configData = resFallback.data;
      }

      if (configData && configData.value) {
        const messages = Array.isArray(configData.value) ? configData.value : [];
        const sorted = [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setContactMessages(sorted);
      }
    } catch (err) {
      console.error('Error reloading contact messages:', err);
    }
  };

  const addContactMessage = async (msg: Omit<ContactMessage, 'id' | 'created_at' | 'read'>): Promise<boolean> => {
    const newMessage: ContactMessage = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + '-' + Date.now(),
      name: msg.name,
      email: msg.email,
      subject: msg.subject,
      message: msg.message,
      created_at: new Date().toISOString(),
      read: false
    };

    setContactMessages(prev => [newMessage, ...prev]);

    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          id: newMessage.id,
          name: newMessage.name,
          email: newMessage.email,
          subject: newMessage.subject,
          message: newMessage.message,
          created_at: newMessage.created_at,
          read: newMessage.read
        });

      if (!error) {
        // Keep config-backup in-sync too!
        const updatedBackup = [newMessage, ...contactMessages];
        await upsertConfigHelper('contact_messages', updatedBackup);
        return true;
      }

      if (error.code === '42P01') {
        const updatedBackup = [newMessage, ...contactMessages];
        return await upsertConfigHelper('contact_messages', updatedBackup);
      }

      console.error('Failed to save message to db:', error.message);
      return false;
    } catch (err) {
      console.error('Critical write contact message error:', err);
      return false;
    }
  };

  const deleteContactMessage = async (id: string): Promise<boolean> => {
    const finalMessages = contactMessages.filter(m => m.id !== id);
    setContactMessages(finalMessages);

    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (!error) {
        await upsertConfigHelper('contact_messages', finalMessages);
        return true;
      }

      if (error.code === '42P01') {
        return await upsertConfigHelper('contact_messages', finalMessages);
      }

      console.error('Failed to delete message from db:', error.message);
      return false;
    } catch (err) {
      console.error('Critical delete contact message error:', err);
      return false;
    }
  };

  const toggleReadMessage = async (id: string): Promise<boolean> => {
    let nextRead = false;
    const updatedMessages = contactMessages.map(m => {
      if (m.id === id) {
        nextRead = !m.read;
        return { ...m, read: nextRead };
      }
      return m;
    });

    setContactMessages(updatedMessages);

    if (!supabase) return true;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read: nextRead })
        .eq('id', id);

      if (!error) {
        await upsertConfigHelper('contact_messages', updatedMessages);
        return true;
      }

      if (error.code === '42P01') {
        return await upsertConfigHelper('contact_messages', updatedMessages);
      }

      console.error('Failed to update message status:', error.message);
      return false;
    } catch (err) {
      console.error('Critical toggle status contact message error:', err);
      return false;
    }
  };

  const saveProjects = async (newProjects: Project[]): Promise<boolean> => {
    setProjects(newProjects);
    if (!supabase) return true;
    try {
      let tableSuccess = false;
      try {
        // Direct replace transaction mapping
        const { error: deletionError } = await supabase
          .from('projects')
          .delete()
          .neq('id', 'placeholder-uuid-unmatched');

        if (!deletionError) {
          if (newProjects.length === 0) {
            tableSuccess = true;
          } else {
            // Map to correct standard snake_case schema columns
            const itemsToInsert = newProjects.map((p, idx) => {
              const cleanTech = Array.isArray(p.technologies)
                ? p.technologies.map(t => String(t).trim()).filter(Boolean)
                : [];

              return {
                id: p.id,
                title: p.title || '',
                description: p.description || '',
                category: p.category || 'Web Development',
                image_url: p.imageUrl || '',
                technologies: cleanTech,
                live_url: p.liveUrl || null,
                github_url: p.githubUrl || null,
                challenge: p.extendedDetails?.challenge || '',
                solution: p.extendedDetails?.solution || '',
                impact: p.extendedDetails?.impact || '',
                created_at: new Date(Date.now() + idx * 1000).toISOString()
              };
            });

            const { error: insertError } = await supabase
              .from('projects')
              .insert(itemsToInsert);

            if (!insertError) {
              tableSuccess = true;
            } else {
              console.warn('Projects standard snake_case write failed, trying camelCase fallback... Error:', insertError.message);

              const fallbackItems = newProjects.map((p, idx) => ({
                id: p.id,
                title: p.title || '',
                description: p.description || '',
                category: p.category || 'Web Development',
                imageUrl: p.imageUrl || '',
                technologies: Array.isArray(p.technologies) ? p.technologies.filter(Boolean) : [],
                liveUrl: p.liveUrl || null,
                githubUrl: p.githubUrl || null,
                extendedDetails: p.extendedDetails || null,
                created_at: new Date(Date.now() + idx * 1000).toISOString()
              }));

              const { error: fallbackError } = await supabase
                .from('projects')
                .insert(fallbackItems);

              if (!fallbackError) {
                tableSuccess = true;
              } else {
                console.error('Both standard and fallback project saves failed:', fallbackError.message);
              }
            }
          }
        } else {
          console.error('Projects deletion failed:', deletionError.message);
        }
      } catch (err) {
        console.error('Dedicated projects table write exception:', err);
      }

      // Constantly write map state as transparent configurations backup key
      const configSuccess = await upsertConfigHelper('projects_data', newProjects);
      return tableSuccess || configSuccess;
    } catch (err) {
      console.error('Critical project transaction exception:', err);
      return false;
    }
  };

  const saveServices = async (newServices: Service[]): Promise<boolean> => {
    setServices(newServices);
    if (!supabase) return true;
    try {
      let tableSuccess = false;
      try {
        const { error: deletionError } = await supabase
          .from('services')
          .delete()
          .neq('id', 'placeholder-uuid-unmatched');

        if (!deletionError) {
          if (newServices.length === 0) {
            tableSuccess = true;
          } else {
            // Sanitize bullets TEXT[] formatting
            const itemsToInsert = newServices.map((s, idx) => {
              const cleanBullets = Array.isArray(s.bullets)
                ? s.bullets.map(b => String(b).trim()).filter(Boolean)
                : [];

              return {
                id: s.id,
                title: s.title || '',
                description: s.description || '',
                bullets: cleanBullets,
                icon_name: s.iconName || 'Code',
                category: s.category || 'core',
                created_at: new Date(Date.now() + idx * 1000).toISOString()
              };
            });

            const { error: insertError } = await supabase
              .from('services')
              .insert(itemsToInsert);

            if (!insertError) {
              tableSuccess = true;
            } else {
              console.warn('Services standard snake_case write failed, trying camelCase fallback... Error:', insertError.message);

              const fallbackItems = newServices.map((s, idx) => ({
                id: s.id,
                title: s.title || '',
                description: s.description || '',
                bullets: Array.isArray(s.bullets) ? s.bullets.filter(Boolean) : [],
                iconName: s.iconName || 'Code',
                category: s.category || 'core',
                created_at: new Date(Date.now() + idx * 1000).toISOString()
              }));

              const { error: fallbackError } = await supabase
                .from('services')
                .insert(fallbackItems);

              if (!fallbackError) {
                tableSuccess = true;
              } else {
                console.error('Both standard and fallback service saves failed:', fallbackError.message);
              }
            }
          }
        } else {
          console.error('Services deletion failed:', deletionError.message);
        }
      } catch (err) {
        console.error('Dedicated services table write exception:', err);
      }

      const configSuccess = await upsertConfigHelper('services_data', newServices);
      return tableSuccess || configSuccess;
    } catch (err) {
      console.error('Critical service transaction exception:', err);
      return false;
    }
  };

  const saveTimeline = async (newTimeline: TimelineEvent[]): Promise<boolean> => {
    setTimeline(newTimeline);
    if (!supabase) return true;
    try {
      let tableSuccess = false;
      try {
        // 1. Try 'timeline_events' first (Mapped with schema properties)
        const { error: deletionEventsError } = await supabase
          .from('timeline_events')
          .delete()
          .neq('id', 'placeholder-uuid-unmatched');

        if (!deletionEventsError) {
          if (newTimeline.length === 0) {
            tableSuccess = true;
          } else {
            let timelineEventsFormatted = newTimeline.map((t, idx) => ({
              id: t.id,
              year: t.duration || '',
              title: t.role || '',
              company: t.company || '',
              description: Array.isArray(t.description) ? JSON.stringify(t.description) : (t.description || ''),
              category: t.category || 'professional',
              created_at: new Date(Date.now() + idx * 1000).toISOString()
            }));

            const { error: insertEventsError } = await supabase
              .from('timeline_events')
              .insert(timelineEventsFormatted);

            if (!insertEventsError) {
              tableSuccess = true;
            } else {
              console.warn('Failed timeline_events writing, trying backup table options:', insertEventsError.message);
            }
          }
        }
      } catch (err) {
        console.error('timeline_events table write exception:', err);
      }

      if (!tableSuccess) {
        try {
          // 2. Fallback table layout: 'timeline'
          const { error: deletionTimelineError } = await supabase
            .from('timeline')
            .delete()
            .neq('id', 'placeholder-uuid-unmatched');

          if (!deletionTimelineError) {
            if (newTimeline.length === 0) {
              tableSuccess = true;
            } else {
              const itemsToInsertTimeline = newTimeline.map((t, idx) => ({
                id: t.id,
                role: t.role || '',
                company: t.company || '',
                location: t.location || '',
                duration: t.duration || '',
                description: Array.isArray(t.description) ? t.description.map(x => String(x).trim()).filter(Boolean) : [],
                skills: Array.isArray(t.skills) ? t.skills.map(x => String(x).trim()).filter(Boolean) : [],
                category: t.category || 'professional',
                created_at: new Date(Date.now() + idx * 1000).toISOString()
              }));

              const { error: insertTimelineError } = await supabase
                .from('timeline')
                .insert(itemsToInsertTimeline);

              if (!insertTimelineError) {
                tableSuccess = true;
              } else {
                console.error('Timeline table fallback insert failed:', insertTimelineError.message);
              }
            }
          }
        } catch (err) {
          console.error('Dedicated timeline table write exception:', err);
        }
      }

      const configSuccess = await upsertConfigHelper('timeline_data', newTimeline);
      return tableSuccess || configSuccess;
    } catch (err) {
      console.error('Critical timeline transaction exception:', err);
      return false;
    }
  };

  // --- SEED UTILITY (Allows a user to push default local data to their fresh Supabase db automatically) ---
  const seedDatabase = async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      setLoading(true);

      // 1. Seed general configs using self-healing helper
      const seoData = {
        metaTitle: "Usama Rasheed — Environmental Engineer & AI Developer",
        metaDescription: "Bridging sustainability with digital innovation through AI tools, modern web setups, and pollution control vectors.",
        keywords: "Usama Rasheed, Environmental Engineer, AI Specialist, Unscripted Studio, Web Solutions, Biochar, Remote Sensing",
        ogImage: "https://myphotosss.netlify.app/5.png"
      };

      const okConf1 = await upsertConfigHelper('user_info', USER_INFO);
      const okConf2 = await upsertConfigHelper('reasons_data', CLIENT_REASONS);
      const okConf3 = await upsertConfigHelper('fun_facts_data', HOME_FUN_FACTS);
      const okConf4 = await upsertConfigHelper('skills_data', SKILLS_DATA);
      const okConf5 = await upsertConfigHelper('seo_data', seoData);

      // 2. Seed structured collections utilizing our bulletproof mutators
      const okProj = await saveProjects(PROJECTS_DATA);
      const okServ = await saveServices(SERVICES_DATA);
      const okTime = await saveTimeline(TIMELINE_DATA);

      // Seed is successful as long as we seeded the core configuration tables successfully
      const configsOk = okConf1 && okConf2 && okConf3 && okConf4 && okConf5;
      
      // Update local state for real-time reactivity
      setUserInfo(USER_INFO);
      setReasons(CLIENT_REASONS);
      setFunFacts(HOME_FUN_FACTS);
      setSkills(SKILLS_DATA);
      setProjects(PROJECTS_DATA);
      setServices(SERVICES_DATA);
      setTimeline(TIMELINE_DATA);
      setSeoSettings(seoData);

      setDbConnected(true);
      return configsOk;
    } catch (err) {
      console.error('Failed to seed Supabase database completely:', err);
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
      contactMessages,
      addContactMessage,
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
