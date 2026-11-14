// packages/core/src/domain/entities/profile.ts

export interface NavLink {
  id?: string;
  label: string;
  url: string;
}

export interface Profile {
  id?: string;
  name: string;
  title: string;
  bio: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  avatarUrl?: string;
  cvUrl?: string;
  themeId?: string;
  headerTitle?: string;
  headerLogoUrl?: string;
  navLinks?: NavLink[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProjectType = 'web' | 'game';

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  highlights: string[];
  stack: string[];
  backgroundVideoUrl?: string;
  location?: string;
  companyUrl?: string;
  profileId?: string;
  order?: number;
  isExtra?: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  type: ProjectType;
  summary: string;
  features: string[];
  stack: string[];
  previewImageUrl: string;
  liveUrl?: string;
  repoUrl?: string;
  profileId?: string;
  featured?: boolean;
}

export interface Experience {
  id?: string;
  profileId?: string;
  company: string;
  position: string;
  role?: string;
  period?: string;
  startDate?: Date;
  endDate?: Date;
  current?: boolean;
  description?: string;
  location?: string;
  companyUrl?: string;
  videoUrl?: string;
  backgroundVideoUrl?: string;
  highlights?: string[];
  stack?: string[];
  order?: number;
  isExtra?: boolean;
}

export interface Education {
  id?: string;
  profileId: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate?: Date;
  gpa?: string;
  description?: string;
  achievement?: string;
}

export interface Project {
  id?: string;
  profileId?: string;
  name?: string;
  title?: string;
  type?: ProjectType;
  description?: string;
  summary?: string;
  features?: string[];
  url?: string;
  liveUrl?: string;
  repoUrl?: string;
  imageUrl?: string;
  previewImageUrl?: string;
  tags?: string[];
  stack?: string[];
  featured?: boolean;
  createdAt?: Date;
}

export interface Skill {
  id?: string;
  profileId: string;
  name: string;
  category: string;
  level: number;
}

export interface SocialLink {
  id?: string;
  profileId: string;
  platform: string;
  url: string;
  username?: string;
}

export interface ContactInfo {
  id?: string;
  profileId: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
