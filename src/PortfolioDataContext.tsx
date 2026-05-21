import React, { createContext, useContext, useState } from 'react';
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

interface PortfolioDataContextType {
  userInfo: typeof USER_INFO;
  projects: Project[];
  services: Service[];
  timeline: TimelineEvent[];
  skills: SkillGroup[];
  reasons: typeof CLIENT_REASONS;
  funFacts: typeof HOME_FUN_FACTS;
  loading: boolean;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
  const [userInfo] = useState<typeof USER_INFO>(USER_INFO);
  const [projects] = useState<Project[]>(PROJECTS_DATA);
  const [services] = useState<Service[]>(SERVICES_DATA);
  const [timeline] = useState<TimelineEvent[]>(TIMELINE_DATA);
  const [skills] = useState<SkillGroup[]>(SKILLS_DATA);
  const [reasons] = useState<typeof CLIENT_REASONS>(CLIENT_REASONS);
  const [funFacts] = useState<typeof HOME_FUN_FACTS>(HOME_FUN_FACTS);
  
  return (
    <PortfolioDataContext.Provider value={{
      userInfo,
      projects,
      services,
      timeline,
      skills,
      reasons,
      funFacts,
      loading: false
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
