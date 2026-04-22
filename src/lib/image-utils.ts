/**
 * Image optimisation utilities
 * – Lazy-load wrapper with IntersectionObserver
 * – Responsive srcset generator
 * – Placeholder blur-hash generator (CSS-based, no extra dep)
 * – Image preloader for LCP candidates
 * – Client-side resize / compress via OffscreenCanvas
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageOptions {
  /** Max width in px for srcset generation */
  maxWidth?: number;
  /** Quality 0–100 (for WebP output) */
  quality?: number;
  /** Generate a low-quality placeholder URI */
  placeholder?: boolean;
}

export interface OptimisedImage {
  src: string;
  srcset?: string;
  sizes?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

// ─── Responsive breakpoints ────────────────────────────────────────────────────

const BREAKPOINTS = [320, 480, 640, 768, 1024, 1280, 1536] as const;

/**
 * Generate a srcset string from a base URL.
 * Assumes the image server supports ?w=<width> query params (Cloudinary, imgix, etc.)
 * Falls back gracefully to a single src if no transform support.
 */
export function generateSrcset(
  url: string,
  maxWidth = 1536,
  transformParam = "w"
): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;

  const widths = BREAKPOINTS.filter((w) => w <= maxWidth);
  // Detect Cloudinary / imgix patterns
  const isCloudinary = url.includes("cloudinary.com") || url.includes("res.cloudinary");
  const isImgix = url.includes(".imgix.net") || url.includes("imgix.net");

  if (!isCloudinary && !isImgix) {
    // Plain URL – just return as-is (no server-side transform available)
    return `${url} 1x`;
  }

  return widths
    .map((w) => {
      let transformed = url;
      if (isCloudinary) {
        // Insert w_<n>,f_auto,q_auto transformation segment
        transformed = url.replace(
          /\/upload\//,
          `/upload/w_${w},f_auto,q_auto/`
        );
      } else if (isImgix) {
        const u = new URL(url);
        u.searchParams.set(transformParam, String(w));
        u.searchParams.set("auto", "format,compress");
        transformed = u.toString();
      }
      return `${transformed} ${w}w`;
    })
    .join(", ");
}

/**
 * Generate sizes attribute for common layouts.
 */
export function generateSizes(layout: "full" | "half" | "third" | "card" = "full"): string {
  const map: Record<string, string> = {
    full: "(max-width: 768px) 100vw, 100vw",
    half: "(max-width: 768px) 100vw, 50vw",
    third: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px",
  };
  return map[layout];
}

// ─── CSS blur placeholder ─────────────────────────────────────────────────────

/**
 * Returns a tiny SVG data URI that acts as a blurred placeholder while the
 * real image loads.  Uses a dominant colour extracted at build/upload time.
 */
export function buildPlaceholderUri(dominantColor = "#8b5cf6"): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect fill='${dominantColor}' width='1' height='1'/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ─── Preload critical images ───────────────────────────────────────────────────

const _preloaded = new Set<string>();

/**
 * Injects a <link rel='preload'> tag for LCP-critical images.
 * Safe to call multiple times – deduplicates automatically.
 */
export function preloadImage(url: string, as: "image" = "image"): void {
  if (_preloaded.has(url) || typeof document === "undefined") return;
  _preloaded.add(url);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

// ─── IntersectionObserver lazy loader ─────────────────────────────────────────

let _observer: IntersectionObserver | null = null;
const _callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver {
  if (_observer) return _observer;
  _observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = _callbacks.get(entry.target);
          if (cb) {
            cb();
            _observer?.unobserve(entry.target);
            _callbacks.delete(entry.target);
          }
        }
      }
    },
    { rootMargin: "200px", threshold: 0.01 }
  );
  return _observer;
}

/**
 * Register a DOM element to lazy-load.
 * `onLoad` is called when the element enters the viewport.
 * Returns an unsubscribe function.
 */
export function lazyLoad(element: Element, onLoad: () => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onLoad(); // Fallback: load immediately
    return () => {};
  }
  _callbacks.set(element, onLoad);
  getObserver().observe(element);
  return () => {
    getObserver().unobserve(element);
    _callbacks.delete(element);
  };
}

// ─── Client-side image compression ────────────────────────────────────────────

/**
 * Compress a File/Blob to WebP using OffscreenCanvas (if available) or
 * regular Canvas, downscaling to maxWidth if necessary.
 * Returns a Blob ready for upload.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1920,
  quality = 0.82
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas 2D not available")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Canvas toBlob failed")); return; }
          resolve(blob);
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Read a File as a data URL (for preview before upload).
 */
export function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

// ─── Aspect-ratio helpers ─────────────────────────────────────────────────────

export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(width, height);
  return `${width / d} / ${height / d}`;
}

// ─── React hook: optimised image props ───────────────────────────────────────

import { useState, useEffect, useRef } from "react";

export interface UseOptimisedImageResult {
  src: string;
  isLoaded: boolean;
  isError: boolean;
  placeholder: string;
}

/**
 * Hook that lazy-loads an image and provides a placeholder while loading.
 */
export function useOptimisedImage(
  url: string,
  options: { dominantColor?: string; preload?: boolean } = {}
): UseOptimisedImageResult {
  const { dominantColor = "#8b5cf6", preload = false } = options;
  const ref = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeSrc, setActiveSrc] = useState("");

  const placeholder = buildPlaceholderUri(dominantColor);

  useEffect(() => {
    if (!url) return;
    if (preload) {
      preloadImage(url);
      loadImage();
      return;
    }

    // Lazy load
    const el = ref.current;
    if (!el) {
      loadImage();
      return;
    }
    const unsub = lazyLoad(el, loadImage);
    return unsub;

    function loadImage() {
      const img = new Image();
      img.onload = () => { setActiveSrc(url); setIsLoaded(true); };
      img.onerror = () => setIsError(true);
      img.src = url;
    }
  }, [url, preload]); // eslint-disable-line react-hooks/exhaustive-deps

  return { src: isLoaded ? activeSrc : placeholder, isLoaded, isError, placeholder };
}
