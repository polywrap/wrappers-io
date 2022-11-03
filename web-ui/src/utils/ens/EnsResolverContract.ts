import { Provider } from "@ethersproject/abstract-provider";
import { Contract, Signer } from "ethers";

export class EnsResolverContract extends Contract {
  static create(
    contractAddress: string,
    providerOrSigner: Provider | Signer
  ): Contract {
    return new Contract(
      contractAddress,
      [
        "function setContenthash(bytes32 node, bytes calldata hash) external",
        "function contenthash(bytes32 node) external view returns (bytes memory)",
      ],
      providerOrSigner
    );
  }
}
