export interface ICache<TKey, TValue> {
  get(key: TKey): TValue | null;
  set(key: TKey, item: TValue): void;
};
