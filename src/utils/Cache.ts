export type CacheTargets = CacheTarget[];
export enum CacheTarget {
  CACHE_API = 'CACHE_API',
  MEMORY = 'MEMORY',
}
export const CACHE_API_KEY = 'sentinelhub-v1';
export const memoryCache = new Map();
const defaultTargets = [CacheTarget.CACHE_API, CacheTarget.MEMORY];

export class CacheFactory {
  public target: CacheTarget;
  public cacheWrapper: ShCache;
  public constructor(optionalTargets?: CacheTargets) {
    const targets = optionalTargets || defaultTargets;
    this.target = this.getFirstUsuableTarget(targets);
    this.cacheWrapper = this.constructCache(this.target);
  }

  private constructCache(target: CacheTarget): ShCache {
    switch (target) {
      case CacheTarget.CACHE_API:
        return new CacheApi();
      case CacheTarget.MEMORY:
        return new MemoryCache();
      default:
        throw new Error('Target not supported');
    }
  }

  private getFirstUsuableTarget(targets: CacheTargets): CacheTarget {
    let firstTargetToUse = CacheTarget.MEMORY;
    for (const key of targets) {
      if (this.doesTargetExist(key)) {
        firstTargetToUse = key;
        break;
      }
    }
    return firstTargetToUse;
  }

  private doesTargetExist(target: CacheTarget): boolean {
    switch (target) {
      case CacheTarget.CACHE_API:
        return Boolean(window.caches);
      case CacheTarget.MEMORY:
        return true;
      default:
        return false;
    }
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
