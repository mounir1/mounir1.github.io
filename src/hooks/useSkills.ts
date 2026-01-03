import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, query, orderBy, onSnapshot, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { initialSkills } from "@/data/initial-skills";
import type { Skill, SkillInput } from "@/lib/schema/skillSchema";
import { SkillCategory } from "@/lib/schema/types";

export { SkillCategory };
export type { Skill, SkillInput };

export const SKILLS_COLLECTION = "skills";

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  const setupFirebaseListener = useCallback(() => {
    let unsubscribe: (() => void) | undefined;
    let retryTimeout: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    // Use local data when Firebase is not enabled (development mode) or offline
    if (!isFirebaseEnabled || !db || !isOnline) {
      console.log('Using local skills data - Firebase disabled or offline');
      const localSkills: Skill[] = initialSkills.map((skill, index) => ({
        id: `local-skill-${index}`,
        ...skill
      }));
      setSkills(localSkills);
      setLoading(false);
      setError(null);
      return;
    }

    // Enhanced Firebase query with better error handling
    try {
      const q = query(
        collection(db, SKILLS_COLLECTION),
        where("disabled", "==", false),
        orderBy("priority", "desc"),
        orderBy("level", "desc")
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          try {
            const skillsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Skill[];

            // Validate and sanitize data
            const validSkills = skillsData.filter(skill =>
              skill.name && skill.category && skill.level !== undefined
            );

            // Deduplicate by normalized name + category
            const seen = new Set<string>();
            const deduped: Skill[] = [];
            for (const s of validSkills) {
              const key = `${s.name.trim().toLowerCase()}::${(s.category || '').toString().trim().toLowerCase()}`;
              if (!seen.has(key)) {
                seen.add(key);
                deduped.push(s);
              }
            }

            // Sort: featured (if present) then priority desc then level desc
            deduped.sort((a, b) => {
              const af = (a as any).featured ? 1 : 0;
              const bf = (b as any).featured ? 1 : 0;
              if (bf !== af) return bf - af;
              const ap = typeof (a as any).priority === 'number' ? (a as any).priority : 0;
              const bp = typeof (b as any).priority === 'number' ? (b as any).priority : 0;
              if (bp !== ap) return bp - ap;
              return (b.level || 0) - (a.level || 0);
            });

            setSkills(deduped);
            setLoading(false);
            setError(null);
            retryCount = 0; // Reset retry count on success
            console.log(`✅ Loaded ${validSkills.length} skills from Firebase`);
          } catch (processingError) {
            console.error("Error processing Firebase data:", processingError);
            setError("Error processing skill data");
          }
        },
        (err) => {
          console.error("Firebase listener error:", err);
          const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";

          // Implement retry logic for transient errors
          if (retryCount < maxRetries && (
            errorMessage.includes('network') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('unavailable')
          )) {
            retryCount++;
            console.log(`🔄 Retrying Firebase connection (attempt ${retryCount}/${maxRetries})`);
            retryTimeout = setTimeout(() => {
              setupFirebaseListener();
            }, retryDelay * retryCount); // Exponential backoff
            return;
          }

          setError(`Failed to load skills: ${errorMessage}. Showing local data instead.`);
          console.log('Falling back to local skills data due to Firebase error');

          // Fallback to local data on Firebase error
          const localSkills: Skill[] = initialSkills.map((skill, index) => ({
            id: `fallback-skill-${index}`,
            ...skill
          }));
          // Deduplicate and sort local fallback
          const seen = new Set<string>();
          const deduped: Skill[] = [];
          for (const s of localSkills) {
            const key = `${s.name.trim().toLowerCase()}::${(s.category || '').toString().trim().toLowerCase()}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(s);
            }
          }
          deduped.sort((a, b) => {
            const af = (a as any).featured ? 1 : 0;
            const bf = (b as any).featured ? 1 : 0;
            if (bf !== af) return bf - af;
            const ap = typeof (a as any).priority === 'number' ? (a as any).priority : 0;
            const bp = typeof (b as any).priority === 'number' ? (b as any).priority : 0;
            if (bp !== ap) return bp - ap;
            return (b.level || 0) - (a.level || 0);
          });
          setSkills(deduped);
          setLoading(false);
        }
      );
    } catch (setupError) {
      console.error("Error setting up Firebase listener:", setupError);
      setError("Failed to initialize data connection");
      // Fallback to local data
      const localSkills: Skill[] = initialSkills.map((skill, index) => ({
        id: `setup-fallback-skill-${index}`,
        ...skill
      }));
      setSkills(localSkills);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [isOnline]);

  useEffect(() => {
    const cleanup = setupFirebaseListener();
    return cleanup;
  }, [setupFirebaseListener]);

  const skillsByCategory = useMemo(() => {
    const grouped = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<SkillCategory, Skill[]>);

    // Sort skills within each category by level
    Object.keys(grouped).forEach(category => {
      grouped[category as SkillCategory].sort((a, b) => b.level - a.level);
    });

    return grouped;
  }, [skills]);

  const featuredSkills = useMemo(() =>
    skills.filter(skill => skill.featured && !skill.disabled)
    , [skills]);

  // Enhanced CRUD Operations with better error handling
  const addSkill = useCallback(async (skillData: SkillInput) => {
    if (!isFirebaseEnabled || !db) {
      console.log("Firebase not enabled, cannot add skill");
      throw new Error("Firebase is not configured. Please check your environment settings.");
    }

    try {
      const docRef = await addDoc(collection(db, SKILLS_COLLECTION), {
        ...skillData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      console.log(`✅ Skill added to Firebase with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error("Error adding skill:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to add skill: ${errorMessage}. Please try again.`);
    }
  }, []);

  const updateSkill = useCallback(async (id: string, updates: Partial<SkillInput>) => {
    if (!isFirebaseEnabled || !db) {
      console.log("Firebase not enabled, cannot update skill");
      throw new Error("Firebase is not configured. Please check your environment settings.");
    }

    // Check if this is a fallback/local ID that doesn't exist in Firebase
    if (id.startsWith('fallback-') || id.startsWith('local-') || id.startsWith('setup-fallback-')) {
      console.log("Cannot update local/fallback skill in Firebase. Please add as new skill.");
      throw new Error("Cannot update local/demo skill. Please create a new skill instead.");
    }

    try {
      await updateDoc(doc(db, SKILLS_COLLECTION, id), {
        ...updates,
        updatedAt: Date.now()
      });
      console.log(`✅ Skill ${id} updated in Firebase`);
    } catch (error) {
      console.error("Error updating skill:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      // Provide specific error guidance
      let userMessage = `Failed to update skill: ${errorMessage}. Please try again.`;
      if (errorMessage.includes('permission')) {
        userMessage = "You don't have permission to update this skill. Please check your access rights.";
      } else if (errorMessage.includes('network')) {
        userMessage = "Network error. Please check your internet connection and try again.";
      } else if (errorMessage.includes('not-found')) {
        userMessage = "Skill not found. It may have been deleted.";
      }
      throw new Error(userMessage);
    }
  }, []);

  const deleteSkill = useCallback(async (id: string) => {
    if (!isFirebaseEnabled || !db) {
      console.log("Firebase not enabled, cannot delete skill");
      throw new Error("Firebase is not configured. Please check your environment settings.");
    }

    // Check if this is a fallback/local ID that doesn't exist in Firebase
    if (id.startsWith('fallback-') || id.startsWith('local-') || id.startsWith('setup-fallback-')) {
      console.log("Cannot delete local/fallback skill from Firebase.");
      throw new Error("Cannot delete local/demo skill.");
    }

    try {
      await deleteDoc(doc(db, SKILLS_COLLECTION, id));
      console.log(`✅ Skill ${id} deleted from Firebase`);
    } catch (error) {
      console.error("Error deleting skill:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      // Provide specific error guidance
      let userMessage = `Failed to delete skill: ${errorMessage}. Please try again.`;
      if (errorMessage.includes('permission')) {
        userMessage = "You don't have permission to delete this skill. Please check your access rights.";
      } else if (errorMessage.includes('network')) {
        userMessage = "Network error. Please check your internet connection and try again.";
      } else if (errorMessage.includes('not-found')) {
        userMessage = "Skill not found. It may have already been deleted.";
      }
      throw new Error(userMessage);
    }
  }, []);

  const getStats = useCallback(() => {
    return {
      total: skills.length,
      featured: skills.filter(s => s.featured).length,
      categories: Object.keys(skillsByCategory).length,
      averageLevel: skills.length > 0 ? Math.round(skills.reduce((sum, s) => sum + s.level, 0) / skills.length) : 0
    };
  }, [skills, skillsByCategory]);

  return {
    skills,
    skillsByCategory,
    featuredSkills,
    loading,
    error,
    addSkill,
    updateSkill,
    deleteSkill,
    getStats,
    isOnline,
    refetch: setupFirebaseListener,
  };
}