import Navigation from "../../components/Navigation";
import { toPrettyHex } from "../../utils/toPrettyHex";
import { formatNumber } from "../../utils/formatNumber";
import { getWrappersWithEnsOwnerInfo } from "../../utils/getWrappersWithEnsOwnerInfo";
import { groupBy } from "../../utils/groupBy";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useEthers } from "@usedapp/core";
import Link from "next/link";

const ControllersPage = (): ReactElement<any, any> => {
  const { library: provider, chainId } = useEthers();
  const [controllers, setControllers] = useState<any[]>([]);

  useEffect(() => {
    if (!provider || !chainId) {
      return;
    }

    (async () => {
      const wrappersWithENS = await getWrappersWithEnsOwnerInfo(
        provider,
        chainId
      );

      const groupedWrappers = groupBy(
        wrappersWithENS,
        (x) => `${x.owner}-${x.network}`
      );

      const allControllers = Object.keys(groupedWrappers).map((key) => {
        const owner = key.split("-")[0];
        const network = key.split("-")[1];
        return {
          address: owner,
          name: groupedWrappers[key][0].ownerDomain,
          network: network,
          wrapperCount: groupedWrappers[key].length,
          downloadCount: groupedWrappers[key].reduce(
            (acc, wrapper) => acc + wrapper.downloadCount,
            0
          ),
        };
      });

      const sortedControllers = allControllers
        .sort((a: any, b: any) => b.wrapperCount - a.wrapperCount)
        .sort((a: any, b: any) =>
          a.network > b.network ? 1 : a.network < b.network ? -1 : 0
        );

      setControllers(sortedControllers);
    })();
  }, [provider, chainId]);

  return (
    <div>
      <Navigation></Navigation>
      <div className="page container-xl">
        <h2 className="pt-3 pl-3 pr-3 pb-2 mt-2 mb-4 text-center">
          ENS Controllers
        </h2>

        <div className="widget widget-border widget-shadow">
          <table className="table" cellSpacing="3" cellPadding="3">
            <thead>
              <tr>
                <th>Address</th>
                <th>Network</th>
                <th>Wrappers</th>
                <th>Wrapper downloads</th>
              </tr>
            </thead>
            <tbody>
              {controllers.map((controller: any, index) => (
                <Link key={index} href={`/controllers/${controller.address}`}>
                  <tr key={index}>
                    <td>
                      <span>
                        {controller.name ?? toPrettyHex(controller.address)}
                      </span>
                    </td>
                    <td>
                      <span>{controller.network}</span>
                    </td>
                    <td>
                      <span>{formatNumber(controller.wrapperCount, 2)}</span>
                    </td>
                    <td>
                      <span>{formatNumber(controller.downloadCount, 2)}</span>
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

export default ControllersPage;
