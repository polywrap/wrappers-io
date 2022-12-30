import PublishWrapperModal from "../components/PublishWrapperModal";
import Navigation from "../components/Navigation";
import { toPrettyHex } from "../utils/toPrettyHex";
import { formatNumber } from "../utils/formatNumber";
import { getWrappersWithEnsOwnerInfo } from "../utils/getWrappersWithEnsOwnerInfo";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import { useEthers } from "@usedapp/core";

const Home = (): ReactElement<any, any> => {
  const { library: provider, chainId, account } = useEthers();
  const [wrappers, setWrappers] = useState<any[]>([]);
  const [toggleCidVersion, setToggleCidVersion] = useState(false);
  const [wrapperCount, setWrapperCount] = useState<number | undefined>();

  useEffect(() => {
    if (!provider || !chainId) {
      return;
    }

    (async function () {
      const wrappersWithENS = await getWrappersWithEnsOwnerInfo(
        provider,
        chainId
      );

      const sortedWrappers = wrappersWithENS.sort(
        (a: any, b: any) => b.downloadCount - a.downloadCount
      ).sort((a: any, b: any) =>
        a.network < b.network ? 1 : a.network > b.network ? -1 : 0
      );;

      setWrappers(sortedWrappers);
      setWrapperCount(sortedWrappers.length);
    })();
  }, [provider, chainId]);

  return (
    <div>
      <Navigation></Navigation>
      <div className="page container-xl">
        <h2 className="pt-3 pl-3 pr-3 pb-2 mt-2 mb-4 text-center">
          ENS Wrappers {wrapperCount ? `(${wrapperCount})` : ""}
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
              {wrappers.map((wrapper: any, index) => (
                <Link
                  key={index}
                  href={
                    wrapper.ens.domain
                      ? `/v/ens/${wrapper.network}/${wrapper.ens.domain}`
                      : `/v/ipfs/${wrapper.cid}`
                  }
                >
                  <tr key={index}>
                    <td>
                      <span>{wrapper.name}</span>
                    </td>
                    <td>
                      <span>{wrapper.ens.domain ?? "Unknown"}</span>
                    </td>
                    <td>
                      <span>{wrapper.network}</span>
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
        <ToastContainer />
      </div>
    </div>
  );
};

export default Home;
