import { Network } from "../utils/Network";
import { WNS_CONTRACT_ADDRESSES } from "../constants";
import { EnsRegistryContract } from "../utils/ens/EnsRegistryContract";
import { EnsResolverContract } from "../utils/ens/EnsResolverContract";
import { labelhash } from "../utils/ens/labelhash";
import { getCidFromContenthash } from "../utils/getCidFromContenthash";
import { WrapFifsRegistrarContract } from "../utils/wns/WrapFifsRegistrar";

import { toast } from "react-toastify";
import { decodeOcrIdFromContenthash, OcrId } from "@nerfzael/ocr-core";
import { ethers } from "ethers";
import { useEthers } from "@usedapp/core";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

const WnsModal: React.FC<{
  shouldShow: boolean;
  handleClose: () => void;
}> = ({ shouldShow, handleClose }) => {
  const { library: provider, chainId, account } = useEthers();
  const [wnsDomain, setWnsDomain] = useState<string | undefined>();
  const [canRegisterDomain, setCanRegisterDomain] = useState(false);
  const [domainOwner, setDomainOwner] = useState<string | undefined>();
  const [cid, setCid] = useState<string | undefined>();
  const [ocrId, setOcrId] = useState<OcrId | undefined>();
  const [canClaimDomain, setCanClaimDomain] = useState(false);

  const refreshDomainInfo = useCallback(() => {
    (async () => {
      setCanRegisterDomain(false);
      setCanClaimDomain(false);
      setDomainOwner(undefined);

      if (!provider || !chainId || !wnsDomain || !wnsDomain.endsWith(".wrap")) {
        return;
      }

      const registry = EnsRegistryContract.create(
        WNS_CONTRACT_ADDRESSES[chainId].registry,
        provider
      );

      const owner = await registry.owner(ethers.utils.namehash(wnsDomain));
      setDomainOwner(owner);

      const resolverAddress = await registry.resolver(
        ethers.utils.namehash(wnsDomain)
      );
      if (resolverAddress && resolverAddress !== ethers.constants.AddressZero) {
        const resolver = EnsResolverContract.create(resolverAddress, provider);

        const contenthash = await resolver.contenthash(
          ethers.utils.namehash(wnsDomain)
        );
        const savedCid = getCidFromContenthash(contenthash);

        if (savedCid) {
          setCid(savedCid);
        } else {
          const savedOcrId = decodeOcrIdFromContenthash(contenthash);
          if (savedOcrId) {
            setOcrId(savedOcrId);
          }
        }
      }

      if (
        wnsDomain.endsWith(".dev.wrap") &&
        owner === ethers.constants.AddressZero
      ) {
        if (wnsDomain.split(".").length === 3) {
          setCanClaimDomain(true);
        }

        setCanRegisterDomain(true);
      }
    })();
  }, [provider, chainId, wnsDomain]);

  useEffect(() => {
    refreshDomainInfo();
  }, [refreshDomainInfo]);

  const claimDomain = async () => {
    if (!chainId || !provider || !wnsDomain) {
      return;
    }

    const fifsRegistrar = WrapFifsRegistrarContract.create(
      WNS_CONTRACT_ADDRESSES[chainId].fifsRegistrar,
      provider.getSigner()
    );

    const tx = await fifsRegistrar.register(
      labelhash(wnsDomain.split(".")[0]),
      account
    );
    await tx.wait();

    toast.success("Domain claimed successfully");

    refreshDomainInfo();
  };

  return (
    <Modal
      size="lg"
      show={shouldShow}
      onHide={handleClose}
      contentClassName="bg-dark WnsModal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Wrap Name System</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <input
            className="form-control"
            placeholder={`WNS domain (${
              Network.fromChainId(chainId as number).name
            })...`}
            type="text"
            onChange={(e) => setWnsDomain(e.target.value)}
          />
          {domainOwner && (
            <div>
              <div>Owner: {domainOwner}</div>
            </div>
          )}
          {cid && (
            <div>
              <div>IPFS CID: {cid}</div>
            </div>
          )}
          {ocrId && (
            <div>
              <div>
                <span>ChainId: {ocrId.chainId}</span>
              </div>
              <div>
                <span>Protocol version: {ocrId.protocolVersion}</span>
              </div>
              <div>
                <span>Contract: {ocrId.contractAddress}</span>
              </div>
              <div>
                <span>Package index: {ocrId.packageIndex}</span>
              </div>
              <div>
                <span>Start block: {ocrId.startBlock}</span>
              </div>
              <div>
                <span>End block: {ocrId.endBlock}</span>
              </div>
            </div>
          )}
          {wnsDomain && canRegisterDomain && (
            <button className="btn btn-success" disabled={!canRegisterDomain}>
              Register
            </button>
          )}
          {wnsDomain && canClaimDomain && (
            <button
              className="btn btn-success"
              onClick={() => claimDomain()}
              disabled={!canClaimDomain}
            >
              Claim
            </button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default WnsModal;
