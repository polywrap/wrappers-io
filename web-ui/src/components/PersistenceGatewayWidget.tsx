import PublishToIpfs from "./publish/publish-to-ipfs/PublishToIpfs";
import PublishToEns from "./publish/publish-to-ens/PublishToEns";
import { LoadedWrapper } from "../models/LoadedWrapper";
import PublishToOcr from "./publish/publish-to-ocr/PublishToOcr";
import { WRAPPERS_GATEWAY_URL } from "../constants";

import { IPFSHTTPClient } from "ipfs-http-client";
import axios from "axios";
import { useEffect, useState } from "react";

type IndexerModel = {
  name: string;
  online: boolean;
  latestBlock: number;
  lastBlockProcessed: number;
  lastBlockIndexed: number;
  blocksToProcess: number;
  blocksToIndex: number;
  domainsIndexed: number;
  contenthashesIndexed: number;
  ipfsHashesIndexed: number;
  lastFastSyncHash: string;
  isFullySynced: boolean;
  lastSync: Date;
};

type PersistenceGatewayModel = {
  online: boolean;
  version: string;
  trackedIpfsHashesStatusCounts: {
    NotAWrapper: number;
    Lost: number;
    Pinned: number;
    ValidWrapperCheck: number;
  };
  indexers: IndexerModel[];
};

const PersistenceGatewayWidget: React.FC = () => {
  const [model, setModel] = useState<PersistenceGatewayModel | undefined>();

  useEffect(() => {
    (async () => {
      const result = await axios.get(
        `${WRAPPERS_GATEWAY_URL}/status?json=true`
      );

      setModel(result.data);
    })();
  }, []);

  return (
    <div>
      {model && (
        <div>
          <h1>Persistence Gateway</h1>
          <div>
            <h2>Indexers</h2>
            <ul>
              {model.indexers.map((indexer) => (
                <li key={indexer.name}>
                  <h3>{indexer.name}</h3>
                  <div>
                    <div>
                      <span>Online:</span> {indexer.online ? "Yes" : "No"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersistenceGatewayWidget;
