// packages/db/src/schema.ts

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const profiles = sqliteTable('profiles', {
  id: text('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  title: text('title').notNull(),
  bio: text('bio').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  location: text('location'),
  avatarUrl: text('avatar_url'),
  cvUrl: text('cv_url'),
  themeId: text('theme_id'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const experiences = sqliteTable('experiences', {
  id: text('id', { length: 36 }).primaryKey(),
  profileId: text('profile_id', { length: 36 }).notNull().references(() => profiles.id),
  company: text('company').notNull(),
  position: text('position').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  current: integer('current').default(0),
  description: text('description').notNull(),
  location: text('location'),
  videoUrl: text('video_url'),
  order: integer('order').default(0),
  isExtra: integer('is_extra').default(0),
});

export const education = sqliteTable('education', {
  id: text('id', { length: 36 }).primaryKey(),
  profileId: text('profile_id', { length: 36 }).notNull().references(() => profiles.id),
  institution: text('institution').notNull(),
  degree: text('degree').notNull(),
  fieldOfStudy: text('field_of_study'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  gpa: text('gpa'),
  description: text('description'),
  achievement: text('achievement'),
});

export const projects = sqliteTable('projects', {
  id: text('id', { length: 36 }).primaryKey(),
  profileId: text('profile_id', { length: 36 }).notNull().references(() => profiles.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url'),
  repoUrl: text('repo_url'),
  imageUrl: text('image_url'),
  featured: integer('featured').default(0),
  createdAt: text('created_at'),
});

export const projectTags = sqliteTable('project_tags', {
  id: text('id', { length: 36 }).primaryKey(),
  projectId: text('project_id', { length: 36 }).notNull().references(() => projects.id),
  tag: text('tag').notNull(),
});

export const skills = sqliteTable('skills', {
  id: text('id', { length: 36 }).primaryKey(),
  profileId: text('profile_id', { length: 36 }).notNull().references(() => profiles.id),
  name: text('name').notNull(),
  category: text('category').notNull(),
  level: integer('level').default(1),
});

export const socialLinks = sqliteTable('social_links', {
  id: text('id', { length: 36 }).primaryKey(),
  profileId: text('profile_id', { length: 36 }).notNull().references(() => profiles.id),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  username: text('username'),
});

export const contactInfos = sqliteTable('contact_infos', {
  id: text('id', { length: 36 }).primaryKey(),
  profileId: text('profile_id', { length: 36 }).notNull().references(() => profiles.id),
  email: text('email').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  location: text('location'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  experiences: many(experiences),
  education: many(education),
  projects: many(projects),
  skills: many(skills),
  socialLinks: many(socialLinks),
  contactInfos: many(contactInfos),
}));

export const experiencesRelations = relations(experiences, ({ one }) => ({
  profile: one(profiles, { fields: [experiences.profileId], references: [profiles.id] }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  profile: one(profiles, { fields: [education.profileId], references: [profiles.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  profile: one(profiles, { fields: [projects.profileId], references: [profiles.id] }),
  tags: many(projectTags),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  profile: one(profiles, { fields: [skills.profileId], references: [profiles.id] }),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profiles, { fields: [socialLinks.profileId], references: [profiles.id] }),
}));

export const contactInfosRelations = relations(contactInfos, ({ one }) => ({
  profile: one(profiles, { fields: [contactInfos.profileId], references: [profiles.id] }),
}));
