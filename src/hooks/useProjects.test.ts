import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjects } from "@/hooks/useProjects";
import { initialProjects } from "@/data/initial-projects";

// Mock firebase so the hook uses local data fallback
vi.mock("@/lib/firebase", () => ({
  db: undefined,
  isFirebaseEnabled: false,
}));

describe("useProjects hook (local data fallback)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads local projects when Firebase is disabled", async () => {
    const { result } = renderHook(() => useProjects());

    // Wait for the useEffect to fire
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.projects.length).toBe(initialProjects.length);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("assigns local- prefixed IDs", async () => {
    const { result } = renderHook(() => useProjects());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.projects[0].id).toMatch(/^local-\d+$/);
  });

  it("separates featured and non-featured projects", async () => {
    const { result } = renderHook(() => useProjects());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.featured.length).toBeGreaterThan(0);
    result.current.featured.forEach((p) => {
      expect(p.featured).toBe(true);
      expect(p.disabled).toBe(false);
    });
    result.current.others.forEach((p) => {
      expect(p.featured).toBe(false);
      expect(p.disabled).toBe(false);
    });
  });

  it("featured + others + disabled = total projects", async () => {
    const { result } = renderHook(() => useProjects());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const total =
      result.current.featured.length +
      result.current.others.length;
    // All initial projects are not disabled, so total should match
    expect(total).toBe(result.current.projects.length);
  });
});
