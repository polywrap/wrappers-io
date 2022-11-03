import { LoadedWrapper } from "../../../models/LoadedWrapper";
import { setIpfsCidContenthash } from "../../../utils/ens/setIpfsCidContenthash";
import { setOcrIdAsContenthash } from "../../../utils/ocr/setOcrIdAsContenthash";
import { Network } from "../../../utils/Network";
import { ENS_CONTRACT_ADDRESSES } from "../../../constants";

import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";

const getCanEnsPublish = (
  chainId: number | undefined,
  wrapper: LoadedWrapper
): boolean => {
  if (!chainId) {
    return false;
  }

  const hasEnsRegistry =
    ENS_CONTRACT_ADDRESSES[chainId.toString()] &&
    ENS_CONTRACT_ADDRESSES[chainId.toString()].registry;

  return !!hasEnsRegistry && (!!wrapper.cid || !!wrapper.ocrId);
};

const PublishToEns: React.FC<{
  wrapper: LoadedWrapper;
  setWrapper: (wrapper: LoadedWrapper) => void;
}> = ({ wrapper, setWrapper }) => {
  const { library: provider, chainId } = useEthers();
  const [ensDomain, setEnsDomain] = useState<string | undefined>();
  const [canEnsPublish, setCanEnsPublish] = useState(false);
  const [showPublishToEns, setShowPublishToEns] = useState(false);
  const [canPublishIpfs, setCanPublishIpfs] = useState(false);
  const [canPublishOcr, setCanPublishOcr] = useState(false);

  useEffect(() => {
    setCanEnsPublish(getCanEnsPublish(chainId, wrapper));
  }, [chainId, wrapper]);

  useEffect(() => {
    setCanPublishIpfs(false);
    setCanPublishIpfs(false);

    if (!chainId || !ensDomain || !ensDomain.endsWith(".eth")) {
      return;
    }

    if (wrapper.cid) {
      setCanPublishIpfs(true);
    }

    if (wrapper.ocrId) {
      setCanPublishOcr(true);
    }
  }, [chainId, ensDomain, wrapper]);

  const publishCIDToEns = async () => {
    const signer = provider?.getSigner();

    if (!signer || !ensDomain || !wrapper.cid) {
      return;
    }

    if (!chainId || !signer || !ensDomain || !wrapper.cid) {
      return;
    }

    const registry = ENS_CONTRACT_ADDRESSES[chainId.toString()].registry;
    await setIpfsCidContenthash(ensDomain, wrapper.cid, registry, signer);

    setWrapper({
      ...wrapper,
      ensDomain: {
        name: ensDomain,
        chainId: chainId as number,
      },
    });
  };

  const publishOcrIdToEns = async () => {
    const signer = provider?.getSigner();

    if (!signer || !ensDomain || !chainId || !wrapper.ocrId) {
      return;
    }

    const registry = ENS_CONTRACT_ADDRESSES[chainId.toString()].registry;
    const tx = await setOcrIdAsContenthash(
      ensDomain,
      wrapper.ocrId,
      registry,
      signer
    );
    await tx.wait();

    setWrapper({
      ...wrapper,
      ensDomain: {
        name: ensDomain,
        chainId: chainId as number,
      },
    });
  };

  return (
    <div className="PublishToIpfs m-2">
      <div className="registry-section ens">
        {!(wrapper.ensDomain && chainId === wrapper.ensDomain.chainId) && (
          <>
            {!showPublishToEns && (
              <button
                className="btn btn-success"
                onClick={() => setShowPublishToEns(true)}
                disabled={!canEnsPublish}
              >
                Publish to ENS on {Network.fromChainId(chainId as number).name}
              </button>
            )}
            {showPublishToEns && (
              <div className="d-flex">
                <input
                  className="form-control"
                  placeholder={`ENS domain (${
                    Network.fromChainId(chainId as number).name
                  })...`}
                  type="text"
                  onChange={(e) => setEnsDomain(e.target.value)}
                />
                {wrapper.cid && (
                  <button
                    className="btn btn-success ml-1 text-nowrap"
                    onClick={() => publishCIDToEns()}
                    disabled={!canPublishIpfs}
                  >
                    Publish IPFS CID
                  </button>
                )}
                {wrapper.ocrId && (
                  <button
                    className="btn btn-success text-nowrap ml-1"
                    onClick={() => publishOcrIdToEns()}
                    disabled={!canPublishOcr}
                  >
                    Publish OCR ID
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {wrapper.ensDomain && chainId === wrapper.ensDomain.chainId && (
          <div className="success-back round pad">
            ENS domain: {wrapper.ensDomain.name} (
            {Network.fromChainId(wrapper.ensDomain.chainId).name})
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishToEns;
