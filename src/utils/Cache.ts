export type CacheTargets = CacheTarget[];
export enum CacheTarget {
  CACHE_API = 'CACHE_API',
  MEMORY = 'MEMORY',
}
export const CACHE_API_KEY = 'sentinelhub-v1';
const DEFAULT_TARGETS = [CacheTarget.CACHE_API, CacheTarget.MEMORY];

export const memoryCache = new Map();

export function cacheFactory(optionalTargets: CacheTargets): ShCache {
  const targets = optionalTargets || DEFAULT_TARGETS;
  const target = getFirstUsuableTarget(targets);
  return constructCache(target);
}

function getFirstUsuableTarget(targets: CacheTargets): CacheTarget {
  let firstTargetToUse = CacheTarget.MEMORY;
  for (const key of targets) {
    if (doesTargetExist(key)) {
      firstTargetToUse = key;
      break;
    }
  }
  return firstTargetToUse;
}

function doesTargetExist(target: CacheTarget): boolean {
  switch (target) {
    case CacheTarget.CACHE_API:
      return Boolean(window.caches);
    case CacheTarget.MEMORY:
      return true;
    default:
      return false;
  }
}

function constructCache(target: CacheTarget): ShCache {
  switch (target) {
    case CacheTarget.CACHE_API:
      return new CacheApi();
    case CacheTarget.MEMORY:
      return new MemoryCache();
    default:
      throw new Error('Target not supported');
  }
}

interface ShCache {
  set(key: string, value: Response): void;
  get(key: string): Promise<Response>;
  invalidate(): void;
}

class MemoryCache implements ShCache {
  private cache: Record<string, any>;
  public constructor() {
    this.cache = memoryCache;
  }

  public set(key: string, value: Response): void {
    this.cache.set(key, value);
  }

  public get(key: string): any {
    return this.cache.get(key);
  }

  public invalidate(): void {
    this.cache.clear();
  }
}

class CacheApi implements ShCache {
  private cache: Record<string, any>;
  public constructor() {
    this.cache = caches.open(CACHE_API_KEY);
  }

  public async set(key: string, value: Response): Promise<void> {
    const cache = await this.cache;
    cache.put(key, value);
  }

  public async get(key: string): Promise<Response> {
    const cache = await this.cache;
    return await cache.match(key);
  }

  public async invalidate(): Promise<void> {
    const cache = await this.cache;
    const cacheKeys = await cache.keys();
    cacheKeys.forEach(async (key: string) => {
      this.cache.delete(key);
    });
  }
}

export async function invalidateCaches(): Promise<void> {
  for (const target of DEFAULT_TARGETS) {
    switch (target) {
      case CacheTarget.CACHE_API:
        await new CacheApi().invalidate();
      case CacheTarget.MEMORY:
        await new MemoryCache().invalidate();
      default:
        break;
    }
  }
}
