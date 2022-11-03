import LoadedWrapperView from "./LoadedWrapperView";
import { LoadedWrapper } from "../models/LoadedWrapper";
import { WrapperInfo } from "../models/WrapperInfo";
import { PublishedWrapper } from "../models/PublishedWrapper";
import { WRAPPERS_GATEWAY_URL } from "../constants";
import LoadWrapper from "./LoadWrapper";

import { create as createIpfsNode } from "ipfs-http-client";
import { useEthers } from "@usedapp/core";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

const ipfsNode = createIpfsNode({
  url: WRAPPERS_GATEWAY_URL,
});
const PublishWrapperModal: React.FC<{
  publishedCID: string | undefined;
  handleClose: () => void;
}> = ({ publishedCID, handleClose }) => {
  const { chainId } = useEthers();
  const [wrapper, setWrapper] = useState<LoadedWrapper | undefined>();
  const [wrapperInfo, setWrapperInfo] = useState<WrapperInfo>();
  const [publishedWrapper, setPublishedWrapper] = useState<
    PublishedWrapper | undefined
  >();

  useEffect(() => {
    if (publishedCID) {
      setPublishedWrapper({
        cid: publishedCID,
      });
    }
  }, [publishedCID]);

  return (
    <Modal
      size="lg"
      show={true}
      onHide={handleClose}
      contentClassName="bg-dark PublishWrapperModal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {wrapperInfo && wrapperInfo.name && <span>{wrapperInfo.name}</span>}
          {!(wrapperInfo && wrapperInfo.name) && <span>Load wrapper</span>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <LoadWrapper
            publishedWrapper={publishedWrapper}
            ipfsNode={ipfsNode}
            setLoadedWrapper={setWrapper}
          ></LoadWrapper>
          {wrapper && (
            <LoadedWrapperView
              wrapper={wrapper}
              setWrapper={setWrapper}
              ipfsNode={ipfsNode}
              setLoadedWrapperInfo={setWrapperInfo}
            ></LoadedWrapperView>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PublishWrapperModal;
