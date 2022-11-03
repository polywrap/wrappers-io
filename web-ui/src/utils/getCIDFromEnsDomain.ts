import { getCidFromContenthash } from "./getCidFromContenthash";

import { ethers } from "ethers";

export const getCIDFromEnsDomain = async (
  ensDomain: string,
  provider: ethers.providers.JsonRpcProvider
): Promise<string | undefined> => {
  const resolver = await provider?.getResolver(ensDomain);
  const contenthash = await resolver?.getContentHash();
  if (!contenthash) {
    return;
  }
  const cid = getCidFromContenthash(contenthash);

  return cid;
};
