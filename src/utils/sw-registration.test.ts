import { describe, it, expect, vi, afterEach } from 'vitest';
import { isServiceWorkerDisableRequested, purgeServiceWorker } from './sw-registration';

describe('isServiceWorkerDisableRequested', () => {
  const base = 'https://mounir1.github.io/';

  it('recognises the escape-hatch parameter', () => {
    expect(isServiceWorkerDisableRequested(`${base}?sw=off`)).toBe(true);
    expect(isServiceWorkerDisableRequested(`${base}?sw=OFF`)).toBe(true);
    expect(isServiceWorkerDisableRequested(`${base}?a=1&sw=off&b=2`)).toBe(true);
    expect(isServiceWorkerDisableRequested(`${base}admin?sw=off`)).toBe(true);
  });

  it('ignores everything else, including a malformed URL', () => {
    expect(isServiceWorkerDisableRequested(base)).toBe(false);
    expect(isServiceWorkerDisableRequested(`${base}?sw=on`)).toBe(false);
    expect(isServiceWorkerDisableRequested(`${base}?sw`)).toBe(false);
    expect(isServiceWorkerDisableRequested('not a url')).toBe(false);
    expect(isServiceWorkerDisableRequested('')).toBe(false);
  });
});

describe('purgeServiceWorker', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
  const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches');

  afterEach(() => {
    if (original) Object.defineProperty(navigator, 'serviceWorker', original);
    else delete (navigator as unknown as Record<string, unknown>).serviceWorker;
    if (originalCaches) Object.defineProperty(globalThis, 'caches', originalCaches);
  });

  function stubWorker(registrations: Array<{ unregister: () => Promise<boolean> }>) {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistrations: async () => registrations },
    });
  }

  it('unregisters every worker and drops every cache', async () => {
    const deleted: string[] = [];
    stubWorker([{ unregister: async () => true }, { unregister: async () => true }]);
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: { keys: async () => ['a', 'b'], delete: async (n: string) => deleted.push(n) },
    });

    await expect(purgeServiceWorker()).resolves.toBe(true);
    expect(deleted.sort()).toEqual(['a', 'b']);
  });

  it('still clears caches when no worker is registered', async () => {
    const deleteSpy = vi.fn(async () => true);
    stubWorker([]);
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: { keys: async () => ['stale'], delete: deleteSpy },
    });

    await expect(purgeServiceWorker()).resolves.toBe(false);
    expect(deleteSpy).toHaveBeenCalledWith('stale');
  });

  it('reports failure rather than throwing where service workers are absent', async () => {
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: undefined });

    await expect(purgeServiceWorker()).resolves.toBe(false);
  });

  it('tolerates a namespace with no methods on it', async () => {
    // Some embedded browsers expose navigator.serviceWorker as an empty object.
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} });

    await expect(purgeServiceWorker()).resolves.toBe(false);
  });
});
