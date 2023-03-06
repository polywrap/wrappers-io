import Navigation from "../components/Navigation";
import { toPrettyHex } from "../utils/toPrettyHex";
import { formatNumber } from "../utils/formatNumber";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import { useEthers } from "@usedapp/core";
import { getEnsDomains } from "../utils/getEnsDomains";
import { Network } from "../utils/Network";
import { WrapperEnsModel } from "../models/WrapperEnsModel";

const Home = (): ReactElement<any, any> => {
  const { library: provider, chainId, account } = useEthers();
  const [domains, setDomains] = useState<any[]>([]);
  const [toggleCidVersion, setToggleCidVersion] = useState(false);
  const [wrapperCount, setWrapperCount] = useState<number | undefined>();
  const [network, setNetwork] = useState<string>();
  const [wrappers, setWrappers] = useState<WrapperEnsModel[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean | undefined>();

  useEffect(() => {
    if (!provider || !chainId) {
      return;
    }

    (async function () {
      setIsLoading(true);

      const [ensDomains, wrappers] = await getEnsDomains(
        provider,
        chainId,
        Network.fromChainId(chainId).name
      );

      setWrappers(wrappers);

      setNetwork(Network.fromChainId(chainId).label);
      setDomains(ensDomains);
      setWrapperCount(ensDomains.length);
      setIsLoading(false);
    })();
  }, [provider, chainId]);

  return (
    <div>
      <Navigation></Navigation>
      <div className="page container-xl">
        <h2 className="pt-3 pl-3 pr-3 pb-2 mt-2 mb-4 text-center">
          {
            isLoading
            ? <>Loading...</>
            : <>
              {
                network
                ? <>ENS on {network} {wrapperCount ? `(${wrapperCount})` : ""}</>
                : <>Connect your wallet to view wrappers</>
              }
              </>
          }

        </h2>

        {domains.map((ensDomain: any, index) => (
          <div className="widget widget-border widget-shadow spacing padding">
            <div key={index}>
              <div>
                Domain: {ensDomain.domain ?? "Unknown"} 
              </div> 
              <div>
                Owner: {ensDomain.ownerDomain ?? toPrettyHex(ensDomain.owner)}
              </div>
              {
                wrappers?.find(x => x.ens.node === ensDomain.node) 
                ? <>
                <span>CID: &nbsp;
                  
                  <Link
                    key={index}
                    href={`/v/ipfs/${wrappers?.find(x => x.ens.node === ensDomain.node)?.cid}`}
                  >
                    {wrappers?.find(x => x.ens.node === ensDomain.node)?.cid}
                  </Link>
                </span>
                </>
                : <></>
              }
              <div>
              {ensDomain.textRecords.map(x => (
                <div>
                  {x.key.slice(5)}: {x.value}
                </div>
              ))}
              </div>
            </div>
          </div>
        ))}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Home;
