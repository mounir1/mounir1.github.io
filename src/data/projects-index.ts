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
 * Every entry represents a real project with either a local checkout or a
 * recorded remote reference. Do not add projects without verifiable evidence.
 * For remote-only projects, leave diskPath empty and record repoUrl when public.
 */

export type ProjectDiskType = "client" | "personal" | "contract";
export type ProjectDiskStatus = "active" | "maintenance" | "archived" | "idea";
export type ProjectImportance = "core" | "supporting" | "legacy";

export interface ProjectDiskEntry {
  slug: string;
  title: string;
  /**
   * Relative path under C:\projects.
   * Empty string ("") means the verifier cannot — or should not — look for a
   * local working copy: the project is cloud-hosted only (a live deployment or
   * a remote Git repo), or its checkout no longer lives on the machine running
   * `verify-project-data.ts`. The verifier skips the on-disk existence check for
   * those rather than failing a project that plainly still exists.
   */
  diskPath: string;
  type: ProjectDiskType;
  status: ProjectDiskStatus;
  importance: ProjectImportance;
  description: string;
  /** Source repository / forge URL for cloud-hosted projects. */
  repoUrl?: string;
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
    // The TECHNO/it-collaborator-react checkout is no longer on this machine;
    // the platform itself is still live and still listed in the portfolio.
    diskPath: "",
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
    title: "WebEX (OWeb Cloud) — Multi-Tenant Hotel ERP Suite",
    diskPath: "Hotech/webex",
    type: "contract",
    status: "active",
    importance: "core",
    description: "Ext JS 8 multi-tenant hotel ERP (front office, reservations, POS, accounting…) on the OREST API — in production since 2017",
    repoUrl: "https://gitlab.hotech.dev/webapp/webex",
  },
  "hotech-builder": {
    slug: "hotech-builder",
    title: "Hotech Builder — Tourism Website Development Platform",
    diskPath: "Hotech/builder",
    type: "contract",
    status: "active",
    importance: "core",
    description: "GrapesJS + React drag-and-drop website/CMS builder for hotels",
    repoUrl: "https://gitlab.hotech.dev/webcms/builder",
  },
  "hotech-website": {
    slug: "hotech-website",
    title: "Hotech Website — Server-Rendered Hotel Website Engine",
    diskPath: "Hotech/website",
    type: "contract",
    status: "active",
    importance: "core",
    description: "Go (Fiber) + Jet engine rendering hotel sites from OREST data",
    repoUrl: "https://gitlab.hotech.dev/webcms/website",
  },
  "akeneo-pim": {
    slug: "akeneo-pim",
    title: "Akeneo PIM — Production Deployment & Hardening",
    diskPath: "",
    type: "client",
    status: "active",
    importance: "core",
    description: "Production Akeneo PIM 6 (PHP 8.3) for Techno Stationery product data",
    repoUrl: "https://github.com/mounirtms/akeneoPim",
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
  "mab-erp": {
    slug: "mab-erp",
    title: "Mab ERP — Algerian Enterprise Resource Planning (Founder)",
    // The Nexus-ERP checkout is no longer on this machine.
    diskPath: "",
    type: "personal",
    status: "active",
    importance: "supporting",
    description: "Single-binary Go + Vue 3 ERP with native Algerian compliance (SCF, IRG, CNAS, G50/G29)",
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
  "quickkeep": {
    slug: "quickkeep",
    title: "QuickKeep — Offline-First Personal Workspace PWA",
    diskPath: "Mab Project/quickkeep",
    type: "personal",
    status: "active",
    importance: "supporting",
    description: "React 19 + Vite 8 + Tailwind v4 + Firebase notes, tasks and tickets — installable, offline-first",
  },
  "aquafine": {
    slug: "aquafine",
    title: "AquaFine — Static Brand Site on Firebase Hosting",
    diskPath: "Mab Project/aquaFine",
    type: "client",
    status: "active",
    importance: "supporting",
    description: "Dependency-free brand site for an Algerian beverage label, hardened and cached on Firebase Hosting",
  },
  "hotech-e2e": {
    slug: "hotech-e2e",
    title: "HoTech Cross-App E2E Suite — Playwright Regression Harness",
    diskPath: "Hotech/e2e",
    type: "contract",
    status: "active",
    importance: "supporting",
    description: "Playwright suite exercising WebEX, Builder and Website together against the OREST stack",
  },
  "techno-magento-scripts": {
    slug: "techno-magento-scripts",
    title: "Magento ↔ ERP ETL Scripts — TechnoStationery Data Pipelines",
    diskPath: "TECHNO/scripts",
    type: "client",
    status: "active",
    importance: "supporting",
    description: "Node ETL job scripts over the technostationery.com REST V1 API, streaming catalogue and order data to CSV",
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
    title: "JSKit — Sencha Ext JS + Firebase ERP Platform",
    diskPath: "Mab Project/jskit",
    type: "personal",
    status: "maintenance",
    importance: "legacy",
    description: "Open-source Sencha Ext JS + Firebase ERP platform",
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

  // ── PERSONAL PRODUCTIVITY — Shipped, self-directed ─────────────────────
  "my-date": {
    slug: "my-date",
    title: "My Date — Historical Date Explorer (mydate.app)",
    diskPath: "Mab Project/Dateinfo",
    type: "personal",
    status: "active",
    importance: "supporting",
    description: "React + Gemini historical-date PWA: multi-calendar metrology, live feeds, AI synthesis",
  },
  "domino-table": {
    slug: "domino-table",
    title: "Domino Table — Offline-First Score Counter PWA",
    diskPath: "Mab Project/domino-table",
    type: "personal",
    status: "active",
    importance: "supporting",
    description: "Mobile-first domino scoring PWA that keeps playing with no connection",
  },
  "godseye": {
    slug: "godseye",
    title: "GOD EYE — AI Evidence Handling & Verification Platform",
    diskPath: "Mab Project/godseye",
    type: "personal",
    status: "active",
    importance: "supporting",
    description: "Live Next.js static front end for evidence findings, with a Go + Postgres backend scaffolded behind it",
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