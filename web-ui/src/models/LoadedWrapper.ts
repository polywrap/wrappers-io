import { PublishedWrapper } from "./PublishedWrapper";

import { InMemoryFile } from "@nerfzael/memory-fs";

export type LoadedWrapper = {
  files: InMemoryFile[];
} & PublishedWrapper;
