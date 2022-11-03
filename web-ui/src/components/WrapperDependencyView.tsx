import { WrapperInfo } from "../models/WrapperInfo";

import Link from "next/link";

const getDependencyUrl = (wrapUri: string): string => {
  const uriWithoutProtocol = wrapUri.startsWith("wrap://")
    ? wrapUri.slice("wrap://".length, wrapUri.length)
    : wrapUri;

  if (uriWithoutProtocol.startsWith("ens/")) {
    const domainWithNetwork = uriWithoutProtocol.slice(
      "ens/".length,
      uriWithoutProtocol.length
    );
    if (domainWithNetwork.includes("/")) {
      const network = domainWithNetwork.split("/")[0];
      const domain = domainWithNetwork.split("/")[1];

      return `/v/ens/${network}/${domain}`;
    } else {
      const network = "mainnet";
      const domain = domainWithNetwork;

      return `/v/ens/${network}/${domain}`;
    }
  } else if (uriWithoutProtocol.startsWith("ipfs/")) {
    const cid = uriWithoutProtocol.slice(
      "ipfs/".length,
      uriWithoutProtocol.length
    );

    return `v/ipfs/${cid}`;
  }

  return "";
};

const WrapperDependencyView: React.FC<{
  wrapperInfo: WrapperInfo;
}> = ({ wrapperInfo }) => {
  return (
    <div className="WrapperDependencyView p-4">
      <div className="">
        {wrapperInfo?.dependencies.map((wrapUri: string) => (
          <Link href={getDependencyUrl(wrapUri)} key={wrapUri}>
            <div className="clickable p-2" key={wrapUri}>
              {wrapUri}
            </div>
          </Link>
        ))}
        {wrapperInfo &&
          !(wrapperInfo.dependencies && wrapperInfo.dependencies.length) && (
            <div className="">No dependencies</div>
          )}
      </div>
    </div>
  );
};

export default WrapperDependencyView;
