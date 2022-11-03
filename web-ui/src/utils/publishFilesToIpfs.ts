import { IPFSHTTPClient } from "ipfs-http-client";
import { InMemoryFile } from "@nerfzael/memory-fs";

export const publishFilesToIpfs = async (
  files: InMemoryFile[],
  ipfsNode: IPFSHTTPClient
): Promise<string | undefined> => {
  let rootCID: string | undefined;

  for await (const file of ipfsNode.addAll(files, {
    wrapWithDirectory: true,
  })) {
    if (file.path.indexOf("/") === -1) {
      rootCID = file.cid.toString();
    }
  }

  return rootCID;
};
