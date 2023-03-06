import { Network } from "./Network";
import { getMultiCallProviderOrInit } from "./getMultiCallProviderOrInit";

import { ethers } from "ethers";
import { DetailedDomainModel } from "../models/DetailedDomainModel";
import { DomainModel } from "../models/DomainModel";
import { populateEnsDomainOwners } from "./populateEnsDomainOwners";

export const getDomainsWithEnsOwnerInfoForNetwork = async (
  domains: DomainModel[],
  network: string,
  chainId: number,
  provider: ethers.providers.Provider
): Promise<DetailedDomainModel[] | undefined> => {
  const desiredChainId = Network.fromNetworkName(network).chainId;
  if (!desiredChainId) {
    return undefined;
  }

  const multiCallProvider = await getMultiCallProviderOrInit(
    desiredChainId,
    chainId,
    provider
  );
  const mainnetMultiCallProvider = await getMultiCallProviderOrInit(
    1,
    chainId,
    provider
  );

  const detailedDomains = await populateEnsDomainOwners(
    domains,
    chainId,
    multiCallProvider,
    mainnetMultiCallProvider,
    network
  );

  return detailedDomains;
};
