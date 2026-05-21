import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Service, TimelineEvent, SkillGroup } from './types';
import { 
  USER_INFO, 
  PROJECTS_DATA, 
  SERVICES_DATA, 
  TIMELINE_DATA, 
  SKILLS_DATA,
  CLIENT_REASONS,
  HOME_FUN_FACTS
} from './data';

interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  ipAddress?: string;
  isRead?: boolean;
}

interface PortfolioDataContextType {
  userInfo: typeof USER_INFO;
  projects: Project[];
  services: Service[];
  timeline: TimelineEvent[];
  skills: SkillGroup[];
  reasons: typeof CLIENT_REASONS;
  funFacts: typeof HOME_FUN_FACTS;
  loading: boolean;
  messages: AdminMessage[];
  
  // Update functions
  updateUserInfo: (info: typeof USER_INFO) => Promise<boolean>;
  updateProjects: (projects: Project[]) => Promise<boolean>;
  updateServices: (services: Service[]) => Promise<boolean>;
  updateTimeline: (timeline: TimelineEvent[]) => Promise<boolean>;
  updateSkills: (skills: SkillGroup[]) => Promise<boolean>;
  
  // Message operations
  fetchMessages: () => Promise<void>;
  deleteMessage: (id: string) => Promise<boolean>;
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
  
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch live portfolio data from the Express backend
  const fetchPortfolioData = async () => {
    try {
      const res = await fetch('/api/portfolio-data');
      if (res.ok) {
        const data = await res.json();
        if (data.userInfo) setUserInfo(data.userInfo);
        if (data.projects) setProjects(data.projects);
        if (data.services) setServices(data.services);
        if (data.timeline) setTimeline(data.timeline);
        if (data.skills) setSkills(data.skills);
        if (data.reasons) setReasons(data.reasons);
        if (data.funFacts) setFunFacts(data.funFacts);
      }
    } catch (err) {
      console.warn('Backend API not responding or unreachable. Defaulting to pre-baked dataset.', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for the hidden admin inbox
  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact-messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch inbox messages', err);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // Post dynamic changes to the backend
  const saveToServer = async (payload: Partial<any>) => {
    try {
      const res = await fetch('/api/portfolio-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save changes to backend API', err);
      return false;
    }
  };

  const updateUserInfo = async (info: typeof USER_INFO) => {
    setUserInfo(info);
    return await saveToServer({ userInfo: info });
  };

  const updateProjects = async (newProjects: Project[]) => {
    setProjects(newProjects);
    return await saveToServer({ projects: newProjects });
  };

  const updateServices = async (newServices: Service[]) => {
    setServices(newServices);
    return await saveToServer({ services: newServices });
  };

  const updateTimeline = async (newTimeline: TimelineEvent[]) => {
    setTimeline(newTimeline);
    return await saveToServer({ timeline: newTimeline });
  };

  const updateSkills = async (newSkills: SkillGroup[]) => {
    setSkills(newSkills);
    return await saveToServer({ skills: newSkills });
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete message', err);
      return false;
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
      loading,
      messages,
      updateUserInfo,
      updateProjects,
      updateServices,
      updateTimeline,
      updateSkills,
      fetchMessages,
      deleteMessage
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
