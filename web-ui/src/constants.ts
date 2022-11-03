import {
  Goerli,
  Localhost,
  Mainnet,
  Polygon,
  Rinkeby,
  Ropsten,
} from "@usedapp/core";

export const WRAPPERS_GATEWAY_URL =
  process.env.NEXT_WRAPPERS_GATEWAY_URL ?? "https://ipfs.wrappers.io";

export const ETH_PROVIDERS = {
  [Mainnet.chainId]:
    process.env.NEXT_ETH_PROVIDER_MAINNET ??
    "https://mainnet.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Rinkeby.chainId]:
    process.env.NEXT_ETH_PROVIDER_RINKEBY ??
    "https://rinkeby.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Ropsten.chainId]:
    process.env.NEXT_ETH_PROVIDER_ROPSTEN ??
    "https://ropsten.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Goerli.chainId]:
    process.env.NEXT_ETH_PROVIDER_GOERLI ??
    "https://goerli.infura.io/v3/b00b2c2cc09c487685e9fb061256d6a6",
  [Polygon.chainId]:
    process.env.NEXT_ETH_PROVIDER_POLYGON ?? "https://polygon-rpc.com",
  [Localhost.chainId]:
    process.env.NEXT_ETH_PROVIDER_LOCALHOST ?? "http://localhost:8545",
};

export const ENS_CONTRACT_ADDRESSES: Record<
  string,
  {
    registry: string;
  }
> = {
  "1": {
    registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  },
  "3": {
    registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  },
  "4": {
    registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  },
  "5": {
    registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
  },
};

export const WNS_CONTRACT_ADDRESSES: Record<
  string,
  {
    registry: string;
    fifsRegistrar: string;
  }
> = {
  "1337": {
    registry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    fifsRegistrar: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
};

export const MAX_OCR_PACKAGE_SIZE = 128_000;
export const OCR_BYTES_FOR_FILE_PATH = 2;
export const OCR_BYTES_FOR_FILE_SIZE = 8;
export const OCR_CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  "1337": {
    "1": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  },
  "137": {
    "1": "0xD58b0e11411fc2906d41A3f1Cb2174C7e154Bd7c",
  },
};
