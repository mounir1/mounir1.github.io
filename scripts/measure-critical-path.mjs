import fs from "node:fs";
import zlib from "node:zlib";
import path from "node:path";

const DIST = "dist";

function sizeOf(file) {
  const b = fs.readFileSync(file);
  return {
    raw: Math.round(b.length / 1024),
    gz: Math.round(zlib.gzipSync(b, { level: 9 }).length / 1024),
    br: Math.round(zlib.brotliCompressSync(b).length / 1024),
  };
}

function find(dir, pattern) {
  return fs
    .readdirSync(dir)
    .map((f) => path.join(dir, f))
    .filter((f) => pattern.test(f) && fs.statSync(f).isFile());
}

const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const preloads = [...html.matchAll(/<link rel="modulepreload"[^>]*href="\/([^"]+)"/g)].map((m) => m[1]);
const styles = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\/([^"]+)"/g)].map((m) => m[1]);
const script = html.match(/<script[^>]*src="\/([^"]+)"/)?.[1];

let gzTotal = 0;
let brTotal = 0;

console.log("CRITICAL PATH (bytes on the wire before first paint)");
console.log("-".repeat(76));
console.log(
  `${"asset".padEnd(48)}${"raw".padStart(6)}${"gz".padStart(7)}${"br".padStart(7)}`
);

for (const rel of [...preloads, ...styles, script].filter(Boolean)) {
  const p = path.join(DIST, rel);
  if (!fs.existsSync(p)) {
    console.log(`MISSING: ${rel}`);
    continue;
  }
  const s = sizeOf(p);
  gzTotal += s.gz;
  brTotal += s.br;
  console.log(
    `${rel.padEnd(48)}${String(s.raw).padStart(6)}${String(s.gz).padStart(7)}${String(s.br).padStart(7)}`
  );
}

console.log("-".repeat(76));
console.log(
  `${"TOTAL".padEnd(48)}${"".padStart(6)}${String(gzTotal).padStart(7)}${String(brTotal).padStart(7)}`
);

// The whole point of the Firebase decoupling (firebase-config.ts /
// firestore-client.ts) is that the ~500 kB firebase-vendor chunk never reaches
// the landing page's critical path. Nothing else in the build enforces that:
// a single `import { db } from "@/lib/firebase"` at the top of a public hook
// puts it back in the entry graph and the bundle silently grows by 500 kB with
// no test failing and no build error. Fail loudly instead.
const firebaseOnCriticalPath = preloads.filter((href) => /firebase-vendor/.test(href));
if (firebaseOnCriticalPath.length > 0) {
  console.error(
    `\nFAIL: firebase-vendor is modulepreloaded: ${firebaseOnCriticalPath.join(", ")}`,
  );
  console.error(
    "A module above the fold imports @/lib/firebase statically. Import the\n" +
      "flags from @/lib/firebase-config and the handle from getDb() in\n" +
      "@/lib/firestore-client instead, keeping firebase/* inside the effect's\n" +
      "await import(...).",
  );
  process.exitCode = 1;
}

console.log("\nDEFERRED (fetched after first paint — not blocking)");
console.log("-".repeat(76));
for (const [label, dir, re] of [
  ["firebase-vendor", path.join(DIST, "assets/js"), /firebase-vendor-.*\.js$/],
  ["Admin route", path.join(DIST, "assets/js"), /Admin-.*\.js$/],
]) {
  for (const f of find(dir, re)) {
    const s = sizeOf(f);
    console.log(
      `${(label + " " + path.basename(f)).padEnd(48)}${String(s.raw).padStart(6)}${String(s.gz).padStart(7)}${String(s.br).padStart(7)}`
    );
  }
}

console.log("\nLARGEST FILES IN DIST");
console.log("-".repeat(76));
const all = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else all.push(p);
  }
})(DIST);

all
  .map((f) => ({ f, ...sizeOf(f) }))
  .sort((a, b) => b.gz - a.gz)
  .slice(0, 10)
  .forEach((s) => {
    console.log(
      `${path.relative(DIST, s.f).padEnd(48)}${String(s.raw).padStart(6)}${String(s.gz).padStart(7)}${String(s.br).padStart(7)}`
    );
  });
