import { describe, it, expect, vi, beforeEach } from "vitest";

// The config flags were split into ./firebase-config precisely so nothing
// imports the ~380 kB firebase bundle to read a boolean. These assertions now
// target that module directly: importing @/lib/firebase here to check two
// booleans meant transforming the whole firebase graph inside the test, which
// exceeded the 5 s default timeout whenever the rest of the suite was running.
describe("firebase config validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("hasRequiredConfig / isFirebaseEnabled behavior", () => {
    it("exports hasRequiredConfig as a boolean", async () => {
      const mod = await import("@/lib/firebase-config");
      expect(typeof mod.hasRequiredConfig).toBe("boolean");
    });

    it("exports isFirebaseEnabled as a boolean", async () => {
      const mod = await import("@/lib/firebase-config");
      expect(typeof mod.isFirebaseEnabled).toBe("boolean");
    });

    it("never enables Firebase without real keys", async () => {
      // The gate is `hasRequiredConfig` first, so a PROD build with placeholder
      // keys must still stay disabled rather than opening a doomed connection.
      const { hasRequiredConfig, isFirebaseEnabled } = await import("@/lib/firebase-config");
      expect(isFirebaseEnabled && !hasRequiredConfig).toBe(false);
    });
  });

  describe("@/lib/firebase re-exports the same flags", () => {
    it("agrees with firebase-config on both booleans", async () => {
      const [flags, firebase] = await Promise.all([
        import("@/lib/firebase-config"),
        import("@/lib/firebase"),
      ]);

      expect(firebase.hasRequiredConfig).toBe(flags.hasRequiredConfig);
      expect(firebase.isFirebaseEnabled).toBe(flags.isFirebaseEnabled);
    });

    // Pulling in the real bundle is the whole point of this case, so it is
    // allowed more headroom than the flag assertions above.
    it("exports app and db (possibly undefined)", { timeout: 20_000 }, async () => {
      const mod = await import("@/lib/firebase");
      expect(mod.app === undefined || typeof mod.app === "object").toBe(true);
      expect(mod.db === undefined || typeof mod.db === "object").toBe(true);
    });
  });

  describe("getFirebaseAuth lazy loader", () => {
    it("returns undefined auth when app is not initialised", { timeout: 20_000 }, async () => {
      const mod = await import("@/lib/firebase");
      if (!mod.app) {
        const result = await mod.getFirebaseAuth();
        expect(result.auth).toBeUndefined();
        expect(result.GithubAuthProvider).toBeUndefined();
      }
    });
  });

  describe("getFirebaseStorage lazy loader", () => {
    it("returns undefined when app is not initialised", { timeout: 20_000 }, async () => {
      const mod = await import("@/lib/firebase");
      if (!mod.app) {
        expect(await mod.getFirebaseStorage()).toBeUndefined();
      }
    });
  });

  describe("initFirebaseAnalytics", () => {
    it("does not throw in development", { timeout: 20_000 }, async () => {
      const mod = await import("@/lib/firebase");
      await expect(mod.initFirebaseAnalytics()).resolves.toBeUndefined();
    });
  });
});
