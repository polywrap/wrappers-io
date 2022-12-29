import { WrapperModel } from "../models/WrapperModel";
import { ExpirableCache } from "./ExpirableCache";

export namespace CacheLoader {
  export const wrappers = (): ExpirableCache<string, WrapperModel[] | undefined> => {
    return ExpirableCache.load<string, WrapperModel[] | undefined>(`wrappers`, 1000 * 30);
  };
  export const ensReverseLookup = (network: string): ExpirableCache<string, string | undefined> => {
    return ExpirableCache.load<string, string | undefined>(`ens-reverse-lookup-${network}`, 1000 * 30);
  };
  export const ensDomainOwners = (network: string): ExpirableCache<string, string> => {
    return ExpirableCache.load<string, string>(`ens-domain-owners-${network}`, 1000 * 30);
  };
}
