import { mapWithMultiCall } from "./mapWithMultiCall";
import { CacheLoader } from "./CacheLoader";
import { ENS_CONTRACT_ADDRESSES } from "../constants";

import { Provider, Contract } from "ethers-multicall";
import { ethers } from "ethers";
import { DomainModel } from "../models/DomainModel";
import { DetailedDomainModel } from "../models/DetailedDomainModel";

const ENS_REGISTRY_ABI = [
  "function owner(bytes32 node) external view returns (address)",
  "function resolver(bytes32 node) external view returns (address)",
  "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external",
];

export const populateEnsDomainOwners = async (
  domains: DomainModel[],
  chainId: number,
  provider: Provider,
  mainnetProvider: Provider,
  network: string
): Promise<DetailedDomainModel[]> => {
  const domainOwnersCache = CacheLoader.ensDomainOwners(network);
  const reverseLookupCache = CacheLoader.ensReverseLookup(network);

  const registry = new Contract(
    ENS_CONTRACT_ADDRESSES[chainId.toString()].registry,
    ENS_REGISTRY_ABI
  );

  const domainsWithOwners: DetailedDomainModel[] = await mapWithMultiCall(
    domains,
    provider,
    async (domain, call) => {
      const owner = (await domainOwnersCache.getOrUpdate(domain.node, () =>
        call<string>(registry.owner(ethers.utils.hexlify(domain.node)))
      )) as string;

      return {
        ...domain,
        owner,
      };
    }
  );

  const mainnetRegistry = new Contract(
    ENS_CONTRACT_ADDRESSES["1"].registry,
    ENS_REGISTRY_ABI
  );

  const detailedDomains: DetailedDomainModel[] = await mapWithMultiCall(
    domainsWithOwners,
    mainnetProvider,
    async (domain, call) => {
      const ownerDomain = await reverseLookupCache.getOrUpdate(
        domain.owner,
        async () => {
          const reverseLookupDomain = `${domain.owner.slice(2)}.addr.reverse`;

          const resolverAddress = await call<string>(
            mainnetRegistry.resolver(
              ethers.utils.hexlify(ethers.utils.namehash(reverseLookupDomain))
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
              ethers.utils.hexlify(ethers.utils.namehash(reverseLookupDomain))
            )
          );

          return ownerDomain;
        }
      );

      return {
        ...domain,
        ownerDomain: ownerDomain as string | undefined,
      };
    }
  );

  domainOwnersCache.save();
  reverseLookupCache.save();

  return detailedDomains;
};
