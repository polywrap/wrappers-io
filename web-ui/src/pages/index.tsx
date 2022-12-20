import PublishWrapperModal from "../components/PublishWrapperModal";
import Navigation from "../components/Navigation";
import { WRAPPERS_GATEWAY_URL } from "../constants";
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

const Home = (): ReactElement<any, any> => {
  const [indexedWrappers, setIndexedWrappers] = useState<any[]>([]);
  const [cidToPublish, setCidToPublish] = useState<string | undefined>();
  const [shouldShowPublishModal, setShouldShowPublishModal] = useState(false);
  const [toggleCidVersion, setToggleCidVersion] = useState(false);

  useEffect(() => {
    axios.get(`${WRAPPERS_GATEWAY_URL}/pins?json=true`).then((result) => {
      const wrappers = result.data.sort(
        (a: any, b: any) => b.downloadCount - a.downloadCount
      );

      const map: Record<string, any> = {};

      for (const wrapper of wrappers) {
        for (const index of wrapper.indexes) {
          if (index.ens) {
            for (const ensInfo of index.ens) {
              if (ensInfo.domain) {
                map[ensInfo.domain] = wrapper;
              }
            }
          }
        }
      }

      setIndexedWrappers(
        Object.keys(map).map((x) => ({
          domain: x,
          cid: map[x].cid,
          downloadCount: map[x].downloadCount,
          indexes: map[x].indexes,
        }))
      );
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
        <h2 className="pt-3 pl-3 pr-3 pb-2 mt-2 mb-4 text-center">
          ENS wrappers
        </h2>

        <div className="widget widget-border widget-shadow">
          <table className="table" cellSpacing="3" cellPadding="3">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Network</th>
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
                      <span>{wrapper.domain}</span>
                    </td>
                    <td>
                      <span>
                        {wrapper.indexes && wrapper.indexes.length > 0 ? (
                          <>
                            {wrapper.indexes
                              .map((x: any) => x.name.slice(4, x.name.length))
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
        {publishModal}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Home;
