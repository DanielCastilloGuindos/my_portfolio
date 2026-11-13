// packages/core/src/domain/repositories/portfolio-repository.ts

import type {
  Profile,
  Experience,
  Education,
  Project,
  Skill,
  SocialLink,
  ContactInfo,
  NavLink,
  WorkExperience,
  PortfolioProject,
} from '../entities/profile';

export interface PortfolioRepository {
  // Profile
  createProfile(profile: Omit<Profile, 'id'> & { id?: string }): Promise<Profile>;
  getProfileById(id: string): Promise<Profile | null>;
  updateProfile(id: string, data: Partial<Profile>): Promise<Profile>;
  deleteProfile(id: string): Promise<void>;

  // Experience
  addExperience(experience: Omit<Experience, 'id'>): Promise<Experience>;
  updateExperience(id: string, data: Partial<Experience>): Promise<Experience>;
  deleteExperience(id: string): Promise<void>;

  // Education
  addEducation(education: Omit<Education, 'id'>): Promise<Education>;
  updateEducation(id: string, data: Partial<Education>): Promise<Education>;
  deleteEducation(id: string): Promise<void>;

  // Projects
  addProject(project: Omit<Project, 'id'>): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Skills
  addSkill(skill: Omit<Skill, 'id'>): Promise<Skill>;
  updateSkill(id: string, data: Partial<Skill>): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;

  // Social Links
  addSocialLink(link: Omit<SocialLink, 'id'>): Promise<SocialLink>;
  updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink>;
  deleteSocialLink(id: string): Promise<void>;

  // Contact Info
  addContactInfo(contact: Omit<ContactInfo, 'id'>): Promise<ContactInfo>;
  getContactInfoByProfileId(profileId: string): Promise<ContactInfo | null>;
  updateContactInfo(id: string, data: Partial<ContactInfo>): Promise<ContactInfo>;
  deleteContactInfo(id: string): Promise<void>;

  // Full portfolio export
  getFullPortfolio(profileId: string): Promise<PortfolioData>;
}

export interface PortfolioData {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  socialLinks: SocialLink[];
  contactInfo: ContactInfo | null;
  navLinks?: NavLink[];
}
