import { OcrContract } from "./OcrContract";
import { MAX_OCR_PACKAGE_SIZE } from "../../constants";

import { OcrId } from "@nerfzael/ocr-core";
import { BigNumber, Signer } from "ethers";

export const publishDataToOcr = async (
  data: Uint8Array,
  chainId: number,
  protocolVersion: number,
  contractAddress: string,
  signer: Signer
): Promise<OcrId> => {
  const repository = OcrContract.create(
    protocolVersion,
    contractAddress,
    signer
  );

  const partCount = Math.floor(data.byteLength / MAX_OCR_PACKAGE_SIZE) + 1;
  let packageIndex: BigNumber = BigNumber.from(0);
  for (let i = 0; i < partCount; i++) {
    const part = data.slice(
      i * MAX_OCR_PACKAGE_SIZE,
      (i + 1) * MAX_OCR_PACKAGE_SIZE
    );
    if (i === 0) {
      const tx = await repository.startPublish(part, partCount === 1);
      const receipt = await tx.wait();
      const event = receipt.events ? receipt.events[0] : undefined;
      packageIndex = event?.args?.packageIndex;
    } else {
      const tx = await repository.publishPart(
        packageIndex,
        part,
        i === partCount - 1
      );
      await tx.wait();
    }
  }

  const packageInfo = await repository.package(packageIndex);

  return {
    chainId,
    protocolVersion,
    contractAddress,
    packageIndex: packageIndex.toNumber(),
    startBlock: packageInfo.startBlock.toNumber(),
    endBlock: packageInfo.endBlock.toNumber(),
  };
};
