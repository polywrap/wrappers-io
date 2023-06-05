import { IDb } from "./IDb";
import { IRepository } from "./IRepository";

export class RepositoryBase<TEntity> implements IRepository<TEntity> {
  constructor(private readonly db: IDb, private readonly keyName: keyof TEntity & string) {
  }

  private getKey(
    value: TEntity
  ): string {
    return (value[this.keyName] as unknown as string);
  }

  async save(
    value: TEntity
  ): Promise<void> {
    await this.db.save<TEntity>(this.keyName, this.getKey(value), value);
  }

  read(
    key: string
  ): Promise<TEntity | undefined> {
    return this.db.read<TEntity>(this.keyName, key);
  }
}
