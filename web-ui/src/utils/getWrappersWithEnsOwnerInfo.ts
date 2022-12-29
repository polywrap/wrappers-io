import { ethers } from "ethers";
import { getWrappersFromEns } from "./getWrappersFromEns";
import { groupBy } from "./groupBy";
import { getWrappersWithEnsOwnerInfoForNetwork } from "./getWrappersWithEnsOwnerInfoForNetwork";
import { DetailedWrapperEnsModel } from "../models/DetailedWrapperEnsModel";

export const getWrappersWithEnsOwnerInfo = async (
  provider: ethers.providers.Provider, 
  currentChainId: number
): Promise<DetailedWrapperEnsModel[]>  => {
  const wrappers = await getWrappersFromEns();

  const wrappersByNetwork = groupBy(wrappers, wrapper => wrapper.network);

  const networkTasks = Object.keys(wrappersByNetwork)
    .map(
      async network => getWrappersWithEnsOwnerInfoForNetwork(
        wrappersByNetwork[network], 
        network, 
        currentChainId, 
        provider
      )
    )
    .filter(x => x);

  const networks = await Promise.all(networkTasks);

  return networks
    .flat()
    .filter(x => !!x)
    .map(x => x!);
};
