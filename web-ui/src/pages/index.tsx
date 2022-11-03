import PublishWrapperModal from "../components/PublishWrapperModal";
import Navigation from "../components/Navigation";
import { WRAPPERS_GATEWAY_URL } from "../constants";
import { toPrettyHex } from "../utils/toPrettyHex";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import "react-app-polyfill/stable";
import "react-app-polyfill/ie11";
import "core-js/features/array/find";
import "core-js/features/array/includes";
import "core-js/features/number/is-nan";
import Link from "next/link";

const Home = (): ReactElement<any, any> => {
  const [indexedWrappers, setIndexedWrappers] = useState<any[]>([]);
  const [cidToPublish, setCidToPublish] = useState<string | undefined>();
  const [shouldShowPublishModal, setShouldShowPublishModal] = useState(false);
  const [toggleCidVersion, setToggleCidVersion] = useState(false);

  useEffect(() => {
    axios.get(`${WRAPPERS_GATEWAY_URL}/pins?json=true`).then((result) => {
      setIndexedWrappers(result.data);
    });
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
        <h2 className="pt-3 pl-3 pr-3 pb-2 mt-2 mb-4 text-center">Dashboard</h2>

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
              </tr>
            </thead>
            <tbody>
              {indexedWrappers.map((wrapper: any, index) => (
                // <Link key={index} href={`/wrapper?cid=${wrapper.cid}`}>
                //   <tr>
                //     <td>
                //       <span>{wrapper.name}</span>
                //     </td>
                //     <td>
                //       <span>{wrapper.size}</span>
                //     </td>
                //     <td>{wrapper.cid}</td>
                //   </tr>
                // </Link>

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
                            {wrapper.indexes.reduce(
                              (a: string, b: string) => a + ", " + b
                            )}
                          </>
                        ) : (
                          <>ipfs</>
                        )}
                      </span>
                    </td>
                    <td>{toPrettyHex(wrapper.cid)}</td>
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

export default Home;
