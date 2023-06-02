import { IDb } from "./IDb";

export class InMemoryDb implements IDb {
  private db: Record<string, Record<string, string>> = {};

  async save<TVal>(
    keyName: string,
    keyValue: string,
    value: TVal
  ): Promise<void> {
    if (!this.db[keyName]) {
      this.db[keyName] = {};
    }

    this.db[keyName][keyValue] = JSON.stringify(value);
  }

  async read<TVal>(
    keyName: string,
    keyValue: string
  ): Promise<TVal | undefined> {
    if (!this.db[keyName]) {
      return undefined;
    }

    const value = this.db[keyName][keyValue];

    if (!value) {
      return undefined;
    }

    return JSON.parse(value) as TVal;
  }
}
