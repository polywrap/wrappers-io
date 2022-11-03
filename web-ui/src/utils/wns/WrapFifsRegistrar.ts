import { Provider } from "@ethersproject/abstract-provider";
import { Contract, Signer } from "ethers";

export class WrapFifsRegistrarContract extends Contract {
  static create(
    contractAddress: string,
    providerOrSigner: Provider | Signer
  ): Contract {
    return new Contract(
      contractAddress,
      ["function register(bytes32 label, address owner) public"],
      providerOrSigner
    );
  }
}
