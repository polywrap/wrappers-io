import { Version } from "./Version";

export type Package = {
  user: string;
  name: string;
  versions: Version[];
};
