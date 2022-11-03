import { BigNumber } from "ethers";

export type OcrPackageInfo = {
  packageIndex: BigNumber;
  startBlock: BigNumber;
  endBlock: BigNumber;
  partCount: BigNumber;
  author: string;
};
