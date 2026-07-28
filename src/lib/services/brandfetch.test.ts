import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We test the brandfetch service with mocked fetch. The module reads an env var
// for the API key (after security hardening), defaulting to empty string.

const mockResponse = (data: unknown, ok = true, statusText = "OK") =>
  ({
    ok,
    statusText,
    json: async () => data,
  }) as unknown as Response;

describe("brandfetch service", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("searchBrand", () => {
    it("returns mapped search results on success", async () => {
      const { searchBrand } = await import("@/lib/services/brandfetch");
      const mockData = [
        {
          domain: "example.com",
          name: "Example",
          logos: [{ href: "https://logo.example.svg" }],
          icon: { href: "https://icon.example.svg" },
        },
      ];
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse(mockData)
      );

      const results = await searchBrand("example");
      expect(results).toHaveLength(1);
      expect(results[0].domain).toBe("example.com");
      expect(results[0].name).toBe("Example");
      expect(results[0].logo).toBe("https://logo.example.svg");
      expect(results[0].icon).toBe("https://icon.example.svg");
    });

    it("returns empty array on fetch error", async () => {
      const { searchBrand } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network error")
      );

      const results = await searchBrand("fail");
      expect(results).toEqual([]);
    });

    it("returns empty array on non-ok response", async () => {
      const { searchBrand } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse([], false, "Unauthorized")
      );

      const results = await searchBrand("test");
      expect(results).toEqual([]);
    });

    it("encodes the query parameter", async () => {
      const { searchBrand } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse([])
      );

      await searchBrand("hello world & co");
      const calledUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as string;
      expect(calledUrl).toContain("q=hello%20world%20%26%20co");
    });
  });

  describe("getBrandByDomain", () => {
    it("maps full brand data on success", async () => {
      const { getBrandByDomain } = await import("@/lib/services/brandfetch");
      const mockData = {
        logos: [
          { href: "https://logo.svg", formats: ["svg"] },
          { href: "https://logo.png", formats: ["png"] },
        ],
        icon: { href: "https://icon.svg" },
        colors: [
          { hex: "#FF0000" },
          { hex: "#00FF00" },
          { hex: "#0000FF" },
        ],
        fonts: [{ name: "Inter" }, { name: "Roboto" }],
      };
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse(mockData)
      );

      const result = await getBrandByDomain("example.com");
      expect(result).not.toBeNull();
      expect(result!.logo).toBe("https://logo.svg");
      expect(result!.icon).toBe("https://icon.svg");
      expect(result!.colors.primary).toBe("#FF0000");
      expect(result!.colors.secondary).toBe("#00FF00");
      expect(result!.colors.palette).toEqual(["#FF0000", "#00FF00", "#0000FF"]);
      expect(result!.fonts).toEqual(["Inter", "Roboto"]);
    });

    it("returns null on non-ok response", async () => {
      const { getBrandByDomain } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse(null, false, "Not Found")
      );

      const result = await getBrandByDomain("unknown.com");
      expect(result).toBeNull();
    });

    it("returns null on network error", async () => {
      const { getBrandByDomain } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network error")
      );

      const result = await getBrandByDomain("error.com");
      expect(result).toBeNull();
    });

    it("uses default colors when missing", async () => {
      const { getBrandByDomain } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse({})
      );

      const result = await getBrandByDomain("minimal.com");
      expect(result!.colors.primary).toBe("#000000");
      expect(result!.colors.secondary).toBe("#666666");
      expect(result!.colors.palette).toEqual([]);
    });
  });

  describe("getBrandLogo", () => {
    it("returns logo URL matching requested format", async () => {
      const { getBrandLogo } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse({
          logos: [
            { href: "https://logo.png", formats: ["png"] },
            { href: "https://logo.svg", formats: ["svg"] },
          ],
        })
      );

      const logo = await getBrandLogo("example.com", "svg");
      expect(logo).toBe("https://logo.svg");
    });

    it("falls back to first logo if format not found", async () => {
      const { getBrandLogo } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse({
          logos: [{ href: "https://logo.png", formats: ["png"] }],
        })
      );

      const logo = await getBrandLogo("example.com", "svg");
      expect(logo).toBe("https://logo.png");
    });

    it("returns null on error", async () => {
      const { getBrandLogo } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("fail")
      );

      const logo = await getBrandLogo("error.com");
      expect(logo).toBeNull();
    });
  });

  describe("getBrandColors", () => {
    it("returns array of hex colors", async () => {
      const { getBrandColors } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse({
          colors: [{ hex: "#AAA" }, { hex: "#BBB" }],
        })
      );

      const colors = await getBrandColors("example.com");
      expect(colors).toEqual(["#AAA", "#BBB"]);
    });

    it("returns empty array when no colors", async () => {
      const { getBrandColors } = await import("@/lib/services/brandfetch");
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        mockResponse({})
      );

      const colors = await getBrandColors("example.com");
      expect(colors).toEqual([]);
    });
  });
});
