import { LoadedWrapper } from "../../models/LoadedWrapper";
import { WRAPPERS_GATEWAY_URL } from "../../constants";
import WrapperPageContent from "../../components/WrapperPageContent";

import { create as createIpfsNode } from "ipfs-http-client";
import { useState } from "react";
import { NextPage } from "next";

const ipfsNode = createIpfsNode({
  url: WRAPPERS_GATEWAY_URL,
});
const WrapperPage: NextPage = () => {
  const [wrapper, setWrapper] = useState<LoadedWrapper | undefined>();

  return (
    <>
      <WrapperPageContent
        wrapper={wrapper}
        setWrapper={setWrapper}
        ipfsNode={ipfsNode}
      ></WrapperPageContent>
    </>
  );
};

export default WrapperPage;
