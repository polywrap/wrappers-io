import { DomainModel } from "./DomainModel";

export type DetailedDomainModel = DomainModel & {
  owner: string;
  ownerDomain?: string;
};
