import { useEffect, useState } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export type AvailabilityStatus = "available" | "limited" | "busy" | "unavailable";

export interface HeroStats {
  yearsExperience: number;
  projectsCompleted: number;
  usersServed: string;
  clientSatisfaction: string;
}

export interface SiteSettings {
  personalInfo: {
    name: string;
    title: string;
    bio: string;
    tagline?: string;
    email: string;
    phone?: string;
    location: string;
    profilePhoto?: string;
    resumeUrl?: string;
    availability: AvailabilityStatus;
    availabilityNote?: string;
    openToWork: boolean;
    remoteOnly: boolean;
    typingWords?: string[];
    currentlyBuilding?: string;
    openSourceModules?: string;
  };
  social: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    youtube?: string;
    devto?: string;
    medium?: string;
    stackoverflow?: string;
  };
  heroStats: HeroStats;
  seo: {
    siteTitle: string;
    siteDescription: string;
    keywords: string[];
    twitterHandle?: string;
    googleAnalyticsId?: string;
  };
  features: {
    showBlog: boolean;
    showTestimonials: boolean;
    showServices: boolean;
    showEducation: boolean;
    showCertifications: boolean;
    showContactForm: boolean;
    showAvailabilityBanner: boolean;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };
  updatedAt: number;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  personalInfo: {
    name: "Mounir Abderrahmani",
    title: "Senior Full-Stack Developer & Software Architect",
    bio: "Transforming complex business challenges into elegant digital solutions. Specialized in React, Node.js, and enterprise integrations with a proven track record of delivering scalable systems that drive measurable business growth.",
    tagline: "Building the future, one commit at a time.",
    email: "mounir.webdev@gmail.com",
    phone: "+213 674 09 48 55",
    location: "Algeria • Remote",
    profilePhoto: "/profile.webp",
    resumeUrl: "/Mounir_CV_2025.pdf",
    availability: "available",
    availabilityNote: "Open to remote contracts and full-time opportunities",
    openToWork: true,
    remoteOnly: false,
    typingWords: ["Full-Stack Developer", "Magento Expert", "ERP Integrator", "AI Solutions Builder"],
    currentlyBuilding: "AI Ops Dashboard",
    openSourceModules: "15+",
  },
  social: {
    linkedin: "https://linkedin.com/in/mounir1badi",
    github: "https://github.com/mounir1",
  },
  heroStats: {
    yearsExperience: 10,
    projectsCompleted: 150,
    usersServed: "10K+",
    clientSatisfaction: "98%",
  },
  seo: {
    siteTitle: "Mounir Abderrahmani — Senior Full-Stack Developer",
    siteDescription: "Portfolio of Mounir Abderrahmani. 10+ years building enterprise solutions, web apps, and e-commerce platforms.",
    keywords: ["full-stack developer", "react developer", "node.js", "enterprise integration", "algeria"],
  },
  features: {
    showBlog: false,
    showTestimonials: true,
    showServices: false,
    showEducation: false,
    showCertifications: false,
    showContactForm: true,
    showAvailabilityBanner: true,
    maintenanceMode: false,
  },
  updatedAt: Date.now(),
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      setLoading(false);
      return;
    }
    const ref = doc(db, "settings", "site");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...(snap.data() as SiteSettings) });
      }
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const saveSettings = async (data: Partial<SiteSettings>) => {
    if (!isFirebaseEnabled || !db) return;
    await setDoc(doc(db, "settings", "site"), { ...settings, ...data, updatedAt: Date.now() }, { merge: true });
  };

  return { settings, loading, saveSettings };
}
