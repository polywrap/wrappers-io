import { ReactElement } from "react";
import type { AppProps } from "next/app";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.scss";
import "react-app-polyfill/stable";
import "react-app-polyfill/ie11";
import "core-js/features/array/find";
import "core-js/features/array/includes";
import "core-js/features/number/is-nan";
import {
  Mainnet,
  Rinkeby,
  Ropsten,
  Polygon,
  Localhost,
  DAppProvider,
  Config,
  Goerli,
} from "@usedapp/core";

const usedappConfig: Config = {
  autoConnect: true,
  networks: [Mainnet, Rinkeby, Ropsten, Goerli, Polygon, Localhost],
  multicallAddresses: {
    [Localhost.chainId]: "0x0000000000000000000000000000000000000000",
  },
};

function MyApp({ Component, pageProps }: AppProps): ReactElement<any, any> {
  return (
    <DAppProvider config={usedappConfig}>
      <Component {...pageProps} />
    </DAppProvider>
  );
}

export default MyApp;
