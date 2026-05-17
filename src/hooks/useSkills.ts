import { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { initialSkills } from "@/data/initial-skills";

export type SkillCategory =
  | "Frontend Development"
  | "Backend Development"
  | "Database"
  | "Cloud & DevOps"
  | "Mobile Development"
  | "Machine Learning"
  | "Design"
  | "Project Management"
  | "Languages"
  | "Frameworks"
  | "Testing"
  | "Tools"
  | "ERP Solutions"
  | "Retail Solutions"
  | "E-commerce"
  | "Hospitality Solutions"
  | "LMS & Education"
  | "Other";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number; // 1-100
  yearsOfExperience: number;
  description?: string;
  certifications?: string[];
  projects?: string[];
  icon?: string;
  color?: string;
  featured: boolean;
  disabled: boolean;
  priority: number;
  trending?: boolean;
  languageLevel?: string;
  createdAt: number;
  updatedAt: number;
}

export type SkillInput = Omit<Skill, "id">;

export const SKILLS_COLLECTION = "skills";

export function useSkills(adminMode = false) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      console.log('Using local skills data - Firebase disabled in development');
      const localSkills: Skill[] = initialSkills.map((skill, index) => ({
        id: `local-skill-${index}`,
        ...skill
      }));
      setSkills(adminMode ? localSkills : localSkills.filter(s => !s.disabled));
      setLoading(false);
      setError(null);
      return;
    }

    const q = adminMode
      ? query(collection(db, SKILLS_COLLECTION), orderBy("priority", "desc"), orderBy("level", "desc"))
      : query(collection(db, SKILLS_COLLECTION), where("disabled", "==", false), orderBy("priority", "desc"), orderBy("level", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const skillsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Skill[];
        setSkills(skillsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching skills from Firebase:", err);
        const localSkills: Skill[] = initialSkills.map((skill, index) => ({
          id: `fallback-skill-${index}`,
          ...skill
        }));
        setSkills(adminMode ? localSkills : localSkills.filter(s => !s.disabled));
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [adminMode]);

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

  return {
    skills,
    skillsByCategory,
    featuredSkills,
    loading,
    error
  };
}