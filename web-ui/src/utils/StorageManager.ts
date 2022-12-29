export class StorageManager<T> {
  constructor(private readonly key: string, private readonly createDefaultItem: () => T) {
  }

  get(): T {
    const storedItem = localStorage.getItem(this.key);

    if (!storedItem) {
      return this.createDefaultItem();
    }

    return JSON.parse(storedItem);
  }

  save(item: T) {
    localStorage.setItem(this.key, JSON.stringify(item));
  };
}
