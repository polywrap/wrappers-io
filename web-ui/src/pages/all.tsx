import PublishWrapperModal from "../components/PublishWrapperModal";
import Navigation from "../components/Navigation";
import { toPrettyHex } from "../utils/toPrettyHex";
import { formatNumber } from "../utils/formatNumber";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import { loadAllWrappersFromGateway } from "../utils/loadAllWrappersFromGateway";

const AllPage = (): ReactElement<any, any> => {
  const [indexedWrappers, setIndexedWrappers] = useState<any[]>([]);
  const [cidToPublish, setCidToPublish] = useState<string | undefined>();
  const [shouldShowPublishModal, setShouldShowPublishModal] = useState(false);
  const [toggleCidVersion, setToggleCidVersion] = useState(false);

  useEffect(() => {
    (async () => {
      const wrappers = await loadAllWrappersFromGateway();

      const sortedWrappers = wrappers.sort(
        (a: any, b: any) => b.downloadCount - a.downloadCount
      );

      setIndexedWrappers(sortedWrappers);
    })();
  }, []);

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
          All Wrappers
        </h2>

        <div className="widget widget-border widget-shadow">
          <table className="table" cellSpacing="3" cellPadding="3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Manifest Version</th>
                <th>Type</th>
                <th>Size</th>
                <th>Indexes</th>
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
                      <span>{wrapper.version}</span>
                    </td>
                    <td>
                      <span>{wrapper.type}</span>
                    </td>
                    <td>
                      <span>{wrapper.size}</span>
                    </td>
                    <td>
                      <span>
                        {wrapper.indexes && wrapper.indexes.length > 0 ? (
                          <>
                            {wrapper.indexes
                              .map((x: any) => x.name)
                              .reduce((a: string, b: string) => a + ", " + b)}
                          </>
                        ) : (
                          <>ipfs</>
                        )}
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

        {/* <div className="widget widget-border widget-shadow p-3 widget-small">
          <div>IPFS node: ipfs.wrappers.io</div>
          <div>
            Status: <span className="text-success">online</span>
          </div>
        </div> */}
        {/* <PersistenceGatewayWidget></PersistenceGatewayWidget> */}
        {publishModal}
        <ToastContainer />
      </div>
    </div>
  );
};

export default AllPage;
