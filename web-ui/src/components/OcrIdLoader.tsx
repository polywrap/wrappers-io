import { OcrPackageInfo } from "../models/OcrPackageInfo";
import { OcrContract } from "../utils/ocr/OcrContract";
import { OcrCoreContract } from "../utils/ocr/OcrCoreContract";

import { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { OcrId } from "@nerfzael/ocr-core";

const OcrIdLoader: React.FC<{
  setOcrId: (ocrId: OcrId) => void;
}> = ({ setOcrId }) => {
  const { library: provider, chainId } = useEthers();
  const [contractAddress, setContractAddress] = useState<string | undefined>();
  const [packageIndex, setPackageIndex] = useState<number | undefined>();

  useEffect(() => {
    (async () => {
      if (
        provider &&
        chainId &&
        packageIndex &&
        contractAddress &&
        ethers.utils.isAddress(contractAddress) &&
        Number.isInteger(packageIndex)
      ) {
        const coreContract = OcrCoreContract.create(contractAddress, provider);
        const protocolVersion = await coreContract.protocolVersion();

        const contract = OcrContract.create(
          protocolVersion.toNumber(),
          contractAddress,
          provider
        );

        const packageInfo: OcrPackageInfo = await contract.package(
          packageIndex
        );

        if (packageInfo.endBlock.toNumber() === 0) {
          return;
        }

        setOcrId({
          chainId,
          protocolVersion: protocolVersion.toNumber(),
          contractAddress,
          packageIndex,
          startBlock: packageInfo.startBlock.toNumber(),
          endBlock: packageInfo.endBlock.toNumber(),
        });
      }
    })();
  }, [provider, chainId, packageIndex, contractAddress, setOcrId]);

  return (
    <div className="OcrIdLoader">
      <input
        className="form-control"
        placeholder="Contract address..."
        type="text"
        onChange={(e) => setContractAddress(e.target.value)}
      />
      <input
        className="form-control"
        placeholder="Package index..."
        type="text"
        onChange={(e) => setPackageIndex(parseInt(e.target.value))}
      />
    </div>
  );
};

export default OcrIdLoader;
