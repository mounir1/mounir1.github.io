/**
 * Firebase Admin Services
 * Handles Firestore operations for portfolio content management
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  WriteBatch,
  writeBatch,
  type Firestore,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Guard function to ensure Firebase is initialized
const firebaseDb = (): Firestore => {
  if (!db) {
    throw new Error(
      "Firebase is not initialized. Please configure your Firebase credentials in environment variables."
    );
  }
  return db as Firestore;
};

// Types for Firestore collections
export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  technologies: string[];
  image?: string;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metrics?: {
    [key: string]: string;
  };
  clientInfo?: {
    name: string;
    website?: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "editor";
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  permissions: string[];
}

export interface AnalyticsData {
  id: string;
  timestamp: Timestamp;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: { page: string; views: number }[];
}

// ============================================
// PROJECT OPERATIONS
// ============================================

export const projectService = {
  /**
   * Fetch all projects
   */
  async getAll(): Promise<PortfolioProject[]> {
    try {
      const projectsRef = collection(firebaseDb(), "projects");
      const q = query(projectsRef, orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as PortfolioProject));
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  /**
   * Fetch featured projects only
   */
  async getFeatured(): Promise<PortfolioProject[]> {
    try {
      const projectsRef = collection(firebaseDb(), "projects");
      const q = query(
        projectsRef,
        where("featured", "==", true),
        orderBy("updatedAt", "desc"),
        limit(6)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as PortfolioProject));
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      throw error;
    }
  },

  /**
   * Get single project by ID
   */
  async getById(projectId: string): Promise<PortfolioProject | null> {
    try {
      const docRef = doc(firebaseDb(), "projects", projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as PortfolioProject;
      }
      return null;
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  },

  /**
   * Create new project
   */
  async create(project: Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const projectsRef = collection(firebaseDb(), "projects");
      const docRef = doc(projectsRef);
      await setDoc(docRef, {
        ...project,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  /**
   * Update project
   */
  async update(projectId: string, updates: Partial<PortfolioProject>): Promise<void> {
    try {
      const docRef = doc(firebaseDb(), "projects", projectId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  /**
   * Delete project
   */
  async delete(projectId: string): Promise<void> {
    try {
      const docRef = doc(firebaseDb(), "projects", projectId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  /**
   * Batch update projects
   */
  async batchUpdate(updates: { id: string; data: Partial<PortfolioProject> }[]): Promise<void> {
    try {
      const batch: WriteBatch = writeBatch(firebaseDb());
      updates.forEach(({ id, data }) => {
        const docRef = doc(firebaseDb(), "projects", id);
        batch.update(docRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error batch updating projects:", error);
      throw error;
    }
  },
};

// ============================================
// ANALYTICS OPERATIONS
// ============================================

export const analyticsService = {
  /**
   * Get latest analytics data
   */
  async getLatest(): Promise<AnalyticsData | null> {
    try {
      const analyticsRef = collection(firebaseDb(), "analytics");
      const q = query(analyticsRef, orderBy("timestamp", "desc"), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as AnalyticsData;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  },

  /**
   * Get analytics for date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<AnalyticsData[]> {
    try {
      const analyticsRef = collection(firebaseDb(), "analytics");
      const q = query(
        analyticsRef,
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate)),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as AnalyticsData));
    } catch (error) {
      console.error("Error fetching analytics by date range:", error);
      throw error;
    }
  },

  /**
   * Save analytics data
   */
  async save(data: Omit<AnalyticsData, "id">): Promise<string> {
    try {
      const analyticsRef = collection(firebaseDb(), "analytics");
      const docRef = doc(analyticsRef);
      await setDoc(docRef, data);
      return docRef.id;
    } catch (error) {
      console.error("Error saving analytics:", error);
      throw error;
    }
  },
};

// ============================================
// ADMIN USER OPERATIONS
// ============================================

export const adminUserService = {
  /**
   * Get all admin users
   */
  async getAll(): Promise<AdminUser[]> {
    try {
      const usersRef = collection(firebaseDb(), "adminUsers");
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as AdminUser));
    } catch (error) {
      console.error("Error fetching admin users:", error);
      throw error;
    }
  },

  /**
   * Get admin user by ID
   */
  async getById(userId: string): Promise<AdminUser | null> {
    try {
      const docRef = doc(firebaseDb(), "adminUsers", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as AdminUser;
      }
      return null;
    } catch (error) {
      console.error("Error fetching admin user:", error);
      throw error;
    }
  },

  /**
   * Create admin user
   */
  async create(user: Omit<AdminUser, "id" | "createdAt">): Promise<string> {
    try {
      const usersRef = collection(firebaseDb(), "adminUsers");
      const docRef = doc(usersRef);
      await setDoc(docRef, {
        ...user,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  },

  /**
   * Update admin user
   */
  async update(userId: string, updates: Partial<AdminUser>): Promise<void> {
    try {
      const docRef = doc(firebaseDb(), "adminUsers", userId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating admin user:", error);
      throw error;
    }
  },

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const docRef = doc(firebaseDb(), "adminUsers", userId);
      await updateDoc(docRef, {
        lastLogin: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating last login:", error);
      throw error;
    }
  },
};

// ============================================
// CONTENT OPERATIONS
// ============================================

export const contentService = {
  /**
   * Get portfolio metadata
   */
  async getMetadata(): Promise<Record<string, unknown>> {
    try {
      const docRef = doc(firebaseDb(), "content", "metadata");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return {};
    } catch (error) {
      console.error("Error fetching metadata:", error);
      throw error;
    }
  },

  /**
   * Update portfolio metadata
   */
  async updateMetadata(data: Record<string, unknown>): Promise<void> {
    try {
      const docRef = doc(firebaseDb(), "content", "metadata");
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating metadata:", error);
      throw error;
    }
  },

  /**
   * Get all content documents
   */
  async getAll(collectionName: string): Promise<Array<Record<string, unknown>>> {
    try {
      const ref = collection(firebaseDb(), collectionName);
      const snapshot = await getDocs(ref);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Set document
   */
  async setDocument(collectionName: string, docId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const docRef = doc(firebaseDb(), collectionName, docId);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(firebaseDb(), collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },
};
