import { DetailedWrapperEnsModel } from "../models/DetailedWrapperEnsModel";
import { WrapperEnsModel } from "../models/WrapperEnsModel";
import { mapWithMultiCall } from "./mapWithMultiCall";
import { CacheLoader } from "./CacheLoader";

import { Provider, Contract } from "ethers-multicall";
import { ethers } from "ethers";
import { ENS_CONTRACT_ADDRESSES } from "../constants";

const ENS_REGISTRY_ABI = [
  "function owner(bytes32 node) external view returns (address)",
  "function resolver(bytes32 node) external view returns (address)",
  "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external",
];

export const populateEnsDomainOwners = async (
  wrappers: WrapperEnsModel[],
  chainId: number,
  provider: Provider,
  mainnetProvider: Provider,
  network: string
): Promise<DetailedWrapperEnsModel[]> => {
  const domainOwnersCache = CacheLoader.ensDomainOwners(network);
  const reverseLookupCache = CacheLoader.ensReverseLookup(network);

  const registry = new Contract(
    ENS_CONTRACT_ADDRESSES[chainId.toString()].registry,
    ENS_REGISTRY_ABI
  );

  const wrappersWithOwners: DetailedWrapperEnsModel[] = await mapWithMultiCall(
    wrappers,
    provider,
    async (wrapper, call) => {
      const owner = (await domainOwnersCache.getOrUpdate(wrapper.ens.node, () =>
        call<string>(registry.owner(ethers.utils.hexlify(wrapper.ens.node)))
      )) as string;

      return {
        ...wrapper,
        owner,
      };
    }
  );

  const mainnetRegistry = new Contract(
    ENS_CONTRACT_ADDRESSES["1"].registry,
    ENS_REGISTRY_ABI
  );

  const detailedWrappers: DetailedWrapperEnsModel[] = await mapWithMultiCall(
    wrappersWithOwners,
    mainnetProvider,
    async (wrapper, call) => {
      const ownerDomain = await reverseLookupCache.getOrUpdate(wrapper.owner, async () => {
        const reverseLookupDomain = `${wrapper.owner.slice(2)}.addr.reverse`;

        const resolverAddress = await call<string>(
          mainnetRegistry.resolver(
            ethers.utils.hexlify(
              ethers.utils.namehash(reverseLookupDomain)
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
              ethers.utils.namehash(reverseLookupDomain)
            )
          )
        );

        return ownerDomain;
      });

      return {
        ...wrapper,
        ownerDomain: ownerDomain as string | undefined,
      };
    }
  );

  domainOwnersCache.save();
  reverseLookupCache.save();

  return detailedWrappers;
};
