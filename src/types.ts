export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Environmental Projects' | 'AI Projects' | 'Web Development' | 'Research' | 'Design Work';
  imageUrl: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  extendedDetails?: {
    challenge: string;
    solution: string;
    impact: string;
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  iconName: string; // Lucide icon name
  category: 'core' | 'digital' | 'creative';
}

export interface TimelineEvent {
  id: string;
  role: string;
  company: string;
  location: string;
  duration: string;
  description: string[];
  skills: string[];
  category: 'professional' | 'volunteer' | 'academic';
}

export interface SkillGroup {
  category: string;
  skills: { name: string; percentage: number }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

