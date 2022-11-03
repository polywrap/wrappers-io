import { LoadedWrapper } from "../../../models/LoadedWrapper";
import { setIpfsCidContenthash } from "../../../utils/ens/setIpfsCidContenthash";
import { setOcrIdAsContenthash } from "../../../utils/ocr/setOcrIdAsContenthash";
import { Network } from "../../../utils/Network";
import { EnsRegistryContract } from "../../../utils/ens/EnsRegistryContract";
import { WNS_CONTRACT_ADDRESSES } from "../../../constants";

import { namehash } from "ethers/lib/utils";
import { ethers } from "ethers";
import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";

const getCanWnsPublish = (
  chainId: number | undefined,
  wrapper: LoadedWrapper
): boolean => {
  if (!chainId) {
    return false;
  }

  const hasWnsRegistry =
    WNS_CONTRACT_ADDRESSES[chainId.toString()] &&
    WNS_CONTRACT_ADDRESSES[chainId.toString()].registry;

  return !!hasWnsRegistry && (!!wrapper.cid || !!wrapper.ocrId);
};

const PublishToWns: React.FC<{
  wrapper: LoadedWrapper;
  setWrapper: (wrapper: LoadedWrapper) => void;
}> = ({ wrapper, setWrapper }) => {
  const { library: provider, chainId, account } = useEthers();
  const [wnsDomain, setWnsDomain] = useState<string | undefined>();
  const [canWnsPublish, setCanWnsPublish] = useState(false);
  const [showPublishToWns, setShowPublishToWns] = useState(false);
  const [canPublishIpfs, setCanPublishIpfs] = useState(false);
  const [canPublishOcr, setCanPublishOcr] = useState(false);

  useEffect(() => {
    setCanWnsPublish(getCanWnsPublish(chainId, wrapper));
  }, [chainId, wrapper]);

  useEffect(() => {
    (async () => {
      setCanPublishIpfs(false);
      setCanPublishIpfs(false);

      if (
        !chainId ||
        !provider ||
        !account ||
        !wnsDomain ||
        !wnsDomain.endsWith(".wrap")
      ) {
        return;
      }

      const registry = EnsRegistryContract.create(
        WNS_CONTRACT_ADDRESSES[chainId].registry,
        provider
      );

      const owner = await registry.owner(namehash(wnsDomain));
      const resolverAddress = await registry.resolver(namehash(wnsDomain));

      if (
        owner === account &&
        resolverAddress !== ethers.constants.AddressZero
      ) {
        if (wrapper.cid) {
          setCanPublishIpfs(true);
        }

        if (wrapper.ocrId) {
          setCanPublishOcr(true);
        }
      }
    })();
  }, [chainId, account, provider, wnsDomain, wrapper]);

  const publishCIDToWns = async () => {
    const signer = provider?.getSigner();

    if (!chainId || !signer || !wnsDomain || !wrapper.cid) {
      return;
    }

    const registry = WNS_CONTRACT_ADDRESSES[chainId.toString()].registry;
    const tx = await setIpfsCidContenthash(
      wnsDomain,
      wrapper.cid,
      registry,
      signer
    );
    await tx.wait();

    setWrapper({
      ...wrapper,
      wnsDomain: {
        name: wnsDomain,
        chainId: chainId as number,
      },
    });
  };

  const publishOcrIdToWns = async () => {
    const signer = provider?.getSigner();

    if (!signer || !wnsDomain || !chainId || !wrapper.ocrId) {
      return;
    }

    const registry = WNS_CONTRACT_ADDRESSES[chainId.toString()].registry;
    const tx = await setOcrIdAsContenthash(
      wnsDomain,
      wrapper.ocrId,
      registry,
      signer
    );

    await tx.wait();

    setWrapper({
      ...wrapper,
      wnsDomain: {
        name: wnsDomain,
        chainId: chainId as number,
      },
    });
  };

  return (
    <div className="PublishToIpfs">
      <div className="registry-section wns">
        {!(wrapper.wnsDomain && chainId === wrapper.wnsDomain.chainId) && (
          <>
            {!showPublishToWns && (
              <button
                className="btn btn-success"
                onClick={() => setShowPublishToWns(true)}
                disabled={!canWnsPublish}
              >
                Publish to WNS on {Network.fromChainId(chainId as number).name}
              </button>
            )}
            {showPublishToWns && (
              <div>
                <input
                  className="form-control"
                  placeholder={`WNS domain (${
                    Network.fromChainId(chainId as number).name
                  })...`}
                  type="text"
                  onChange={(e) => setWnsDomain(e.target.value)}
                />
                {wrapper.cid && (
                  <button
                    className="btn btn-success"
                    onClick={() => publishCIDToWns()}
                    disabled={!canPublishIpfs}
                  >
                    Publish IPFS CID
                  </button>
                )}
                {wrapper.ocrId && (
                  <button
                    className="btn btn-success"
                    onClick={() => publishOcrIdToWns()}
                    disabled={!canPublishOcr}
                  >
                    Publish OCR ID
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {wrapper.wnsDomain && chainId === wrapper.wnsDomain.chainId && (
          <div className="success-back round pad">
            WNS domain: {wrapper.wnsDomain.name} (
            {Network.fromChainId(wrapper.wnsDomain.chainId).name})
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishToWns;
