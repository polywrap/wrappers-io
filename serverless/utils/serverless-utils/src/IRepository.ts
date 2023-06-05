export interface IRepository<TEntity>  {
  save(
    value: TEntity
  ): Promise<void>;

  read(
    key: string
  ): Promise<TEntity | undefined>;
}
