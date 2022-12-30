import { getProvider } from "./getProvider";

import { Provider } from "ethers-multicall";
import { ethers } from "ethers";

const multicallProviders = new Map<number, Provider>();
export const getMultiCallProviderOrInit = async (
  desiredChainId: number,
  chainId: number,
  provider: ethers.providers.Provider
): Promise<Provider> => {
  const multiCallProvider = multicallProviders.get(desiredChainId);
  if (multiCallProvider) {
    return multiCallProvider;
  }

  const newProvider = new Provider(
    getProvider(desiredChainId, chainId, provider)!
  );
  await newProvider.init();

  multicallProviders.set(desiredChainId, newProvider);

  return newProvider;
};
