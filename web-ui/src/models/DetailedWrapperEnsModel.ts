import { WrapperEnsModel } from "./WrapperEnsModel";

export type DetailedWrapperEnsModel = WrapperEnsModel & {
  owner: string;
  ownerDomain?: string;
};
