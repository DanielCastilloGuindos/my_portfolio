// packages/core/src/schemas/profile.schema.ts

import { z } from 'zod';

export const navLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  url: z.string().min(1, 'URL is required'),
});

export const profileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  bio: z.string()
    .min(10, 'Bio must be at least 10 characters')
    .max(150, 'Bio must be maximum 150 characters (2 lines of 75 chars)'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  cvUrl: z.string().url().optional().or(z.literal('')),
  themeId: z.string().optional(),
  headerTitle: z.string().optional(),
  headerLogoUrl: z.string().url().optional().or(z.literal('')),
  navLinks: z.array(navLinkSchema).optional(),
});

export const workExperienceSchema = z.object({
  id: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  period: z.string().min(1, 'Period is required'),
  highlights: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  backgroundVideoUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  profileId: z.string().optional(),
  order: z.coerce.number().int().min(0).optional(),
  isExtra: z.boolean().optional(),
});

export const portfolioProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['web', 'game']),
  summary: z.string().min(1, 'Summary is required'),
  features: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  previewImageUrl: z.string().min(1, 'Preview image URL is required'),
  liveUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  profileId: z.string().optional(),
  featured: z.boolean().optional(),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  profileId: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().optional().default(''),
  role: z.string().optional(),
  period: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  description: z.string().optional().default(''),
  location: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  backgroundVideoUrl: z.string().url().optional().or(z.literal('')),
  highlights: z.array(z.string()).optional(),
  stack: z.array(z.string()).optional(),
  order: z.coerce.number().int().min(0).default(0),
  isExtra: z.boolean().default(false),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  profileId: z.string(),
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  gpa: z.string().optional(),
  description: z.string().optional(),
  achievement: z.string().optional(),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  profileId: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(['web', 'game']).optional(),
  description: z.string().optional(),
  summary: z.string().optional(),
  features: z.array(z.string()).optional(),
  url: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  previewImageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  stack: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
});

export const skillSchema = z.object({
  id: z.string().optional(),
  profileId: z.string(),
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  level: z.coerce.number().min(1).max(5).default(1),
});

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  profileId: z.string(),
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  username: z.string().optional(),
});

export const contactInfoSchema = z.object({
  id: z.string().optional(),
  profileId: z.string(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  location: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type NavLinkInput = z.infer<typeof navLinkSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type PortfolioProjectInput = z.infer<typeof portfolioProjectSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
