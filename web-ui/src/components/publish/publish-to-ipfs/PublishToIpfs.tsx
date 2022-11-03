import { publishFilesToIpfs } from "../../../utils/publishFilesToIpfs";
import { LoadedWrapper } from "../../../models/LoadedWrapper";

import { useEffect, useState } from "react";
import { Polygon, Rinkeby, useEthers, Localhost } from "@usedapp/core";
import { IPFSHTTPClient } from "ipfs-http-client";

const getCanIpfsPublish = (
  chainId: number | undefined,
  wrapper: LoadedWrapper
): boolean => {
  let hasOcrRepo = false;
  if (
    chainId === Rinkeby.chainId ||
    chainId === Polygon.chainId ||
    chainId === Localhost.chainId
  ) {
    hasOcrRepo = true;
  }

  if (wrapper.cid) {
    return false;
  }

  return !!wrapper.files.length || (hasOcrRepo && !!wrapper.ocrId);
};

const PublishToIpfs: React.FC<{
  wrapper: LoadedWrapper;
  setWrapper: (wrapper: LoadedWrapper) => void;
  ipfsNode: IPFSHTTPClient;
}> = ({ wrapper, setWrapper, ipfsNode }) => {
  const [canIpfsPublish, setCanIpfsPublish] = useState(false);
  const { chainId } = useEthers();

  useEffect(() => {
    setCanIpfsPublish(getCanIpfsPublish(chainId, wrapper));
  }, [chainId, wrapper]);

  const publishToIpfs = async () => {
    if (wrapper.files.length > 0) {
      const publishedCID = await publishFilesToIpfs(wrapper.files, ipfsNode);
      if (!publishedCID) {
        return;
      }

      setWrapper({
        ...wrapper,
        cid: publishedCID,
      });
    }
  };

  return (
    <div className="PublishToIpfs m-2">
      <div className="registry-section ipfs">
        {!wrapper.cid && (
          <button
            className="btn btn-success"
            disabled={!canIpfsPublish}
            onClick={async (e) => {
              publishToIpfs();
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Publish to IPFS
          </button>
        )}
        {wrapper.cid && (
          <div className="success-back round pad">IPFS CID: {wrapper.cid}</div>
        )}
      </div>
    </div>
  );
};

export default PublishToIpfs;
