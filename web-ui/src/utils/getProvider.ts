import { ETH_PROVIDERS } from "../constants";

import { ethers } from "ethers";

export const getProvider = (
  desiredChainId: number,
  currentChainId: number,
  provider: ethers.providers.Provider
): ethers.providers.Provider | undefined => {
  if (currentChainId === desiredChainId) {
    return provider;
  } else if (ETH_PROVIDERS[desiredChainId]) {
    return new ethers.providers.JsonRpcProvider(ETH_PROVIDERS[desiredChainId]);
  } else {
    return undefined;
  }
};
