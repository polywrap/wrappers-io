import { DetailedWrapperEnsModel } from "../models/DetailedWrapperEnsModel";
import { WrapperEnsModel } from "../models/WrapperEnsModel";
import { populateEnsDomainOwners } from "./populateEnsDomainOwners";
import { Network } from "./Network";

import { ethers } from "ethers";
import { getMultiCallProviderOrInit } from "./getMultiCallProviderOrInit";

export const getWrappersWithEnsOwnerInfoForNetwork = async (
  wrappers: WrapperEnsModel[],
  network: string,
  chainId: number,
  provider: ethers.providers.Provider
): Promise<DetailedWrapperEnsModel[] | undefined> => {
  const desiredChainId = Network.fromNetworkName(network).chainId;
  if (!desiredChainId) {
    return undefined;
  }

  const multiCallProvider = await getMultiCallProviderOrInit(desiredChainId, chainId, provider);
  const mainnetMultiCallProvider = await getMultiCallProviderOrInit(1, chainId, provider);

  const detailedWrappers = await populateEnsDomainOwners(
    wrappers,
    chainId,
    multiCallProvider,
    mainnetMultiCallProvider,
    network
  );

  return detailedWrappers;
};
