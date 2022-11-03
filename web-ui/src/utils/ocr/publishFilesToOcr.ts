import { publishDataToOcr } from "./publishDataToOcr";
import {
  OCR_BYTES_FOR_FILE_PATH,
  OCR_BYTES_FOR_FILE_SIZE,
} from "../../constants";

import { encodeFiles } from "@nerfzael/encoding";
import { InMemoryFile } from "@nerfzael/memory-fs";
import { OcrId } from "@nerfzael/ocr-core";
import { Signer } from "ethers";

export const publishFilesToOcr = async (
  files: InMemoryFile[],
  chainId: number,
  protocolVersion: number,
  contractAddress: string,
  signer: Signer
): Promise<OcrId> => {
  const data = encodeFiles(
    files,
    OCR_BYTES_FOR_FILE_PATH,
    OCR_BYTES_FOR_FILE_SIZE
  );

  const ocrId = await publishDataToOcr(
    data,
    chainId,
    protocolVersion,
    contractAddress,
    signer
  );

  return ocrId;
};
