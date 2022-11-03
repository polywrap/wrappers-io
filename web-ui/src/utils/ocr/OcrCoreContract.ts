import { Provider } from "@ethersproject/abstract-provider";
import { Contract, Signer } from "ethers";
import { ocrContractCoreAbi } from "@nerfzael/ocr-core";

export class OcrCoreContract extends Contract {
  static create(
    contractAddress: string,
    providerOrSigner: Provider | Signer
  ): Contract {
    return new Contract(contractAddress, ocrContractCoreAbi, providerOrSigner);
  }
}
