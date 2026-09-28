/**
 * sync-firestore-rest.ts
 * ─────────────────────── Owner-side Firestore sync over REST — the CLI twin
 * of the admin panel's "Sync (update existing)" (`syncPortfolio()` in
 * database-uploader.ts): rows matched by title/name/label are UPDATED in
 * place (keeping their Firestore id and createdAt), missing rows are created,
 * nothing is ever deleted.
 *
 * Auth: refreshes the locally stored Firebase CLI OAuth token
 * (`~/.config/configstore/firebase-tools.json`, same refresh flow the
 * `firebase` CLI uses). Seeds are loaded through Vite's SSR pipeline because
 * `src/lib/firebase.ts` reads `import.meta.env` at module scope.
 *
 * Usage (from repo root):
 *   npx tsx src/utils/sync-firestore-rest.ts                     # dry run
 *   npx tsx src/utils/sync-firestore-rest.ts --apply             # write
 *   npx tsx src/utils/sync-firestore-rest.ts --apply --settings  # + settings/site
 *   npx tsx src/utils/sync-firestore-rest.ts --apply --collections=experiences,projects
 */

import { execFile } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type SeedItem = Record<string, unknown>;
export type FirestoreValue = Record<string, unknown>;

export interface ExistingDoc {
  id: string;
  data: SeedItem;
}

export interface Action {
  kind: "update" | "create";
  label: string;
  docId?: string;
  liveKeys?: string[];
  payload: SeedItem;
}

export interface CollectionPlan {
  collection: string;
  actions: Action[];
  skipped: string[];
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
let API = "";

// ─── Auth: Firebase CLI OAuth token (refresh flow identical to firebase CLI) ──

const CLIENT_ID =
  process.env.FIREBASE_CLIENT_ID ??
  "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com";
const CLIENT_SECRET =
  process.env.FIREBASE_CLIENT_SECRET ?? "j9iVZfS8kkCEFUPaAeJV0sAi";

interface TokenStore {
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

async function getAccessToken(): Promise<string> {
  const cfgPath = join(homedir(), ".config", "configstore", "firebase-tools.json");
  let store: TokenStore;
  try {
    store = JSON.parse(readFileSync(cfgPath, "utf8")) as TokenStore;
  } catch {
    throw new Error(
      `Firebase CLI credentials not found at ${cfgPath} - run "firebase login" first.`,
    );
  }
  const tokens = store.tokens ?? {};
  const now = Date.now();
  if (tokens.access_token && (tokens.expires_at ?? 0) > now + 60_000) {
    return tokens.access_token;
  }
  if (!tokens.refresh_token) {
    throw new Error('No refresh_token in firebase-tools configstore - run "firebase login".');
  }
  const form = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  }).toString();
  const res = await callHttp("POST", "https://oauth2.googleapis.com/token", {
    "Content-Type": "application/x-www-form-urlencoded",
  }, form);
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`OAuth refresh failed (${res.status}): ${res.text.slice(0, 300)}`);
  }
  const json = JSON.parse(res.text) as { access_token: string; expires_in: number };
  try {
    store.tokens = {
      ...tokens,
      access_token: json.access_token,
      expires_at: now + json.expires_in * 1000,
    };
    writeFileSync(cfgPath, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Persisting the refreshed token is best-effort; in-memory token still works.
  }
  return json.access_token;
}

// ─── Firestore REST helpers ───────────────────────────────────────────────────

/**
 * Network to Google endpoints on this connection is flaky (connect timeouts
 * that vary per resolved IP), so every call retries with backoff.
 */
async function fetchWithRetry(url: string, init: RequestInit, attempts = 5): Promise<Response> {
  let lastErr: unknown = new Error("no attempt made");
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20_000) });
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) {
        const delay = 1000 * 2 ** i;
        console.log(
          `   retry ${i + 1}/${attempts} in ${delay}ms ` +
            `(${err instanceof Error ? err.message : String(err)})`,
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

interface HttpResult {
  status: number;
  text: string;
}

/** HTTP via curl.exe/curl — native resolver, markedly more reliable here. */
async function curlCall(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: string,
): Promise<HttpResult> {
  const bin = process.platform === "win32" ? "curl.exe" : "curl";
  const args = ["-sS", "--max-time", "30", "-X", method];
  for (const [k, v] of Object.entries(headers)) args.push("-H", `${k}: ${v}`);
  let tmp: string | undefined;
  if (body !== undefined) {
    tmp = join(tmpdir(), `sync-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    writeFileSync(tmp, body, "utf8");
    args.push("--data-binary", `@${tmp}`);
  }
  args.push("-w", "\n%{http_code}", url);
  try {
    const { stdout } = await execFileAsync(bin, args, { maxBuffer: 64 * 1024 * 1024 });
    const idx = stdout.lastIndexOf("\n");
    const status = Number(stdout.slice(idx + 1).trim());
    return { status, text: stdout.slice(0, idx) };
  } finally {
    if (tmp) {
      try {
        unlinkSync(tmp);
      } catch {
        // best-effort cleanup
      }
    }
  }
}

/** undici first (with retries), then curl fallback (with retries). */
async function callHttp(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: string,
): Promise<HttpResult> {
  try {
    const res = await fetchWithRetry(url, { method, headers, body }, 3);
    return { status: res.status, text: await res.text() };
  } catch (err) {
    console.log(
      `   fetch failed (${err instanceof Error ? err.message : String(err)}); curl fallback...`,
    );
  }
  let lastErr: unknown = new Error("curl unavailable");
  for (let i = 0; i < 3; i++) {
    try {
      return await curlCall(method, url, headers, body);
    } catch (err) {
      lastErr = err;
      if (i < 2) {
        const delay = 1000 * 2 ** i;
        console.log(`   curl retry ${i + 1}/3 in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

async function request(
  method: string,
  url: string,
  token: string,
  body?: unknown,
): Promise<unknown> {
  const res = await callHttp(
    method,
    url,
    {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body ? JSON.stringify(body) : undefined,
  );
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`${method} ${url} -> ${res.status}: ${res.text.slice(0, 300)}`);
  }
  return res.status === 204 ? null : JSON.parse(res.text);
}

export function toValue(v: unknown): FirestoreValue {
  if (v === null) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === "object") return { mapValue: { fields: toFields(v as SeedItem) } };
  throw new Error(`Unsupported value type: ${typeof v}`);
}

function toFields(obj: SeedItem): Record<string, FirestoreValue> {
  const out: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = toValue(v);
  return out;
}

export function fromValue(v: FirestoreValue): unknown {
  if ("nullValue" in v) return null;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("timestampValue" in v) return String(v.timestampValue);
  if ("arrayValue" in v) {
    const values = (v.arrayValue as { values?: FirestoreValue[] } | undefined)?.values ?? [];
    return values.map(fromValue);
  }
  if ("mapValue" in v) {
    const fields =
      (v.mapValue as { fields?: Record<string, FirestoreValue> } | undefined)?.fields ?? {};
    return fromFields(fields);
  }
  return null;
}

function fromFields(fields: Record<string, FirestoreValue>): SeedItem {
  const out: SeedItem = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromValue(v);
  return out;
}

async function fetchAllDocs(collection: string, token: string): Promise<ExistingDoc[]> {
  const docs: ExistingDoc[] = [];
  let pageToken = "";
  do {
    const url =
      `${API}/${collection}?pageSize=300` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    const json = (await request("GET", url, token)) as {
      documents?: Array<{ name: string; fields?: Record<string, FirestoreValue> }>;
      nextPageToken?: string;
    };
    for (const d of json.documents ?? []) {
      docs.push({ id: d.name.split("/").pop() ?? "", data: fromFields(d.fields ?? {}) });
    }
    pageToken = json.nextPageToken ?? "";
  } while (pageToken);
  return docs;
}


// ─── Dedup / plan (mirrors database-uploader.ts semantics) ────────────────────

function strField(item: SeedItem, key: string): string | undefined {
  const v = item[key];
  return typeof v === "string" ? v : undefined;
}

export function dedupKey(item: SeedItem): string {
  const v =
    strField(item, "title") ??
    strField(item, "name") ??
    strField(item, "label") ??
    strField(item, "id") ??
    "";
  return v.trim().toLowerCase();
}

function itemLabel(item: SeedItem, fallback: string): string {
  return strField(item, "title") ?? strField(item, "name") ?? strField(item, "label") ?? fallback;
}

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
  );
}

/**
 * Rename pairing: after exact title matching, at most one seed row and one
 * live doc may remain unmatched while sharing a word (e.g. a retitled project).
 * Pairing them updates the existing doc instead of creating a duplicate.
 */
export function pairRenames(
  unmatchedSeed: SeedItem[],
  unmatchedLive: ExistingDoc[],
): Map<SeedItem, ExistingDoc> {
  const pairs = new Map<SeedItem, ExistingDoc>();
  if (unmatchedSeed.length !== 1 || unmatchedLive.length !== 1) return pairs;
  const seedTokens = tokens(strField(unmatchedSeed[0], "title") ?? dedupKey(unmatchedSeed[0]));
  const liveTokens = tokens(strField(unmatchedLive[0].data, "title") ?? "");
  const shared = [...seedTokens].filter((t) => liveTokens.has(t));
  if (shared.length > 0) pairs.set(unmatchedSeed[0], unmatchedLive[0]);
  return pairs;
}

/** Drop a top-level local `id` and deep-clone (also removes `undefined`s). */
export function sanitizeLocal(payload: object): SeedItem {
  const { id: _dropped, ...rest } = payload as SeedItem;
  return JSON.parse(JSON.stringify(rest)) as SeedItem;
}


export function buildPlan(
  collection: string,
  seed: SeedItem[],
  existing: ExistingDoc[],
): CollectionPlan {
  const exact = new Map<string, ExistingDoc>();
  for (const d of existing) {
    const k = dedupKey(d.data);
    if (k && !exact.has(k)) exact.set(k, d);
  }
  const unmatchedSeed: SeedItem[] = [];
  const matched = new Map<SeedItem, ExistingDoc>();
  for (const item of seed) {
    const hit = exact.get(dedupKey(item));
    if (hit) matched.set(item, hit);
    else unmatchedSeed.push(item);
  }
  const matchedIds = new Set([...matched.values()].map((d) => d.id));
  const unmatchedLive = existing.filter((d) => !matchedIds.has(d.id));
  const renames = pairRenames(unmatchedSeed, unmatchedLive);
  for (const [item, doc] of renames) matched.set(item, doc);

  const actions: Action[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();
  for (const item of seed) {
    const key = dedupKey(item);
    const label = itemLabel(item, "(untitled)");
    if (key && seen.has(key)) {
      skipped.push(label);
      continue;
    }
    if (key) seen.add(key);
    const hit = matched.get(item);
    const now = Date.now();
    if (hit) {
      if (renames.has(item)) {
        console.log(
          `   + rename pairing: "${strField(item, "title")}" -> existing doc ${hit.id}` +
            ` ("${strField(hit.data, "title")}")`,
        );
      }
      actions.push({
        kind: "update",
        label,
        docId: hit.id,
        liveKeys: Object.keys(hit.data),
        payload: sanitizeLocal({
          ...item,
          createdAt: hit.data.createdAt ?? item.createdAt ?? now,
          updatedAt: now,
          version: Number(hit.data.version ?? 1) + 1,
        }),
      });
    } else {
      actions.push({
        kind: "create",
        label,
        payload: sanitizeLocal({
          ...item,
          createdAt: item.createdAt || now,
          updatedAt: now,
          version: item.version ?? 1,
        }),
      });
    }
  }
  return { collection, actions, skipped };
}

async function executePlan(plan: CollectionPlan, token: string): Promise<number> {
  let ok = 0;
  const failures: string[] = [];
  for (const a of plan.actions) {
    try {
      if (a.kind === "update") {
        // Full-replace mask: payload keys + live keys absent from payload (removed).
        const mask = new Set(Object.keys(a.payload));
        for (const k of a.liveKeys ?? []) if (!(k in a.payload)) mask.add(k);
        const qs = new URLSearchParams();
        for (const k of mask) qs.append("updateMask.fieldPaths", k);
        await request("PATCH", `${API}/${plan.collection}/${a.docId}?${qs}`, token, {
          fields: toFields(a.payload),
        });
      } else {
        await request("POST", `${API}/${plan.collection}`, token, { fields: toFields(a.payload) });
      }
      ok++;
    } catch (err) {
      failures.push(`${a.label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  console.log(
    `   ${ok}/${plan.actions.length} written` +
      (plan.skipped.length ? `, ${plan.skipped.length} in-seed duplicate(s) skipped` : "") +
      (failures.length ? `, ${failures.length} FAILED` : ""),
  );
  for (const f of failures) console.log(`   FAILED ${f}`);
  return failures.length;
}


// ─── Settings diff (uploadAllData also merges settings/site) ──────────────────

function flattenLeaves(
  obj: SeedItem,
  prefix = "",
  out: Map<string, unknown> = new Map(),
): Map<string, unknown> {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flattenLeaves(v as SeedItem, p, out);
    else out.set(p, v);
  }
  return out;
}

export function diffSettings(live: SeedItem | null, seed: SeedItem): string[] {
  const seedFlat = flattenLeaves(seed);
  // `updatedAt` is a write-time sentinel in the caller and always differs.
  seedFlat.delete("updatedAt");
  const liveFlat = live ? flattenLeaves(live) : new Map<string, unknown>();
  const diffs: string[] = [];
  for (const [path, v] of seedFlat) {
    if (JSON.stringify(liveFlat.get(path)) !== JSON.stringify(v)) {
      diffs.push(`${path}: ${JSON.stringify(liveFlat.get(path))} -> ${JSON.stringify(v)}`);
    }
  }
  if (live) {
    for (const path of liveFlat.keys()) {
      if (!seedFlat.has(path) && path !== "updatedAt") diffs.push(`${path}: (live-only, kept by merge)`);
    }
  }
  return diffs;
}

// ─── Seed loading (Vite SSR pipeline so import.meta.env exists) ───────────────

const COLLECTIONS: Record<string, string> = {
  projects: "projects",
  experiences: "experiences",
  skills: "skills",
  testimonials: "testimonials",
  upcoming: "upcoming_projects",
  links: "links",
};

async function loadSeeds(): Promise<{ seeds: Record<string, SeedItem[]>; settings: SeedItem }> {
  // Loaded dynamically so importing this module for its pure helpers (tests)
  // never pulls the Vite toolchain in.
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    configFile: false,
    logLevel: "error",
    appType: "custom",
    server: { middlewareMode: true, hmr: false },
    resolve: { alias: { "@": resolve(root, "src") } },
  });
  try {
    const seeds: Record<string, SeedItem[]> = {
      projects: (await vite.ssrLoadModule("/src/data/initial-projects.ts")).initialProjects,
      experiences: (await vite.ssrLoadModule("/src/data/initial-experience.ts")).initialExperience,
      skills: (await vite.ssrLoadModule("/src/data/initial-skills.ts")).initialSkills,
      testimonials: (await vite.ssrLoadModule("/src/data/initial-testimonials.ts")).initialTestimonials,
      upcoming: (await vite.ssrLoadModule("/src/hooks/useUpcoming.ts")).DEFAULT_UPCOMING,
      links: (await vite.ssrLoadModule("/src/hooks/useLinks.ts")).DEFAULT_LINKS,
    };
    const settings = (await vite.ssrLoadModule("/src/hooks/useSettings.ts")).DEFAULT_SETTINGS;
    return { seeds, settings };
  } finally {
    await vite.close();
  }
}

function readProjectId(): string {
  // Prefer the committed production env file: the ambient process environment
  // can carry test residue (VITE_FIREBASE_PROJECT_ID=demo-project).
  try {
    const env = readFileSync(join(root, ".env.production"), "utf8");
    const m = env.match(/^VITE_FIREBASE_PROJECT_ID\s*=\s*(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    // fall through to environment variable
  }
  if (process.env.VITE_FIREBASE_PROJECT_ID) return process.env.VITE_FIREBASE_PROJECT_ID;
  throw new Error("VITE_FIREBASE_PROJECT_ID not found (.env.production missing).");
}


// ─── Main ─────────────────────────────────────────────────────────────────────

function leafPaths(obj: SeedItem, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === "object" && !Array.isArray(v) ? leafPaths(v as SeedItem, p) : [p];
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const withSettings = args.includes("--settings");
  const colArg = args.find((a) => a.startsWith("--collections="));
  const only = colArg
    ? colArg
        .split("=")[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const projectId = readProjectId();
  API = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  console.log(`Project: ${projectId}  |  mode: ${apply ? "APPLY" : "dry run (add --apply to write)"}`);

  const token = await getAccessToken();
  const { seeds, settings } = await loadSeeds();

  const keys = Object.keys(COLLECTIONS).filter((k) => !only || only.includes(k));
  const plans: CollectionPlan[] = [];
  for (const key of keys) {
    const collection = COLLECTIONS[key];
    const live = await fetchAllDocs(collection, token);
    const plan = buildPlan(collection, seeds[key], live);
    plans.push(plan);
    const creates = plan.actions.filter((a) => a.kind === "create").map((a) => a.label);
    console.log(
      `${collection.padEnd(15)} live=${String(live.length).padStart(2)}  ` +
        `seed=${String(seeds[key].length).padStart(2)}  ` +
        `update=${plan.actions.filter((a) => a.kind === "update").length}  ` +
        `create=${creates.length}`,
    );
    for (const c of creates) console.log(`   + ${c}`);
  }

  // settings/site diff (written only with --apply --settings)
  let settingsDiff: string[] = [];
  if (!only) {
    let liveSettings: SeedItem | null = null;
    try {
      const doc = (await request("GET", `${API}/settings/site`, token)) as {
        fields?: Record<string, FirestoreValue>;
      };
      liveSettings = fromFields(doc.fields ?? {});
    } catch {
      // 404 / network — treat settings doc as absent
    }
    settingsDiff = diffSettings(liveSettings, { ...settings, updatedAt: 0 });
    console.log(
      `settings/site    ${liveSettings ? "exists" : "missing"}  |  ` +
        `${settingsDiff.length} field difference(s) vs DEFAULT_SETTINGS` +
        (settingsDiff.length ? "" : " (in sync)"),
    );
    for (const d of settingsDiff.slice(0, 20)) console.log(`   ~ ${d}`);
    if (settingsDiff.length > 20) console.log(`   ... ${settingsDiff.length - 20} more`);
  }

  if (!apply) {
    console.log("\nDry run - no writes performed. Re-run with --apply to write these changes.");
    return;
  }

  let failures = 0;
  for (const plan of plans) {
    if (plan.actions.length === 0) continue;
    console.log(`\nWriting ${plan.collection}...`);
    failures += await executePlan(plan, token);
  }

  if (withSettings && !only && settingsDiff.length > 0) {
    console.log("\nWriting settings/site...");
    try {
      const payload: SeedItem = sanitizeLocal({ ...settings, updatedAt: Date.now() });
      const qs = new URLSearchParams();
      for (const p of leafPaths(payload)) qs.append("updateMask.fieldPaths", p);
      await request("PATCH", `${API}/settings/site?${qs}`, token, { fields: toFields(payload) });
      console.log("   ok: settings/site updated");
    } catch (err) {
      failures++;
      console.log(`   FAILED: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else if (!withSettings && settingsDiff.length > 0 && !only) {
    console.log("\nSettings untouched - add --settings with --apply to rewrite settings/site.");
  }

  if (failures > 0) {
    console.error(`\n${failures} write(s) FAILED`);
    process.exitCode = 1;
  } else {
    console.log("\nDone - all writes succeeded.");
  }
}

// Only run the CLI when invoked directly (`npx tsx src/utils/sync-firestore-rest.ts`)
// — importing this module for its pure helpers (tests) must have no side effects.
const entry = process.argv[1];
const selfPath = fileURLToPath(import.meta.url);
const invokedDirectly =
  typeof entry === "string" &&
  (process.platform === "win32"
    ? resolve(entry).toLowerCase() === selfPath.toLowerCase()
    : resolve(entry) === selfPath);

if (invokedDirectly) {
  main().catch((err: unknown) => {
    console.error(err instanceof Error ? (err.stack ?? err.message) : err);
    process.exitCode = 1;
  });
}

