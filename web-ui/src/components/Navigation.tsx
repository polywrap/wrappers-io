import { toPrettyHex } from "../utils/toPrettyHex";

import { useEthers } from "@usedapp/core";
import Link from "next/link";

const Navigation: React.FC = () => {
  const { account, activateBrowserWallet, chainId, switchNetwork } =
    useEthers();

  const connectWallet = async () => {
    await activateBrowserWallet();
  };

  const setChainId = async (chainId: number) => {
    await switchNetwork(chainId);
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          wrappers.io
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/">
                <a className="nav-link">Dashboard</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/v">
                <a className="nav-link">Wrapper</a>
              </Link>
            </li>
            {/* <li className="nav-item">
              <a className="nav-link" href="#">
                ENS
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                WNS
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" href="#" aria-disabled="true">
                OCR
              </a>
            </li> */}
          </ul>
          <div className="">
            {!account && (
              <div className="second-column">
                <button className="btn btn-success" onClick={connectWallet}>
                  Connect
                </button>
              </div>
            )}
            {account && chainId && (
              <div className="d-flex align-items-center">
                <span className="text-nowrap mr-2">{toPrettyHex(account)}</span>
                <select
                  className="form-control"
                  value={chainId}
                  onChange={(e) => setChainId(parseInt(e.target.value as any))}
                >
                  <option value="1">Mainnet</option>
                  <option value="137">Polygon</option>
                  <option value="4">Rinkeby</option>
                  <option value="5">Goerli</option>
                  <option value="1337">Localhost</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
