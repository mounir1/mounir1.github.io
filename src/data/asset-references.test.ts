import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { initialProjects } from "@/data/initial-projects";
import { initialExperience } from "@/data/initial-experience";
import { initialTestimonials } from "@/data/initial-testimonials";

// Seed data is the only asset consumer that can be checked without a browser:
// every path below ends up in an <img src> on the public site, and a wrong one
// renders a broken-image icon inside the card badge with nothing else to show.
const publicDir = path.resolve(import.meta.dirname, "..", "..", "public");

// readdirSync rather than existsSync: on Windows public/Moodle-logo.svg answers
// a request for /moodle-logo.svg, while GitHub Pages — case-sensitive, and built
// from a Linux clone of the *index* — serves a 404. Comparing against the real
// directory listing makes the check as strict as the server.
const servedFiles = new Set(fs.readdirSync(publicDir));

type AssetRef = { owner: string; field: string; value: string };

const assetRefs: AssetRef[] = [
  ...initialProjects.flatMap((p) => [
    { owner: `"${p.title}"`, field: "logo", value: p.logo ?? "" },
    { owner: `"${p.title}"`, field: "image", value: p.image ?? "" },
  ]),
  ...initialExperience.map((e) => ({
    owner: `"${e.company}" (${e.title})`,
    field: "companyLogo",
    value: e.companyLogo ?? "",
  })),
  ...initialTestimonials.map((t) => ({
    owner: `"${t.author}"`,
    field: "avatar",
    value: t.avatar ?? "",
  })),
].filter((ref) => ref.value);

const selfHosted = assetRefs.filter((ref) => ref.value.startsWith("/"));

describe("seed data asset references", () => {
  it("resolves every referenced file in public/, byte-exact on case", () => {
    for (const ref of selfHosted) {
      const file = path.posix.basename(ref.value);
      expect(
        servedFiles.has(file),
        `${ref.owner}.${ref.field} points at ${ref.value}, which is not in public/` +
          (servedFiles.has(file.toLowerCase())
            ? " — the file exists with different casing"
            : ""),
      ).toBe(true);
    }
  });

  it("never hotlinks a project or company image from a third-party origin", () => {
    // A remote logo makes someone else's uptime a dependency of this site, and
    // the Unsplash stock photos this file used to carry showed rooms and
    // bookshelves for projects that had nothing to do with them.
    for (const ref of assetRefs) {
      expect(
        ref.value.startsWith("/"),
        `${ref.owner}.${ref.field} is not self-hosted: ${ref.value}`,
      ).toBe(true);
    }
  });

  it("gives every project a logo and a card icon", () => {
    initialProjects.forEach((p, i) => {
      expect(p.logo, `project[${i}] "${p.title}" has no logo`).toBeTruthy();
      expect(p.icon, `project[${i}] "${p.title}" has no icon`).toBeTruthy();
    });
  });
});

describe("shipped raster assets are what they claim to be", () => {
  const signatures: Record<string, (bytes: Buffer) => boolean> = {
    ".webp": (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
    ".png": (b) => b.subarray(1, 4).toString("latin1") === "PNG",
    ".jpg": (b) => b[0] === 0xff && b[1] === 0xd8,
    ".jpeg": (b) => b[0] === 0xff && b[1] === 0xd8,
  };

  // public/profile.webp was a PNG with a .webp name until scripts/optimize-images.mjs
  // existed: browsers sniff the real type, so the LCP image shipped as an
  // unoptimised 202 KB PNG while og:image advertised dimensions it never had.
  for (const [ext, isMatch] of Object.entries(signatures)) {
    it(`every ${ext} file in public/ really is ${ext.slice(1)}`, () => {
      for (const file of [...servedFiles].filter((f) => f.toLowerCase().endsWith(ext))) {
        const bytes = fs.readFileSync(path.join(publicDir, file));
        expect(isMatch(bytes), `${file} is not a real ${ext.slice(1)} file`).toBe(true);
      }
    });
  }

  // The avatar master is gone from every machine — asset-sources/profile-source.png
  // was never committed — so the shipped webp is the only copy left and nothing
  // can regenerate it safely (upscaling it to 1200x630 would visibly degrade
  // og-image.jpg). index.html still advertises og:image dimensions and preloads
  // the avatar as the LCP element, so the files are checked against that claim.
  it("ships the avatar and og:image at the dimensions index.html declares", async () => {
    const { default: sharp } = await import("sharp");
    const html = fs.readFileSync(
      path.resolve(import.meta.dirname, "..", "..", "index.html"),
      "utf8",
    );
    const declared = {
      width: Number(/og:image:width" content="(\d+)"/.exec(html)?.[1]),
      height: Number(/og:image:height" content="(\d+)"/.exec(html)?.[1]),
    };
    const og = await sharp(path.join(publicDir, "og-image.jpg")).metadata();
    expect([og.width, og.height], "public/og-image.jpg vs the og:image tags").toEqual([
      declared.width,
      declared.height,
    ]);
    const avatar = await sharp(path.join(publicDir, "profile.webp")).metadata();
    expect([avatar.width, avatar.height], "public/profile.webp must stay the 512² LCP asset").toEqual([
      512,
      512,
    ]);
  });

  // GitHub Pages serves dist/, and dist copies public/ verbatim — so a lossless
  // master parked here is shipped to every visitor, unreferenced. Masters belong
  // in asset-sources/, which is why .gitignore matches public/*-source.*.
  it("keeps unoptimised image masters out of public/", () => {
    const masters = [...servedFiles].filter((f) => /-source\.(png|jpe?g|webp)$/i.test(f));
    expect(masters, `move to asset-sources/: ${masters.join(", ")}`).toEqual([]);
  });
});
