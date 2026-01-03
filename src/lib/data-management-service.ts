import { Project, ProjectInput } from "@/hooks/useProjects";
import { Skill, SkillInput } from "@/hooks/useSkills";
import { firebaseService } from "./services/firebaseService";

/**
 * Optimized data management service for portfolio data
 */
export class PortfolioDataManager {
  /**
   * Get all projects with optimized data fetching
   */
  static async getProjects(): Promise<Project[]> {
    try {
      return await firebaseService.getProjects() as unknown as Project[];
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  /**
   * Create a new project with validation and error handling
   */
  static async createProject(projectData: Omit<ProjectInput, "id">): Promise<string> {
    try {
      const id = await firebaseService.createProject(projectData);
      console.log(`✅ Project created with ID: ${id}`);
      return id;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, updates: Partial<ProjectInput>): Promise<void> {
    try {
      await firebaseService.updateProject(id, updates);
      console.log(`✅ Project ${id} updated successfully`);
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  /**
   * Delete a project by ID
   */
  static async deleteProject(id: string): Promise<void> {
    try {
      await firebaseService.deleteProject(id);
      console.log(`✅ Project ${id} deleted successfully`);
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  /**
   * Get all skills with optimized data fetching
   */
  static async getSkills(): Promise<Skill[]> {
    try {
      // Using direct Firestore calls since there's no firebaseService method for skills
      const { db } = await import("./firebase");
      const { collection, query, orderBy, getDocs, where } = await import("firebase/firestore");
      
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const q = query(
        collection(db, "skills"),
        where("disabled", "==", false),
        orderBy("priority", "desc"),
        orderBy("level", "desc")
      );

      const querySnapshot = await getDocs(q);
      const skills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Skill[];

      return skills;
    } catch (error) {
      console.error("Error fetching skills:", error);
      throw error;
    }
  }

  /**
   * Create a new skill with validation and error handling
   */
  static async createSkill(skillData: Omit<SkillInput, "id">): Promise<string> {
    try {
      const { db } = await import("./firebase");
      const { collection, addDoc } = await import("firebase/firestore");
      
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const docRef = await addDoc(collection(db, "skills"), {
        ...skillData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      console.log(`✅ Skill created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error("Error creating skill:", error);
      throw error;
    }
  }

  /**
   * Update an existing skill
   */
  static async updateSkill(id: string, updates: Partial<SkillInput>): Promise<void> {
    try {
      const { db } = await import("./firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const docRef = doc(db, "skills", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Date.now()
      });

      console.log(`✅ Skill ${id} updated successfully`);
    } catch (error) {
      console.error("Error updating skill:", error);
      throw error;
    }
  }

  /**
   * Delete a skill by ID
   */
  static async deleteSkill(id: string): Promise<void> {
    try {
      const { db } = await import("./firebase");
      const { doc, deleteDoc } = await import("firebase/firestore");
      
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const docRef = doc(db, "skills", id);
      await deleteDoc(docRef);

      console.log(`✅ Skill ${id} deleted successfully`);
    } catch (error) {
      console.error("Error deleting skill:", error);
      throw error;
    }
  }

  /**
   * Batch delete multiple projects
   */
  static async batchDeleteProjects(ids: string[]): Promise<void> {
    try {
      const { db } = await import("./firebase");
      const { doc, deleteDoc, writeBatch } = await import("firebase/firestore");
      
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, "projects", id));
      });
      
      await batch.commit();
      console.log(`✅ Batch deleted ${ids.length} projects successfully`);
    } catch (error) {
      console.error("Error batch deleting projects:", error);
      throw error;
    }
  }

  /**
   * Batch delete multiple skills
   */
  static async batchDeleteSkills(ids: string[]): Promise<void> {
    try {
      const { db } = await import("./firebase");
      const { doc, deleteDoc, writeBatch } = await import("firebase/firestore");
      
      if (!db) {
        throw new Error("Firebase is not initialized");
      }

      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, "skills", id));
      });
      
      await batch.commit();
      console.log(`✅ Batch deleted ${ids.length} skills successfully`);
    } catch (error) {
      console.error("Error batch deleting skills:", error);
      throw error;
    }
  }

  /**
   * Validate project data before saving
   */
  static validateProjectData(project: Partial<ProjectInput>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!project.title || project.title.trim().length === 0) {
      errors.push("Title is required");
    } else if (project.title.length > 100) {
      errors.push("Title must be less than 100 characters");
    }

    if (!project.description || project.description.trim().length === 0) {
      errors.push("Description is required");
    } else if (project.description.length > 300) {
      errors.push("Description must be less than 300 characters");
    }

    if (!project.category) {
      errors.push("Category is required");
    }

    if (project.priority !== undefined && (project.priority < 0 || project.priority > 100)) {
      errors.push("Priority must be between 0 and 100");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate skill data before saving
   */
  static validateSkillData(skill: Partial<SkillInput>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!skill.name || skill.name.trim().length === 0) {
      errors.push("Skill name is required");
    } else if (skill.name.length > 50) {
      errors.push("Skill name must be less than 50 characters");
    }

    if (!skill.category) {
      errors.push("Category is required");
    }

    if (skill.level !== undefined && (skill.level < 0 || skill.level > 100)) {
      errors.push("Level must be between 0 and 100");
    }

    if (skill.priority !== undefined && (skill.priority < 0 || skill.priority > 100)) {
      errors.push("Priority must be between 0 and 100");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}