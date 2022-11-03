import { LoadedWrapper } from "../../../models/LoadedWrapper";
import { WRAPPERS_GATEWAY_URL } from "../../../constants";
import { loadFilesFromIpfs } from "../../../utils/loadFilesFromIpfs";
import WrapperPageContent from "../../../components/WrapperPageContent";

import { create as createIpfsNode } from "ipfs-http-client";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";

const ipfsNode = createIpfsNode({
  url: WRAPPERS_GATEWAY_URL,
});
const WrapperPage: NextPage = () => {
  const router = useRouter();
  const cid = router.query.cid as string;

  const [wrapper, setWrapper] = useState<LoadedWrapper | undefined>();

  useEffect(() => {
    (async () => {
      if (wrapper) {
        return;
      }

      if (cid) {
        const ipfsFiles = await loadFilesFromIpfs(cid, ipfsNode);

        if (!ipfsFiles || !ipfsFiles.length) {
          return;
        }

        const wrp = {
          cid: cid,
          files: ipfsFiles,
        };

        setWrapper(wrp);
      }
    })();
  }, [wrapper, cid]);

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
