
export interface IDb {
  save<T>(keyName: string, keyValue: string, value: T): Promise<void>;
  read<T>(keyName: string, keyValue: string): Promise<T | undefined>;
}
