import { OcrPackageInfo } from "../../models/OcrPackageInfo";
import { OcrContract } from "./OcrContract";

import { ethers } from "ethers";
import { OcrId } from "@nerfzael/ocr-core";

export const fetchPackageInfo = async (
  ocrId: OcrId,
  provider: ethers.providers.Provider
): Promise<OcrPackageInfo> => {
  const packageInfo = await OcrContract.create(
    ocrId.protocolVersion,
    ocrId.contractAddress,
    provider
  ).package(ocrId.packageIndex);

  return {
    ...packageInfo,
    packageIndex: ocrId.packageIndex,
  } as OcrPackageInfo;
};
