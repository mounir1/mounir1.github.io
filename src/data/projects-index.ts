/**
 * PROJECTS INDEX — Registry linking C:\projects directories to portfolio slugs.
 *
 * This is the single source of truth mapping on-disk project directories
 * (under C:\projects) to their canonical portfolio slugs. Every project
 * entry in initial-projects.ts SHOULD have a corresponding entry here.
 *
 * Structure:
 *   slug        → unique identifier used in portfolio seed data
 *   diskPath    → relative path under C:\projects
 *   type        → "client" | "personal" | "contract"
 *   status      → "active" | "maintenance" | "archived" | "idea"
 *   importance  → "core" | "supporting" | "legacy"
 *
 * ─── Usage ──────────────────────────────────────────────────────────────
 * import { projectsIndex } from "@/data/projects-index";
 * const entry = projectsIndex["nava-pms"];
 * // entry.diskPath === "Hotech/navapms"
 * // entry.type === "contract"
 *
 * ─── Data Policy ─────────────────────────────────────────────────────────
 * Every entry represents a REAL project on disk at C:\projects.
 * Do NOT add projects that do not exist on disk or are not verifiable.
 */

export type ProjectDiskType = "client" | "personal" | "contract";
export type ProjectDiskStatus = "active" | "maintenance" | "archived" | "idea";
export type ProjectImportance = "core" | "supporting" | "legacy";

export interface ProjectDiskEntry {
  slug: string;
  title: string;
  diskPath: string;
  type: ProjectDiskType;
  status: ProjectDiskStatus;
  importance: ProjectImportance;
  description: string;
}

export const projectsIndex: Record<string, ProjectDiskEntry> = {
  // ── CORE — Active daily work ──────────────────────────────────────────
  "nava-pms": {
    slug: "nava-pms",
    title: "Nava PMS — Hospitality Property Management Front-End",
    diskPath: "Hotech/navapms",
    type: "contract",
    status: "active",
    importance: "core",
    description: "React + TypeScript PMS front-end for OREST hospitality backend",
  },
  "mab-modules": {
    slug: "mab-modules",
    title: "MAB Modules Suite — 28 Magento 2 Extensions for Algeria",
    diskPath: "Mab Project/mab-modules",
    type: "personal",
    status: "active",
    importance: "core",
    description: "Magento 2 extensions for Algerian e-commerce",
  },
  "technostationery": {
    slug: "technostationery",
    title: "TechnoStationery.com — Production Magento 2 Store",
    diskPath: "TECHNO/techno-magento",
    type: "client",
    status: "active",
    importance: "core",
    description: "Live Magento 2 e-commerce for Techno Stationery",
  },
  "ops-dashboard": {
    slug: "ops-dashboard",
    title: "TechnoStationery Dashboard — Operations & Monitoring Hub",
    diskPath: "TECHNO/dashboard",
    type: "client",
    status: "active",
    importance: "core",
    description: "Internal ops dashboard with monitoring and AI reporting",
  },
  "it-collaborator": {
    slug: "it-collaborator",
    title: "IT Collaborator — Networking & Security Training Platform",
    diskPath: "TECHNO/it-collaborator-react",
    type: "client",
    status: "active",
    importance: "core",
    description: "React training platform with simulators and quizzes",
  },
  "techno-etl": {
    slug: "techno-etl",
    title: "Techno-ETL — Media & Data Management Platform",
    diskPath: "TECHNO/Techno-ETL",
    type: "client",
    status: "active",
    importance: "core",
    description: "MDM + Magento sync, Kanban tasks, real-time monitoring",
  },
  "cloudweb": {
    slug: "cloudweb",
    title: "CloudWeb — Hotel Multi-Service Web Platform",
    diskPath: "Hotech/app-cloudweb",
    type: "contract",
    status: "active",
    importance: "core",
    description: "Next.js hotel platform: IBE, ePayment, eConcierge",
  },
  "webex": {
    slug: "webex",
    title: "WebEX — HoTech Web Extension Platform",
    diskPath: "Hotech/webex",
    type: "contract",
    status: "active",
    importance: "core",
    description: "Ext JS web extension platform for hospitality ERP",
  },

  // ── SUPPORTING — Active but secondary ────────────────────────────────
  "mabcoin": {
    slug: "mabcoin",
    title: "MabCoin / Mab Arena — Reasoning-Rating Platform (Founder)",
    diskPath: "Mab Project/mabCoin",
    type: "personal",
    status: "active",
    importance: "supporting",
    description: "Edge-native platform for reasoning session rating",
  },
  "mdm-app": {
    slug: "mdm-app",
    title: "MDM Application — Master Data Management with Azure AD",
    diskPath: "TECHNO/mdm-app",
    type: "client",
    status: "active",
    importance: "supporting",
    description: "React + Node.js master data management with Azure AD",
  },
  "webcms-app": {
    slug: "webcms-app",
    title: "WebCMS — Hotel Content Management System",
    diskPath: "Hotech/webcms-app",
    type: "contract",
    status: "active",
    importance: "supporting",
    description: "Vue 3 + Go CMS for hotel website content",
  },
  "ogent": {
    slug: "ogent",
    title: "Ogent — Otello AI Agent (MCP Server for Hospitality ERP)",
    diskPath: "Hotech/Ogent",
    type: "contract",
    status: "active",
    importance: "supporting",
    description: "Spring AI MCP server for hospitality ERP",
  },

  // ── LEGACY — Completed or maintenance ────────────────────────────────
  "noor-almaarifa": {
    slug: "noor-almaarifa",
    title: "Noor Al Maarifa — Educational Institute Website",
    diskPath: "TECHNO/noomarifa",
    type: "client",
    status: "maintenance",
    importance: "legacy",
    description: "Educational institute website with RTL support",
  },
  "jskit": {
    slug: "jskit",
    title: "JSKit — Firebase-Based CRM & PMS Toolkit",
    diskPath: "Mab Project/jskit",
    type: "personal",
    status: "maintenance",
    importance: "legacy",
    description: "Open-source Firebase CRM toolkit",
  },
  "portfolio": {
    slug: "portfolio",
    title: "Developer Portfolio — React + Firebase with Admin CMS",
    diskPath: "Mab Project/mounir1.github.io",
    type: "personal",
    status: "active",
    importance: "core",
    description: "This site — data-driven portfolio with admin CMS",
  },
};

/**
 * Reverse lookup: given a disk path relative to C:\projects,
 * return the matching portfolio slug.
 */
export function findSlugByDiskPath(diskPath: string): string | undefined {
  return Object.values(projectsIndex).find(
    (entry) => entry.diskPath === diskPath,
  )?.slug;
}

/**
 * Get all entries by importance level.
 */
export function getEntriesByImportance(
  importance: ProjectImportance,
): ProjectDiskEntry[] {
  return Object.values(projectsIndex).filter(
    (entry) => entry.importance === importance,
  );
}

/**
 * Get all entries by type.
 */
export function getEntriesByType(type: ProjectDiskType): ProjectDiskEntry[] {
  return Object.values(projectsIndex).filter((entry) => entry.type === type);
}

export type ProjectSlug = keyof typeof projectsIndex;