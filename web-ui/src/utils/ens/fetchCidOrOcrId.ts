import { ENS_CONTRACT_ADDRESSES } from "../../constants";
import { EnsRegistryContract } from "../../utils/ens/EnsRegistryContract";
import { EnsResolverContract } from "../../utils/ens/EnsResolverContract";
import { getCidFromContenthash } from "../../utils/getCidFromContenthash";
import { EnsDomain } from "../../models/EnsDomain";

import { decodeOcrIdFromContenthash, OcrId } from "@nerfzael/ocr-core";
import { arrayify, namehash } from "ethers/lib/utils";
import { ethers } from "ethers";

export const fetchCidOrOcrId = async (
  ensDomain: EnsDomain,
  chainId: number,
  provider: ethers.providers.Provider
): Promise<{
  cid?: string;
  ocrId?: OcrId;
  error?: any;
}> => {
  try {
    const contractAddresses = ENS_CONTRACT_ADDRESSES[chainId];
    if (!contractAddresses) {
      throw new Error(`No contract addresses for chainId ${chainId}`);
    }
    const registry = EnsRegistryContract.create(
      ENS_CONTRACT_ADDRESSES[chainId].registry,
      provider
    );

    const resolverAddress = await registry.resolver(namehash(ensDomain.name));

    if (resolverAddress && resolverAddress !== ethers.constants.AddressZero) {
      const resolver = EnsResolverContract.create(resolverAddress, provider);

      const contenthash = await resolver.contenthash(namehash(ensDomain.name));
      const savedCid = getCidFromContenthash(contenthash);

      if (savedCid) {
        return {
          cid: savedCid,
        };
      } else {
        const savedOcrId = decodeOcrIdFromContenthash(arrayify(contenthash));
        if (savedOcrId) {
          return {
            ocrId: savedOcrId,
          };
        }
      }
    }
  } catch (e: any) {
    return {
      error: e,
    };
  }

  return {};
};
