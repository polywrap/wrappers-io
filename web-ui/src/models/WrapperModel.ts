export type WrapperModel = {
  name: string;
  cid: string;
  downloadCount: number;
  size: string;
  type: string;
  version: string;
  indexes: IndexModel[];
};

export type IndexModel = {
  name: string;
  ens: EnsDomainModel[];
};

export type EnsDomainModel = {
  node: string;
  domain?: string;
};
