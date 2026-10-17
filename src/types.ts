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

export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage?: string;
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
  bio?: string;
}

export interface BlogSEOMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Rich HTML content
  featuredImage: string;
  category: string;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string; // ISO date string
  updatedAt: string;
  readingTime: string; // e.g. "6 min read"
  status: 'published' | 'draft' | 'scheduled' | 'archived';
  scheduledDate?: string;
  featured: boolean; // Pinned or highlighted post
  seo?: BlogSEOMetadata;
  views?: number;
}

