import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseEnabled } from './firebase';
import type { Project, ProjectInput } from '@/types/project';
import type { Skill, SkillInput } from '@/types/skill';
import type { Experience, ExperienceInput } from '@/types/experience';

// Collection names
export const COLLECTIONS = {
  PROJECTS: 'projects',
  SKILLS: 'skills',
  EXPERIENCES: 'experiences',
  PORTFOLIO_CONFIG: 'portfolio_config',
  ANALYTICS: 'analytics',
} as const;

// Base data service class
class FirebaseDataService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = isFirebaseEnabled && !!db;
    if (!this.isEnabled) {
      console.warn('🔥 Firebase not enabled - using local mock data');
    }
  }

  // Generic CRUD operations
  async create<T extends DocumentData>(
    collectionName: string,
    data: T
  ): Promise<string> {
    if (!this.isEnabled || !db) {
      throw new Error('Firebase not available');
    }

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Created document in ${collectionName}:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error(`❌ Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async read<T>(collectionName: string, docId: string): Promise<T | null> {
    if (!this.isEnabled || !db) {
      return null;
    }

    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`❌ Error reading document from ${collectionName}:`, error);
      return null;
    }
  }

  async readAll<T>(
    collectionName: string,
    orderByField = 'createdAt',
    limitCount?: number
  ): Promise<T[]> {
    if (!this.isEnabled || !db) {
      return [];
    }

    try {
      let q = query(
        collection(db, collectionName),
        orderBy(orderByField, 'desc')
      );

      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const results: T[] = [];

      querySnapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });

      console.log(`✅ Read ${results.length} documents from ${collectionName}`);
      return results;
    } catch (error) {
      console.error(
        `❌ Error reading documents from ${collectionName}:`,
        error
      );
      return [];
    }
  }

  async update<T extends Partial<DocumentData>>(
    collectionName: string,
    docId: string,
    data: T
  ): Promise<void> {
    if (!this.isEnabled || !db) {
      throw new Error('Firebase not available');
    }

    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log(`✅ Updated document in ${collectionName}:`, docId);
    } catch (error) {
      console.error(`❌ Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async delete(collectionName: string, docId: string): Promise<void> {
    if (!this.isEnabled || !db) {
      throw new Error('Firebase not available');
    }

    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`✅ Deleted document from ${collectionName}:`, docId);
    } catch (error) {
      console.error(
        `❌ Error deleting document from ${collectionName}:`,
        error
      );
      throw error;
    }
  }

  // Real-time subscription
  subscribe<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    orderByField = 'createdAt'
  ): Unsubscribe | null {
    if (!this.isEnabled || !db) {
      return null;
    }

    const q = query(
      collection(db, collectionName),
      orderBy(orderByField, 'desc')
    );

    return onSnapshot(
      q,
      snapshot => {
        const results: T[] = [];
        snapshot.forEach(doc => {
          results.push({ id: doc.id, ...doc.data() } as T);
        });
        callback(results);
      },
      error => {
        console.error(`❌ Error in subscription for ${collectionName}:`, error);
      }
    );
  }

  // Batch operations
  async batchUpdate<T extends Record<string, any>>(
    collectionName: string,
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<void> {
    if (!this.isEnabled || !db) {
      throw new Error('Firebase not available');
    }

    try {
      const batch = writeBatch(db);

      updates.forEach(({ id, data }) => {
        const docRef = doc(db, collectionName, id);
        batch.update(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      console.log(
        `✅ Batch updated ${updates.length} documents in ${collectionName}`
      );
    } catch (error) {
      console.error(`❌ Error in batch update for ${collectionName}:`, error);
      throw error;
    }
  }

  // Advanced queries
  async query<T>(
    collectionName: string,
    filters: Array<{ field: string; operator: any; value: any }> = [],
    orderByField = 'createdAt',
    limitCount?: number
  ): Promise<T[]> {
    if (!this.isEnabled || !db) {
      return [];
    }

    try {
      let q = query(collection(db, collectionName));

      // Apply filters
      filters.forEach(({ field, operator, value }) => {
        q = query(q, where(field, operator, value));
      });

      // Apply ordering
      q = query(q, orderBy(orderByField, 'desc'));

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const results: T[] = [];

      querySnapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });

      return results;
    } catch (error) {
      console.error(`❌ Error in advanced query for ${collectionName}:`, error);
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled || !db) {
      return false;
    }

    try {
      // Try to read a document to test connection
      const testQuery = query(
        collection(db, COLLECTIONS.PORTFOLIO_CONFIG),
        limit(1)
      );
      await getDocs(testQuery);
      return true;
    } catch (error) {
      console.error('❌ Firebase health check failed:', error);
      return false;
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.isEnabled;
  }
}

// Specialized service classes
export class ProjectService extends FirebaseDataService {
  async createProject(projectData: ProjectInput): Promise<string> {
    return this.create(COLLECTIONS.PROJECTS, projectData);
  }

  async getProject(id: string): Promise<Project | null> {
    return this.read<Project>(COLLECTIONS.PROJECTS, id);
  }

  async getAllProjects(): Promise<Project[]> {
    return this.readAll<Project>(COLLECTIONS.PROJECTS, 'priority');
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return this.query<Project>(
      COLLECTIONS.PROJECTS,
      [{ field: 'featured', operator: '==', value: true }],
      'priority',
      6
    );
  }

  async updateProject(id: string, data: Partial<ProjectInput>): Promise<void> {
    return this.update(COLLECTIONS.PROJECTS, id, data);
  }

  async deleteProject(id: string): Promise<void> {
    return this.delete(COLLECTIONS.PROJECTS, id);
  }

  subscribeToProjects(
    callback: (projects: Project[]) => void
  ): Unsubscribe | null {
    return this.subscribe<Project>(COLLECTIONS.PROJECTS, callback, 'priority');
  }
}

export class SkillService extends FirebaseDataService {
  async createSkill(skillData: SkillInput): Promise<string> {
    return this.create(COLLECTIONS.SKILLS, skillData);
  }

  async getSkill(id: string): Promise<Skill | null> {
    return this.read<Skill>(COLLECTIONS.SKILLS, id);
  }

  async getAllSkills(): Promise<Skill[]> {
    return this.readAll<Skill>(COLLECTIONS.SKILLS, 'level');
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return this.query<Skill>(
      COLLECTIONS.SKILLS,
      [{ field: 'category', operator: '==', value: category }],
      'level'
    );
  }

  async updateSkill(id: string, data: Partial<SkillInput>): Promise<void> {
    return this.update(COLLECTIONS.SKILLS, id, data);
  }

  async deleteSkill(id: string): Promise<void> {
    return this.delete(COLLECTIONS.SKILLS, id);
  }

  subscribeToSkills(callback: (skills: Skill[]) => void): Unsubscribe | null {
    return this.subscribe<Skill>(COLLECTIONS.SKILLS, callback, 'level');
  }
}

export class ExperienceService extends FirebaseDataService {
  async createExperience(experienceData: ExperienceInput): Promise<string> {
    return this.create(COLLECTIONS.EXPERIENCES, experienceData);
  }

  async getExperience(id: string): Promise<Experience | null> {
    return this.read<Experience>(COLLECTIONS.EXPERIENCES, id);
  }

  async getAllExperiences(): Promise<Experience[]> {
    return this.readAll<Experience>(COLLECTIONS.EXPERIENCES, 'startDate');
  }

  async updateExperience(
    id: string,
    data: Partial<ExperienceInput>
  ): Promise<void> {
    return this.update(COLLECTIONS.EXPERIENCES, id, data);
  }

  async deleteExperience(id: string): Promise<void> {
    return this.delete(COLLECTIONS.EXPERIENCES, id);
  }

  subscribeToExperiences(
    callback: (experiences: Experience[]) => void
  ): Unsubscribe | null {
    return this.subscribe<Experience>(
      COLLECTIONS.EXPERIENCES,
      callback,
      'startDate'
    );
  }
}

// Service instances
export const projectService = new ProjectService();
export const skillService = new SkillService();
export const experienceService = new ExperienceService();
export const dataService = new FirebaseDataService();

// Export default instance
export default dataService;
