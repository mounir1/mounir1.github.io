import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// public/sw.js is copied verbatim into dist and never bundled, so it cannot be
// imported. We evaluate the real file with injected globals and drive its
// listeners instead, so these assertions describe what the deployed worker
// actually does rather than what a mock of it does.
const source = fs.readFileSync(path.resolve('public/sw.js'), 'utf8');

class Req {
  url: string;
  method = 'GET';
  mode = 'cors';
  destination = '';
  constructor(url: string, init: Partial<{ method: string; mode: string; destination: string }> = {}) {
    this.url = url;
    Object.assign(this, init);
  }
}

class Res {
  body: string;
  status: number;
  ok: boolean;
  // Accepts both call shapes used by sw.js and by these tests:
  // new Response(body, { status }) and new Res(body, status).
  constructor(body: string, init: number | { status?: number } = 200) {
    this.body = body;
    this.status = typeof init === 'number' ? init : (init.status ?? 200);
    this.ok = this.status < 400;
  }
  clone() {
    return this;
  }
}

class Cache {
  entries = new Map<string, Res>();
  async match(r: { url: string }) {
    return this.entries.get(r.url);
  }
  async put(r: { url: string }, res: Res) {
    this.entries.set(r.url, res);
  }
  async addAll(rs: Array<{ url: string }>) {
    for (const r of rs) this.entries.set(r.url, new Res('precached'));
  }
}

class Caches {
  stores = new Map<string, Cache>();
  deleted: string[] = [];
  async open(n: string) {
    if (!this.stores.has(n)) this.stores.set(n, new Cache());
    return this.stores.get(n) as Cache;
  }
  async keys() {
    return [...this.stores.keys()];
  }
  async delete(n: string) {
    this.deleted.push(n);
    return this.stores.delete(n);
  }
  async match(r: { url: string }) {
    for (const s of this.stores.values()) {
      const hit = await s.match(r);
      if (hit) return hit;
    }
    return undefined;
  }
}

function loadWorker() {
  const listeners: Record<string, (event: object) => void> = {};
  const caches = new Caches();
  const routes = new Map<string, string>();
  const fetchCalls: string[] = [];

  const self = {
    addEventListener: (t: string, fn: (event: object) => void) => {
      listeners[t] = fn;
    },
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve(), openWindow: () => Promise.resolve() },
  };

  const fetch = async (input: unknown) => {
    const url = typeof input === 'string' ? input : (input as Req).url;
    fetchCalls.push(url);
    const body = routes.get(url);
    if (body === undefined) throw new Error('offline');
    return new Res(body);
  };

  new Function('self', 'caches', 'fetch', 'Request', 'Response', 'URL', 'console', source)(
    self,
    caches,
    fetch,
    Req,
    Res,
    URL,
    { log() {}, error() {}, warn() {} },
  );

  const wait = (type: string) =>
    new Promise<void>((resolve) => {
      listeners[type]({ waitUntil: (p: Promise<unknown>) => p.then(() => resolve(), () => resolve()) });
    });

  async function precachedUrls() {
    await wait('install');
    const urls = new Set<string>();
    for (const s of caches.stores.values()) for (const u of s.entries.keys()) urls.add(u);
    return [...urls];
  }

  return {
    caches,
    fetchCalls,
    respondTo(url: string, body: string) {
      routes.set(url, body);
    },
    async handle(request: Req) {
      let settled: Promise<Res> | undefined;
      listeners.fetch({ request, respondWith: (p: Promise<Res>) => void (settled = p) });
      return (await (settled as Promise<Res>)) as Res;
    },
    install: () => wait('install'),
    activate: () => wait('activate'),
    precachedUrls,
  };
}

const navigate = (url: string) => new Req(url, { mode: 'navigate', destination: 'document' });
const asset = (url: string) => new Req(url, { destination: 'script' });


describe('service worker — stale HTML is the bug this file exists to prevent', () => {
  it('never precaches the HTML document', async () => {
    // '/' and '/index.html' used to be precached. That document references the
    // content-hashed chunks a later deploy replaces, so caching it is what left
    // returning visitors requesting assets that no longer exist — and it
    // survived every subsequent deploy, because nothing ever evicted it.
    const urls = await loadWorker().precachedUrls();
    expect(urls).not.toContain('/index.html');
    expect(urls).not.toContain('/');
    expect(urls).toContain('/offline.html');
  });

  it('serves a navigation from the network even when a stale copy is cached', async () => {
    const worker = loadWorker();
    const url = 'https://mounir1.github.io/';
    (await worker.caches.open('mounir-portfolio-dynamic-v2')).entries.set(url, new Res('stale-html'));
    worker.respondTo(url, 'fresh-html');

    expect((await worker.handle(navigate(url))).body).toBe('fresh-html');
  });

  it('falls back to cache, then to offline.html, when the network is down', async () => {
    const worker = loadWorker();
    const cached = 'https://mounir1.github.io/projects';
    (await worker.caches.open('mounir-portfolio-dynamic-v2')).entries.set(cached, new Res('cached-page'));

    expect((await worker.handle(navigate(cached))).body).toBe('cached-page');
    expect((await worker.handle(navigate('https://mounir1.github.io/gone'))).status).toBe(503);
  });

  it('still serves content-hashed assets cache-first', async () => {
    const worker = loadWorker();
    const url = 'https://mounir1.github.io/assets/js/index-abc123.js';
    worker.respondTo(url, 'from-network');
    (await worker.caches.open('mounir-portfolio-static-v2')).entries.set(url, new Res('from-cache'));

    expect((await worker.handle(asset(url))).body).toBe('from-cache');
    expect(worker.fetchCalls).not.toContain(url);
  });
});

describe('service worker — cache versioning', () => {
  it('evicts the v1 caches that broke people', async () => {
    // Bumping the version only discharges affected users because activate()
    // purges the old names. Keep that filter honest.
    const worker = loadWorker();
    const legacy = [
      'mounir-portfolio-v1',
      'mounir-portfolio-static-v1',
      'mounir-portfolio-dynamic-v1',
      'workbox-cache-7',
    ];
    for (const name of legacy) await worker.caches.open(name);

    await worker.activate();

    expect(worker.caches.deleted.sort()).toEqual([...legacy].sort());
    expect(await worker.caches.keys()).toEqual([]);
  });

  it('never deletes its own current caches', async () => {
    const worker = loadWorker();
    await worker.caches.open('mounir-portfolio-static-v2');
    await worker.caches.open('mounir-portfolio-dynamic-v2');

    await worker.activate();

    expect(worker.caches.deleted).toEqual([]);
    expect(await worker.caches.keys()).toHaveLength(2);
  });
});
