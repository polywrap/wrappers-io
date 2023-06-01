export interface IDb {
  save<TVal>(
    keyName: string,
    keyValue: string,
    value: TVal
  ): Promise<void>;
  read<TVal>(
    keyName: string,
    keyValue: string
  ): Promise<TVal | undefined>;
}
