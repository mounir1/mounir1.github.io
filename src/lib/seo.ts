/**
 * SEO utilities
 * – Dynamic <title> and <meta> tag management
 * – Open Graph & Twitter Card support
 * – JSON-LD structured data (Person, WebSite, ItemList)
 * – Canonical URL helper
 */

export interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  keywords?: string[];
  noIndex?: boolean;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
}

const SITE_NAME = "Mounir Abderrahmani – Full-Stack Developer";
const BASE_URL = "https://mounir1.github.io";
const DEFAULT_IMAGE = `${BASE_URL}/profile.webp`;
const DEFAULT_DESCRIPTION =
  "Senior Full-Stack Developer & Software Architect specialising in React, Node.js, and enterprise integrations. 10+ years · Algeria · Remote.";

// ─── Low-level helpers ────────────────────────────────────────────────────────

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  if (typeof document === "undefined") return;
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  if (typeof document === "undefined") return;
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(id: string, data: Record<string, unknown>) {
  if (typeof document === "undefined") return;
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function updateSeo(config: SeoConfig = {}) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url = typeof window !== "undefined" ? window.location.href : BASE_URL,
    type = "website",
    keywords = [],
    noIndex = false,
    author = "Mounir Abderrahmani",
  } = config;

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // ── <title> ──
  if (typeof document !== "undefined") document.title = fullTitle;

  // ── Standard meta ──
  setMeta("description", description);
  setMeta("author", author);
  if (keywords.length) setMeta("keywords", keywords.join(", "));
  if (noIndex) setMeta("robots", "noindex, nofollow");

  // ── Open Graph ──
  setMeta("og:site_name", SITE_NAME, "property");
  setMeta("og:type", type, "property");
  setMeta("og:title", fullTitle, "property");
  setMeta("og:description", description, "property");
  setMeta("og:image", image, "property");
  setMeta("og:url", url, "property");
  setMeta("og:locale", "en_US", "property");

  // ── Twitter Card ──
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", fullTitle);
  setMeta("twitter:description", description);
  setMeta("twitter:image", image);
  setMeta("twitter:creator", "@mounir_dev");

  // ── Canonical ──
  setLink("canonical", url);
}

// ─── Structured Data ──────────────────────────────────────────────────────────

export function injectPersonSchema() {
  setJsonLd("ld-person", {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mounir Abderrahmani",
    url: BASE_URL,
    image: DEFAULT_IMAGE,
    jobTitle: "Senior Full-Stack Developer & Software Architect",
    description: DEFAULT_DESCRIPTION,
    address: { "@type": "PostalAddress", addressCountry: "DZ" },
    sameAs: [
      "https://linkedin.com/in/mounir1badi",
      "https://github.com/mounir1",
    ],
    knowsAbout: [
      "React", "Node.js", "TypeScript", "Firebase", "PostgreSQL",
      "E-commerce", "API Development", "DevOps",
    ],
  });
}

export function injectWebSiteSchema() {
  setJsonLd("ld-website", {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

export function injectProjectSchema(projects: Array<{ title: string; description: string; slug?: string; liveUrl?: string }>) {
  setJsonLd("ld-projects", {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portfolio Projects",
    itemListElement: projects.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      description: p.description,
      url: p.liveUrl ?? `${BASE_URL}/#projects`,
    })),
  });
}

// ─── useSeo hook ──────────────────────────────────────────────────────────────
import { useEffect } from "react";

export function useSeo(config: SeoConfig) {
  useEffect(() => {
    updateSeo(config);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
