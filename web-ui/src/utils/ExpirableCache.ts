import { StorageManager } from "./StorageManager";

export type CachedItem<T> = {
  item: T;
  expiresOn: number;
};

export class ExpirableCache<TKey extends string | number | symbol, TValue> {
  constructor(
    private readonly storageName: string,
    private readonly cache: Map<TKey, CachedItem<TValue>>,
    private readonly expirationTime: number
  ) {}

  static load<TKey extends string | number | symbol, TValue>(
    storageName: string,
    expirationTime: number
  ): ExpirableCache<TKey, TValue> {
    const storage = new StorageManager<Record<string, CachedItem<string>>>(
      storageName,
      () => ({})
    );
    const storedCache: Record<string, CachedItem<string>> = storage.get();
    const cache = new Map();
    for (const key in storedCache) {
      cache.set(key, storedCache[key]);
    }

    return new ExpirableCache<TKey, TValue>(storageName, cache, expirationTime);
  }

  save(): void {
    const cache: Record<TKey, CachedItem<TValue>> = {} as Record<
      TKey,
      CachedItem<TValue>
    >;
    for (const [key, value] of this.cache) {
      cache[key] = value;
    }

    const storage = new StorageManager<Record<TKey, CachedItem<TValue>>>(
      this.storageName,
      () => ({} as Record<TKey, CachedItem<TValue>>)
    );
    storage.save(cache);
  }

  get(key: TKey): TValue | null {
    const cachedItem = this.cache.get(key);

    if (!cachedItem) {
      return null;
    }

    if (cachedItem.expiresOn < Date.now()) {
      return null;
    }

    return cachedItem.item;
  }

  set(key: TKey, item: TValue): void {
    const cachedItem = this.cache.get(key);
    if (!cachedItem || cachedItem.expiresOn < Date.now()) {
      this.cache.set(key, {
        item,
        expiresOn: Date.now() + this.expirationTime,
      });
    } else {
      this.cache.set(key, {
        item,
        expiresOn: cachedItem.expiresOn,
      });
    }
  }

  async getOrUpdate(
    key: TKey,
    update: () => Promise<TValue>
  ): Promise<TValue | null> {
    const cachedItem = this.get(key);
    if (cachedItem !== null) {
      return cachedItem;
    }

    const value = await update();

    this.set(key, value);

    return value;
  }
}
