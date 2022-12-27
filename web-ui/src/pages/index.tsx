import PublishWrapperModal from "../components/PublishWrapperModal";
import Navigation from "../components/Navigation";
import { ENS_CONTRACT_ADDRESSES, WRAPPERS_GATEWAY_URL } from "../constants";
import { toPrettyHex } from "../utils/toPrettyHex";
import { formatNumber } from "../utils/formatNumber";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import "react-app-polyfill/stable";
import "react-app-polyfill/ie11";
import "core-js/features/array/find";
import "core-js/features/array/includes";
import "core-js/features/number/is-nan";
import Link from "next/link";
import { ethers } from "ethers";
import { useEthers } from "@usedapp/core";
import { Contract, Provider } from "ethers-multicall";
import { EnsRegistryContract } from "../utils/ens/EnsRegistryContract";
import { Network } from "../utils/Network";
import { getProvider } from "../utils/getProvider";

const populateOwners = async (wrappers: any[], registry: Contract, provider: Provider, network: string) => {
  const ownerCalls = wrappers.map(x => {
    return registry.owner(ethers.utils.hexlify(x.ens.node))
  });
  const owners = await provider.all(ownerCalls);

  console.log("owners " + network, owners);

  const resolverCalls = owners.map((x, i) => {
    wrappers[i].owner = x;
    return registry.resolver(ethers.utils.hexlify(ethers.utils.namehash(`${x.slice(2)}.addr.reverse`)))
  });
  const resolvers = await provider.all(resolverCalls);

  console.log("resolvers " + network, resolvers);

  const wrappersToUpdate: any[] = [];
  const ownerDomainCalls = resolvers.map((x, i) => {
    if (x === "0x0000000000000000000000000000000000000000") {
      return undefined;
    }
    const resolver = new Contract(x,  [
      "function name(bytes32) external view returns(string)",
    ]);
    console.log("wrapper " + network, wrappers[i]);
    wrappersToUpdate.push(wrappers[i]);
    return resolver.name(ethers.utils.hexlify(ethers.utils.namehash(`${owners[i].slice(2)}.addr.reverse`)))
  }).filter(x => x);
  const ownerDomains = await provider.all(ownerDomainCalls);

  console.log("ownerDomains " + network, ownerDomains);

  ownerDomains.forEach((x, i) => {
    wrappersToUpdate[i].ownerDomain = x;
  });
};

const Home = (): ReactElement<any, any> => {
    const { library: provider, chainId, account } = useEthers();
  const [indexedWrappers, setIndexedWrappers] = useState<any[]>([]);
  const [cidToPublish, setCidToPublish] = useState<string | undefined>();
  const [shouldShowPublishModal, setShouldShowPublishModal] = useState(false);
  const [toggleCidVersion, setToggleCidVersion] = useState(false);

  useEffect(() => {
    if (!provider || !chainId) {
      return;
    }

    console.log("AAAAAAAAAAAAA");
    console.log("provider", provider);
    console.log("chainId", chainId);

    axios.get(`${WRAPPERS_GATEWAY_URL}/pins?json=true`).then((result) => {
      const wrappers = result.data.sort(
        (a: any, b: any) => b.downloadCount - a.downloadCount
      ).flatMap(x => {
        return x.indexes.flatMap(y => {
          return y.ens.map(z => {
            return {
              ...x,
              network: y.name.slice(4, x.name.length),
              ens: z,
            }
          });
        })
      });

      console.log("Wrappers", wrappers);

      (async function() {

        const providers = {
          "goerli": new Provider(getProvider(Network.fromNetworkName("goerli").chainId, chainId, provider)!),
          "mainnet": new Provider(getProvider(Network.fromNetworkName("mainnet").chainId, chainId, provider)!)
        };

        await providers["goerli"].init();
        await providers["mainnet"].init();

        const registry = new Contract(ENS_CONTRACT_ADDRESSES["1"].registry,  [
            "function owner(bytes32 node) external view returns (address)",
            "function resolver(bytes32 node) external view returns (address)",
            "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external",
          ]);
          
        const mainnetWrappers = wrappers.filter(x => x.network === "mainnet");
        await populateOwners(mainnetWrappers, registry, providers["mainnet"], "mainnet");

        const goerliWrappers = wrappers.filter(x => x.network === "goerli");
        await populateOwners(goerliWrappers, registry, providers["goerli"], "goerli");
       
        const wrappersWithENS = mainnetWrappers.concat(goerliWrappers);
        console.log("wrappersWithENS", wrappersWithENS);
        setIndexedWrappers(
          wrappersWithENS
        );
      })();
    });
  }, [provider, chainId]);

  const publishModal =
    cidToPublish || shouldShowPublishModal ? (
      <PublishWrapperModal
        publishedCID={cidToPublish}
        handleClose={() => {
          setCidToPublish(undefined);
          setShouldShowPublishModal(false);
        }}
      />
    ) : (
      ""
    );

  return (
    <div>
      <Navigation></Navigation>
      <div className="page container-xl">
        <h2 className="pt-3 pl-3 pr-3 pb-2 mt-2 mb-4 text-center">
          ENS wrappers
        </h2>

        <div className="widget widget-border widget-shadow">
          <table className="table" cellSpacing="3" cellPadding="3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Domain</th>
                <th>Network</th>
                <th>Controller</th>
                <th onClick={() => setToggleCidVersion(!toggleCidVersion)}>
                  CID
                </th>
                <th>Downloads</th>
              </tr>
            </thead>
            <tbody>
              {indexedWrappers.map((wrapper: any, index) => (
                <Link key={index} href={`/v/ipfs/${wrapper.cid}`}>
                  <tr key={index}>
                    <td>
                      <span>{wrapper.name}</span>
                    </td>
                    <td>
                      <span>{wrapper.ens.domain ?? "Unknown"}</span>
                    </td>
                    <td>
                      <span>
                        {wrapper.network}
                      </span>
                    </td>
                    <td>
                      <span>
                        {wrapper.ownerDomain ?? toPrettyHex(wrapper.owner)}
                      </span>
                    </td>
                    <td>{toPrettyHex(wrapper.cid)}</td>
                    <td>
                      <span>{formatNumber(wrapper.downloadCount, 2)}</span>
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
        {publishModal}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Home;
