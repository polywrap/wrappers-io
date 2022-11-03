import { EnsRegistryContract } from "../ens/EnsRegistryContract";
import { EnsResolverContract } from "../ens/EnsResolverContract";

import { ContractTransaction, ethers, Signer } from "ethers";
import {
  decodeOcrIdFromContenthash,
  encodeOcrIdAsContenthash,
  OcrId,
} from "@nerfzael/ocr-core";

export const setOcrIdAsContenthash = async (
  domain: string,
  ocrId: OcrId,
  registryAddress: string,
  signer: Signer
): Promise<ContractTransaction> => {
  const registry = EnsRegistryContract.create(registryAddress, signer);

  const resolverAddress = await registry.resolver(
    ethers.utils.namehash(domain)
  );

  const resolver = EnsResolverContract.create(resolverAddress, signer);

  const contenthash = encodeOcrIdAsContenthash(ocrId);

  const tx = await resolver.setContenthash(
    ethers.utils.namehash(domain),
    contenthash
  );

  return tx;
};
