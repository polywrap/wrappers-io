import { EnsDomain } from "./EnsDomain";
import { WnsDomain } from "./WnsDomain";

import { OcrId } from "@nerfzael/ocr-core";

export type PublishedWrapper = {
  cid?: string;
  ocrId?: OcrId;
  ensDomain?: EnsDomain;
  wnsDomain?: WnsDomain;
};
