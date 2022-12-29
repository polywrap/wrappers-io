import { EnsDomainModel } from "./WrapperModel";

export type WrapperEnsModel = {
  name: string;
  cid: string;
  downloadCount: number;
  size: string;
  type: string;
  version: string;
  network: string;
  ens: EnsDomainModel;
};
