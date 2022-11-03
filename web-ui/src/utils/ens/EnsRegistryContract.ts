import { Provider } from "@ethersproject/abstract-provider";
import { Contract, Signer } from "ethers";

export class EnsRegistryContract extends Contract {
  static create(
    contractAddress: string,
    providerOrSigner: Provider | Signer
  ): Contract {
    return new Contract(
      contractAddress,
      [
        "function owner(bytes32 node) external view returns (address)",
        "function resolver(bytes32 node) external view returns (address)",
        "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external",
      ],
      providerOrSigner
    );
  }
}
