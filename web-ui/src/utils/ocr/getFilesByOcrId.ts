import { fetchPackageDataV1 } from "./fetchPackageDataV1";
import {
  OCR_BYTES_FOR_FILE_PATH,
  OCR_BYTES_FOR_FILE_SIZE,
} from "../../constants";

import { ethers } from "ethers";
import { decodeFiles } from "@nerfzael/encoding";
import { OcrId } from "@nerfzael/ocr-core";
import { InMemoryFile } from "@nerfzael/memory-fs";

export const getFilesByOcrId = async (
  ocrId: OcrId,
  provider: ethers.providers.Provider
): Promise<InMemoryFile[]> => {
  if (ocrId.protocolVersion !== 1) {
    throw new Error(`Unsupported OCR version: ${ocrId.protocolVersion}`);
  }

  const data = await fetchPackageDataV1(ocrId, provider);

  return decodeFiles(data, OCR_BYTES_FOR_FILE_PATH, OCR_BYTES_FOR_FILE_SIZE);
};
