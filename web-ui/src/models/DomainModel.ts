export type DomainModel = {
  node: string,
  domain?: string,
  textRecords: {
    key: string,
    value: string,
  }[]
};
