import { LoadedWrapper } from "../../../../../models/LoadedWrapper";
import { WRAPPERS_GATEWAY_URL } from "../../../../../constants";
import { getFilesByOcrId } from "../../../../../utils/ocr/getFilesByOcrId";
import { getProvider } from "../../../../../utils/getProvider";
import { Network } from "../../../../../utils/Network";
import { OcrCoreContract } from "../../../../../utils/ocr/OcrCoreContract";
import { OcrContract } from "../../../../../utils/ocr/OcrContract";
import { OcrPackageInfo } from "../../../../../models/OcrPackageInfo";
import WrapperPageContent from "../../../../../components/WrapperPageContent";

import { OcrId } from "@nerfzael/ocr-core";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { create as createIpfsNode } from "ipfs-http-client";

const ipfsNode = createIpfsNode({
  url: WRAPPERS_GATEWAY_URL,
});
const WrapperPage: NextPage = () => {
  const router = useRouter();
  const network = router.query.network as string;
  const ocrContract = router.query.ocrContract as string;
  const packageIndex = parseInt(router.query.packageIndex as string);

  const { chainId, library: provider } = useEthers();
  const [wrapper, setWrapper] = useState<LoadedWrapper | undefined>();

  useEffect(() => {
    (async () => {
      if (wrapper || !provider || !chainId) {
        return;
      }

      const routeChainId = Network.fromNetworkName(network).chainId;
      const readOnlyProvider = getProvider(routeChainId, chainId, provider);

      const coreContract = OcrCoreContract.create(ocrContract, provider);
      const protocolVersion = await coreContract.protocolVersion();

      const contract = OcrContract.create(
        protocolVersion.toNumber(),
        ocrContract,
        provider
      );

      const packageInfo: OcrPackageInfo = await contract.package(packageIndex);

      if (packageInfo.endBlock.toNumber() === 0) {
        return;
      }

      const ocrId = {
        chainId: routeChainId,
        contractAddress: ocrContract,
        packageIndex: packageIndex,
        protocolVersion: 1,
        startBlock: packageInfo.startBlock.toNumber(),
        endBlock: packageInfo.endBlock.toNumber(),
      } as OcrId;

      if (!readOnlyProvider) {
        return;
      }

      const packageFiles = await getFilesByOcrId(ocrId, readOnlyProvider);

      if (!packageFiles || !packageFiles.length) {
        return;
      }

      const wrp = {
        ocrId,
        files: packageFiles,
      };

      setWrapper(wrp);
    })();
  }, [wrapper, packageIndex, network, ocrContract, provider, chainId]);

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
