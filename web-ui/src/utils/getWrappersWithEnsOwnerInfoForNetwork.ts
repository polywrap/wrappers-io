import { ethers } from "ethers";
import { Provider, Contract } from "ethers-multicall";
import { ENS_CONTRACT_ADDRESSES } from "../constants";
import { DetailedWrapperEnsModel } from "../models/DetailedWrapperEnsModel";
import { WrapperEnsModel } from "../models/WrapperEnsModel";
import { getProvider } from "./getProvider";
import { populateEnsDomainOwners } from "./populateEnsDomainOwners";
import { Network } from "./Network";

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

  const multiCallProvider = new Provider(getProvider(desiredChainId, chainId, provider)!);

  await multiCallProvider.init();

  const registry = new Contract(ENS_CONTRACT_ADDRESSES[desiredChainId.toString()].registry,  [
    "function owner(bytes32 node) external view returns (address)",
    "function resolver(bytes32 node) external view returns (address)",
    "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external",
  ]);
  
  const detailedWrappers = await populateEnsDomainOwners(wrappers, registry, multiCallProvider, network);

  return detailedWrappers;
};
