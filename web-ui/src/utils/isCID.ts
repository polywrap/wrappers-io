import { CID } from "ipfs-http-client";

export const isCID = (cid: string): boolean => {
  try {
    CID.parse(cid);
    return true;
  } catch {
    return false;
  }
};
