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
  };

  // Load configuration and dynamic tables from Supabase on init
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

        if (configData) {
          const mappedConfigs = configData.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});

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
        const { data: rawProjects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: true });

        if (!projectsError && rawProjects) {
          const convertedProjects: Project[] = rawProjects.map((p: any) => {
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
          setProjects(convertedProjects);
        } else if (projectsError) {
          console.error('Projects list fetch suffered custom error:', projectsError.message);
        }

        // B2. Load Services 
        const { data: rawServices, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });

        if (!servicesError && rawServices) {
          const convertedServices: Service[] = rawServices.map((s: any) => {
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
          setServices(convertedServices);
        } else if (servicesError) {
          console.error('Services configurations fetch suffered custom error:', servicesError.message);
        }

        // B3. Load Timeline Events (with dynamic mapping corresponding to tables)
        let timelineRes = await supabase.from('timeline_events').select('*');
        let isTimelineEventsTable = true;
        if (timelineRes.error) {
          timelineRes = await supabase.from('timeline').select('*');
          isTimelineEventsTable = false;
        }

        if (!timelineRes.error && timelineRes.data) {
          // Sort items locally to preserve chronological order
          const sortedTimeline = [...timelineRes.data].sort((a: any, b: any) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateA - dateB;
          });

          const convertedTimeline: TimelineEvent[] = sortedTimeline.map((t: any) => {
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
          setTimeline(convertedTimeline);
        } else if (timelineRes.error) {
          console.error('Timeline events fetch suffered custom error:', timelineRes.error.message);
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

  const saveProjects = async (newProjects: Project[]): Promise<boolean> => {
    setProjects(newProjects);
    if (!supabase) return true;
    try {
      // Direct replace transaction mapping
      const { error: deletionError } = await supabase
        .from('projects')
        .delete()
        .neq('id', 'placeholder-uuid-unmatched');

      if (deletionError) {
        console.error('Projects delete query failed:', deletionError.message);
        return false;
      }

      if (newProjects.length === 0) return true;

      // Map to correct standard snake_case schema columns
      const itemsToInsert = newProjects.map((p, idx) => {
        // Sanitize technologies text array formatting
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

      if (insertError) {
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

        if (fallbackError) {
          console.error('Both standard and fallback project saves failed:', fallbackError.message);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Critical project transaction exception:', err);
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

      if (deletionError) {
        console.error('Services delete query clean up step failed:', deletionError.message);
        return false;
      }

      if (newServices.length === 0) return true;

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

      if (insertError) {
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

        if (fallbackError) {
          console.error('Both standard and fallback service saves failed:', fallbackError.message);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Critical service transaction exception:', err);
      return false;
    }
  };

  const saveTimeline = async (newTimeline: TimelineEvent[]): Promise<boolean> => {
    setTimeline(newTimeline);
    if (!supabase) return true;
    try {
      // 1. Try 'timeline_events' first (Mapped with schema properties)
      const { error: deletionEventsError } = await supabase
        .from('timeline_events')
        .delete()
        .neq('id', 'placeholder-uuid-unmatched');

      let timelineEventsFormatted = newTimeline.map((t, idx) => ({
        id: t.id,
        year: t.duration || '',
        title: t.role || '',
        company: t.company || '',
        description: Array.isArray(t.description) ? JSON.stringify(t.description) : (t.description || ''),
        category: t.category || 'professional',
        created_at: new Date(Date.now() + idx * 1000).toISOString()
      }));

      if (!deletionEventsError) {
        if (newTimeline.length === 0) return true;

        const { error: insertEventsError } = await supabase
          .from('timeline_events')
          .insert(timelineEventsFormatted);

        if (!insertEventsError) return true;
        console.warn('Failed timeline_events writing, falling back to timeline table:', insertEventsError.message);
      }

      // 2. Fallback table layout: 'timeline'
      const { error: deletionTimelineError } = await supabase
        .from('timeline')
        .delete()
        .neq('id', 'placeholder-uuid-unmatched');

      if (deletionTimelineError) {
        console.error('Core and custom fallback timeline tables both failed deletions operations:', deletionTimelineError.message);
        return false;
      }

      if (newTimeline.length === 0) return true;

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

      if (insertTimelineError) {
        console.error('Timeline fallback index insert query failed:', insertTimelineError.message);
        return false;
      }

      return true;
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

      const allSuccess = okConf1 && okConf2 && okConf3 && okConf4 && okConf5 && okProj && okServ && okTime;
      
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
      return allSuccess;
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
