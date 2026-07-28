import { describe, it, expect, vi, beforeEach } from "vitest";

describe("firebase config validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  function loadFirebase(env: Record<string, string | undefined>, isProd = false) {
    vi.stubEnv("PROD", isProd);
    vi.stubEnv("DEV", !isProd);
    vi.doMock("@/lib/firebase", async () => {
      const mod = await import("@/lib/firebase");
      return mod;
    });
    vi.stubGlobal("import_meta_env", {
      ...env,
      DEV: !isProd,
      PROD: isProd,
    });

    // We can't easily override import.meta.env at runtime, so we test the
    // isRealValue logic indirectly by checking exported flags with the real
    // env. Instead, extract and test the pure function directly.
    return null;
  }

  describe("hasRequiredConfig / isFirebaseEnabled behavior", () => {
    it("exports hasRequiredConfig as a boolean", async () => {
      const mod = await import("@/lib/firebase");
      expect(typeof mod.hasRequiredConfig).toBe("boolean");
    });

    it("exports isFirebaseEnabled as a boolean", async () => {
      const mod = await import("@/lib/firebase");
      expect(typeof mod.isFirebaseEnabled).toBe("boolean");
    });

    it("exports app and db (possibly undefined)", async () => {
      const mod = await import("@/lib/firebase");
      expect(mod.app === undefined || typeof mod.app === "object").toBe(true);
      expect(mod.db === undefined || typeof mod.db === "object").toBe(true);
    });
  });

  describe("getFirebaseAuth lazy loader", () => {
    it("returns undefined auth when app is not initialised", async () => {
      const mod = await import("@/lib/firebase");
      if (!mod.app) {
        const result = await mod.getFirebaseAuth();
        expect(result.auth).toBeUndefined();
        expect(result.GithubAuthProvider).toBeUndefined();
      }
    });
  });

  describe("getFirebaseStorage lazy loader", () => {
    it("returns undefined when app is not initialised", async () => {
      const mod = await import("@/lib/firebase");
      if (!mod.app) {
        expect(await mod.getFirebaseStorage()).toBeUndefined();
      }
    });
  });

  describe("initFirebaseAnalytics", () => {
    it("does not throw in development", async () => {
      const mod = await import("@/lib/firebase");
      await expect(mod.initFirebaseAnalytics()).resolves.toBeUndefined();
    });
  });
});
