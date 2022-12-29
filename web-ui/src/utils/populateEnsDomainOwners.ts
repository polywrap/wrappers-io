import { DetailedWrapperEnsModel } from "../models/DetailedWrapperEnsModel";
import { WrapperEnsModel } from "../models/WrapperEnsModel";
import { mapWithMultiCall } from "./mapWithMultiCall";
import { CacheLoader } from "./CacheLoader";

import { Provider, Contract } from "ethers-multicall";
import { ethers } from "ethers";

export const populateEnsDomainOwners = async (
  wrappers: WrapperEnsModel[],
  registry: Contract,
  provider: Provider,
  network: string
): Promise<DetailedWrapperEnsModel[]> => {
  const domainOwnersCache = CacheLoader.ensDomainOwners(network);
  const reverseLookupCache = CacheLoader.ensReverseLookup(network);

  const detailedWrappers: DetailedWrapperEnsModel[] = await mapWithMultiCall(
    wrappers,
    provider,
    async (wrapper, call) => {
      const owner = (await domainOwnersCache.getOrUpdate(wrapper.ens.node, () =>
        call<string>(registry.owner(ethers.utils.hexlify(wrapper.ens.node)))
      )) as string;

      const ownerDomain = owner
        ? await reverseLookupCache.getOrUpdate(wrapper.ens.node, async () => {
            const resolverAddress = await call<string>(
              registry.resolver(
                ethers.utils.hexlify(
                  ethers.utils.namehash(`${owner.slice(2)}.addr.reverse`)
                )
              )
            );

            if (resolverAddress === ethers.constants.AddressZero) {
              return undefined;
            }

            const resolverContract = new Contract(resolverAddress, [
              "function name(bytes32) external view returns(string)",
            ]);

            const ownerDomain = await call<string>(
              resolverContract.name(
                ethers.utils.hexlify(
                  ethers.utils.namehash(`${owner.slice(2)}.addr.reverse`)
                )
              )
            );

            return ownerDomain;
          })
        : undefined;

      return {
        ...wrapper,
        owner,
        ownerDomain: ownerDomain as string | undefined,
      };
    }
  );

  domainOwnersCache.save();
  reverseLookupCache.save();

  return detailedWrappers;
};
