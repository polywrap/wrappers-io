export class Network {
  constructor(
    public readonly name: string,
    public readonly chainId: number,
    public readonly label: string
  ) {}

  static fromChainId(chainId: number | undefined): Network {
    switch (chainId) {
      case 1:
        return new Network("mainnet", chainId, "Mainnet");
      case 3:
        return new Network("ropsten", chainId, "Ropsten");
      case 4:
        return new Network("rinkeby", chainId, "Rinkeby");
      case 5:
        return new Network("goerli", chainId, "Goerli");
      case 137:
        return new Network("polygon", chainId, "Polygon");
      case 1337:
        return new Network("localhost", chainId, "Localhost");
      default:
        return new Network("unkown", 0, "Unknown");
    }
  }

  static fromNetworkName(name: string | undefined): Network {
    switch (name) {
      case "mainnet":
        return new Network("mainnet", 1, "Mainnet");
      case "ropsten":
        return new Network("ropsten", 3, "Ropsten");
      case "rinkeby":
        return new Network("rinkeby", 4, "Rinkeby");
      case "goerli":
        return new Network("goerli", 5, "Goerli");
      case "polygon":
        return new Network("polygon", 137, "Polygon");
      case "localhost":
        return new Network("localhost", 1337, "Localhost");
      default:
        return new Network("unkown", 0, "Unknown");
    }
  }
}
