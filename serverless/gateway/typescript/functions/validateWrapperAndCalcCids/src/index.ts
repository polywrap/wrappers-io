import { create } from "ipfs-core";
import { MemoryDatastore } from 'datastore-core';
import { MemoryBlockstore } from 'blockstore-core';
import { createRepo } from "ipfs-repo";
import { MemoryLock } from "ipfs-repo/locks/memory";
import * as rawCodec from "multiformats/codecs/raw";
import { InMemoryFile, SerializedInMemoryFile } from "./types";
import { addFilesToIpfs, validateInMemoryWrapper } from "./funcs";

export const validateWrapperAndCalcCids = async (event: any, context: any) => {
  const serializedFiles = event.files as SerializedInMemoryFile[];

  const files: InMemoryFile[] = serializedFiles.map(file => ({
    path: file.path,
    content: file.content 
      ? Buffer.from(file.content.data)
      : undefined
  }));

  const validationResult = await validateInMemoryWrapper(files);
 
  if(!validationResult.valid) {
    return {
      valid: validationResult.valid,
      failReason: validationResult.failReason,
      failError: validationResult.failError,
    };
  }

  const repo = createRepo(
    '',
    async () => rawCodec,
    {
      blocks: new MemoryBlockstore(),
      datastore: new MemoryDatastore(),
      keys: new MemoryDatastore(),
      pins: new MemoryDatastore(),
      root: new MemoryDatastore()
    },
    { autoMigrate: false, repoLock: MemoryLock, repoOwner: true }
  );

  const ipfs = await create({
    silent: true,
    offline: true,
    repo
  });

  const { rootCid, addedFiles } = await addFilesToIpfs(
    files,
    ipfs
  );

  await ipfs.stop();

  console.log(`Gateway add: ${rootCid}`);

  if(!rootCid) {
    return {
      valid: false,
    };
  }

  return {
    cid: rootCid,
    valid: true,
    files: addedFiles.map(x => ({
      path: x.path,
      cid: x.cid.toString(),
      size: x.size,
    }))
  };
};
