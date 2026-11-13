// packages/db/src/repositories/portfolio-repository.impl.ts

import { db } from '../libsql';
import * as schema from '../schema';
import { eq, desc, asc } from 'drizzle-orm';
import type {
  PortfolioRepository,
  PortfolioData,
  Profile,
  Experience,
  Education,
  Project,
  Skill,
  SocialLink,
  ContactInfo,
} from '@portfolio/core';
import { v4 as uuidv4 } from 'uuid';

const now = () => new Date().toISOString();

export class DrizzlePortfolioRepository implements PortfolioRepository {
  // ---------- Profile ----------
  async createProfile(profile: Omit<Profile, 'id'> & { id?: string }): Promise<Profile> {
    const id = profile.id ?? uuidv4();
    const created = now();
    const [result] = await db
      .insert(schema.profiles)
      .values({
        id,
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        phone: profile.phone ?? null,
        whatsapp: profile.whatsapp ?? null,
        location: profile.location ?? null,
        avatarUrl: profile.avatarUrl ?? null,
        cvUrl: profile.cvUrl ?? null,
        themeId: profile.themeId ?? null,
        createdAt: created,
        updatedAt: created,
      })
      .returning();
    return this.mapProfile(result);
  }

  async getProfileById(id: string): Promise<Profile | null> {
    const [result] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.id, id));
    if (!result) return null;
    return this.mapProfile(result);
  }

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    const [result] = await db
      .update(schema.profiles)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp ?? null }),
        ...(data.location !== undefined && { location: data.location ?? null }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl ?? null }),
        ...(data.cvUrl !== undefined && { cvUrl: data.cvUrl ?? null }),
        ...(data.themeId !== undefined && { themeId: data.themeId ?? null }),
        updatedAt: now(),
      })
      .where(eq(schema.profiles.id, id))
      .returning();
    if (!result) throw new Error(`Profile ${id} not found`);
    return this.mapProfile(result);
  }

  async deleteProfile(id: string): Promise<void> {
    await db.delete(schema.profiles).where(eq(schema.profiles.id, id));
  }

  // ---------- Experience ----------
  async addExperience(exp: Omit<Experience, 'id'>): Promise<Experience> {
    const id = uuidv4();
    const [result] = await db
      .insert(schema.experiences)
      .values({
        id,
        profileId: exp.profileId,
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate ? exp.endDate.toISOString() : null,
        current: exp.current ? 1 : 0,
        description: exp.description,
        location: exp.location ?? null,
        videoUrl: exp.videoUrl ?? null,
        order: exp.order ?? 0,
        isExtra: exp.isExtra ? 1 : 0,
      })
      .returning();
    return this.mapExperience(result);
  }

  async updateExperience(id: string, data: Partial<Experience>): Promise<Experience> {
    const [result] = await db
      .update(schema.experiences)
      .set({
        ...(data.company !== undefined && { company: data.company }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.startDate !== undefined && { startDate: data.startDate.toISOString() }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? data.endDate.toISOString() : null }),
        ...(data.current !== undefined && { current: data.current ? 1 : 0 }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.location !== undefined && { location: data.location ?? null }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl ?? null }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isExtra !== undefined && { isExtra: data.isExtra ? 1 : 0 }),
      })
      .where(eq(schema.experiences.id, id))
      .returning();
    if (!result) throw new Error(`Experience ${id} not found`);
    return this.mapExperience(result);
  }

  async deleteExperience(id: string): Promise<void> {
    await db.delete(schema.experiences).where(eq(schema.experiences.id, id));
  }

  // ---------- Education ----------
  async addEducation(edu: Omit<Education, 'id'>): Promise<Education> {
    const id = uuidv4();
    const [result] = await db
      .insert(schema.education)
      .values({
        id,
        profileId: edu.profileId,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy ?? null,
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate ? edu.endDate.toISOString() : null,
        gpa: edu.gpa ?? null,
        description: edu.description ?? null,
        achievement: edu.achievement ?? null,
      })
      .returning();
    return this.mapEducation(result);
  }

  async updateEducation(id: string, data: Partial<Education>): Promise<Education> {
    const [result] = await db
      .update(schema.education)
      .set({
        ...(data.institution !== undefined && { institution: data.institution }),
        ...(data.degree !== undefined && { degree: data.degree }),
        ...(data.fieldOfStudy !== undefined && { fieldOfStudy: data.fieldOfStudy ?? null }),
        ...(data.startDate !== undefined && { startDate: data.startDate.toISOString() }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? data.endDate.toISOString() : null }),
        ...(data.gpa !== undefined && { gpa: data.gpa ?? null }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.achievement !== undefined && { achievement: data.achievement ?? null }),
      })
      .where(eq(schema.education.id, id))
      .returning();
    if (!result) throw new Error(`Education ${id} not found`);
    return this.mapEducation(result);
  }

  async deleteEducation(id: string): Promise<void> {
    await db.delete(schema.education).where(eq(schema.education.id, id));
  }

  // ---------- Project ----------
  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    const id = uuidv4();
    const tags = project.tags;
    const [result] = await db
      .insert(schema.projects)
      .values({
        id,
        profileId: project.profileId,
        name: project.name,
        description: project.description,
        url: project.url ?? null,
        repoUrl: project.repoUrl ?? null,
        imageUrl: project.imageUrl ?? null,
        featured: project.featured ? 1 : 0,
        createdAt: now(),
      })
      .returning();

    if (tags && tags.length > 0) {
      await db.insert(schema.projectTags).values(
        tags.map((tag) => ({ id: uuidv4(), projectId: id, tag }))
      );
    }

    return { ...this.mapProject(result), tags };
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const [result] = await db
      .update(schema.projects)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.url !== undefined && { url: data.url ?? null }),
        ...(data.repoUrl !== undefined && { repoUrl: data.repoUrl ?? null }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl ?? null }),
        ...(data.featured !== undefined && { featured: data.featured ? 1 : 0 }),
      })
      .where(eq(schema.projects.id, id))
      .returning();
    if (!result) throw new Error(`Project ${id} not found`);

    if (data.tags !== undefined) {
      await db.delete(schema.projectTags).where(eq(schema.projectTags.projectId, id));
      if (data.tags.length > 0) {
        await db.insert(schema.projectTags).values(
          data.tags.map((tag) => ({ id: uuidv4(), projectId: id, tag }))
        );
      }
    }

    const rows = await db
      .select()
      .from(schema.projectTags)
      .where(eq(schema.projectTags.projectId, id));
    return { ...this.mapProject(result), tags: rows.map((t) => t.tag) };
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
  }

  // ---------- Skill ----------
  async addSkill(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const id = uuidv4();
    const [result] = await db
      .insert(schema.skills)
      .values({
        id,
        profileId: skill.profileId,
        name: skill.name,
        category: skill.category,
        level: skill.level,
      })
      .returning();
    return this.mapSkill(result);
  }

  async updateSkill(id: string, data: Partial<Skill>): Promise<Skill> {
    const [result] = await db
      .update(schema.skills)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.level !== undefined && { level: data.level }),
      })
      .where(eq(schema.skills.id, id))
      .returning();
    if (!result) throw new Error(`Skill ${id} not found`);
    return this.mapSkill(result);
  }

  async deleteSkill(id: string): Promise<void> {
    await db.delete(schema.skills).where(eq(schema.skills.id, id));
  }

  // ---------- Social Link ----------
  async addSocialLink(link: Omit<SocialLink, 'id'>): Promise<SocialLink> {
    const id = uuidv4();
    const [result] = await db
      .insert(schema.socialLinks)
      .values({
        id,
        profileId: link.profileId,
        platform: link.platform,
        url: link.url,
        username: link.username ?? null,
      })
      .returning();
    return this.mapSocialLink(result);
  }

  async updateSocialLink(id: string, data: Partial<SocialLink>): Promise<SocialLink> {
    const [result] = await db
      .update(schema.socialLinks)
      .set({
        ...(data.platform !== undefined && { platform: data.platform }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.username !== undefined && { username: data.username ?? null }),
      })
      .where(eq(schema.socialLinks.id, id))
      .returning();
    if (!result) throw new Error(`Social link ${id} not found`);
    return this.mapSocialLink(result);
  }

  async deleteSocialLink(id: string): Promise<void> {
    await db.delete(schema.socialLinks).where(eq(schema.socialLinks.id, id));
  }

  // ---------- Contact Info ----------
  async addContactInfo(contact: Omit<ContactInfo, 'id'>): Promise<ContactInfo> {
    const id = uuidv4();
    const created = now();
    const [result] = await db
      .insert(schema.contactInfos)
      .values({
        id,
        profileId: contact.profileId,
        email: contact.email,
        phone: contact.phone ?? null,
        whatsapp: contact.whatsapp ?? null,
        location: contact.location ?? null,
        createdAt: created,
        updatedAt: created,
      })
      .returning();
    return this.mapContactInfo(result);
  }

  async getContactInfoByProfileId(profileId: string): Promise<ContactInfo | null> {
    const [result] = await db
      .select()
      .from(schema.contactInfos)
      .where(eq(schema.contactInfos.profileId, profileId));
    if (!result) return null;
    return this.mapContactInfo(result);
  }

  async updateContactInfo(id: string, data: Partial<ContactInfo>): Promise<ContactInfo> {
    const [result] = await db
      .update(schema.contactInfos)
      .set({
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone ?? null }),
        ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp ?? null }),
        ...(data.location !== undefined && { location: data.location ?? null }),
        updatedAt: now(),
      })
      .where(eq(schema.contactInfos.id, id))
      .returning();
    if (!result) throw new Error(`Contact info ${id} not found`);
    return this.mapContactInfo(result);
  }

  async deleteContactInfo(id: string): Promise<void> {
    await db.delete(schema.contactInfos).where(eq(schema.contactInfos.id, id));
  }

  // ---------- Full Portfolio ----------
  async getFullPortfolio(profileId: string): Promise<PortfolioData> {
    const profile = await this.getProfileById(profileId);
    if (!profile) throw new Error(`Profile ${profileId} not found`);

    const [experiences, education, projects, skills, socialLinks, contactInfo] =
      await Promise.all([
        db
          .select()
          .from(schema.experiences)
          .where(eq(schema.experiences.profileId, profileId))
          .orderBy(asc(schema.experiences.order), desc(schema.experiences.startDate)),
        db
          .select()
          .from(schema.education)
          .where(eq(schema.education.profileId, profileId))
          .orderBy(desc(schema.education.startDate)),
        db
          .select()
          .from(schema.projects)
          .where(eq(schema.projects.profileId, profileId))
          .orderBy(desc(schema.projects.createdAt)),
        db
          .select()
          .from(schema.skills)
          .where(eq(schema.skills.profileId, profileId))
          .orderBy(asc(schema.skills.category)),
        db
          .select()
          .from(schema.socialLinks)
          .where(eq(schema.socialLinks.profileId, profileId)),
        db
          .select()
          .from(schema.contactInfos)
          .where(eq(schema.contactInfos.profileId, profileId)),
      ]);

    const projectTagsMap = new Map<string, string[]>();
    for (const project of projects) {
      const tags = await db
        .select()
        .from(schema.projectTags)
        .where(eq(schema.projectTags.projectId, project.id));
      projectTagsMap.set(project.id, tags.map((t) => t.tag));
    }

    return {
      profile: this.mapProfile(profile),
      experiences: experiences.map((e) => this.mapExperience(e)),
      education: education.map((e) => this.mapEducation(e)),
      projects: projects.map((p) => ({
        ...this.mapProject(p),
        tags: projectTagsMap.get(p.id) || [],
      })),
      skills: skills.map((s) => this.mapSkill(s)),
      socialLinks: socialLinks.map((s) => this.mapSocialLink(s)),
      contactInfo: contactInfo.length > 0 ? this.mapContactInfo(contactInfo[0]) : null,
    };
  }

  // ---------- Mappers ----------
  private mapProfile(row: any): Profile {
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      bio: row.bio,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp,
      location: row.location,
      avatarUrl: row.avatarUrl,
      cvUrl: row.cvUrl,
      themeId: row.themeId,
      headerTitle: row.headerTitle,
      headerLogoUrl: row.headerLogoUrl,
      navLinks: row.navLinks ? (typeof row.navLinks === 'string' ? JSON.parse(row.navLinks) : row.navLinks) : undefined,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    };
  }

  private mapExperience(row: any): Experience {
    return {
      id: row.id,
      profileId: row.profileId,
      company: row.company,
      position: row.position,
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      current: Boolean(row.current),
      description: row.description,
      location: row.location,
      videoUrl: row.videoUrl,
      order: row.order,
      isExtra: Boolean(row.isExtra),
    };
  }

  private mapEducation(row: any): Education {
    return {
      id: row.id,
      profileId: row.profileId,
      institution: row.institution,
      degree: row.degree,
      fieldOfStudy: row.fieldOfStudy,
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : undefined,
      gpa: row.gpa,
      description: row.description,
      achievement: row.achievement,
    };
  }

  private mapProject(row: any): Project {
    return {
      id: row.id,
      profileId: row.profileId,
      name: row.name,
      description: row.description,
      url: row.url,
      repoUrl: row.repoUrl,
      imageUrl: row.imageUrl,
      tags: [],
      featured: Boolean(row.featured),
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
    };
  }

  private mapSkill(row: any): Skill {
    return {
      id: row.id,
      profileId: row.profileId,
      name: row.name,
      category: row.category,
      level: row.level,
    };
  }

  private mapSocialLink(row: any): SocialLink {
    return {
      id: row.id,
      profileId: row.profileId,
      platform: row.platform,
      url: row.url,
      username: row.username,
    };
  }

  private mapContactInfo(row: any): ContactInfo {
    return {
      id: row.id,
      profileId: row.profileId,
      email: row.email,
      phone: row.phone,
      whatsapp: row.whatsapp,
      location: row.location,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    };
  }
}
