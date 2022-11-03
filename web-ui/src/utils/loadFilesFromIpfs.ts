import all from "it-all";
import toBuffer from "it-to-buffer";
import map from "it-map";
import { pipe } from "it-pipe";
import { extract } from "it-tar";
import { IPFSHTTPClient } from "ipfs-http-client";
import { InMemoryFile } from "@nerfzael/memory-fs";

async function* tarballed(source: any) {
  yield* pipe(source, extract(), async function* (source) {
    for await (const entry of source) {
      yield {
        ...entry,
        body: await toBuffer(map(entry.body, (buf) => buf.slice())),
      };
    }
  });
}

export const loadFilesFromIpfs = async (
  cid: string,
  ipfsNode: IPFSHTTPClient
): Promise<InMemoryFile[] | undefined> => {
  const output = await pipe(ipfsNode.get(cid), tarballed, (source) =>
    all(source)
  );
  const files = output
    .filter((x) => x.header.name !== cid)
    .map((x) => {
      return {
        path: x.header.name.slice(cid.length + 1, x.header.name.length),
        content: x.body,
      };
    });

  return files && files.length ? files : undefined;
};
