import { getWrappersFromEns } from "./getWrappersFromEns";
import { groupBy } from "./groupBy";
import { getWrappersWithEnsOwnerInfoForNetwork } from "./getWrappersWithEnsOwnerInfoForNetwork";
import { DetailedWrapperEnsModel } from "../models/DetailedWrapperEnsModel";

import { ethers } from "ethers";
import { loadEnsInfoFromGateway } from "./loadEnsInfoFromGateway";
import { DetailedDomainModel } from "../models/DetailedDomainModel";
import { getDomainsWithEnsOwnerInfoForNetwork } from "./getDomainsWithEnsOwnerInfoForNetwork";
import { WrapperEnsModel } from "../models/WrapperEnsModel";

export const getEnsDomains = async (
  provider: ethers.providers.Provider,
  currentChainId: number,
  network: string
): Promise<[DetailedDomainModel[], WrapperEnsModel[]]> => {
  const wrappers = await getWrappersFromEns();

  const wrappersForNetwork = wrappers.filter((wrapper) => wrapper.network === network);
  
  const ensDomainsWithTextRecords = await loadEnsInfoFromGateway(network);

  const domains = await getDomainsWithEnsOwnerInfoForNetwork(
    ensDomainsWithTextRecords,
    network,
    currentChainId,
    provider
  );

  if (!domains) {
    throw Error("getDomainsWithEnsOwnerInfoForNetwork failed!");
  }
  return [domains, wrappersForNetwork];
};
