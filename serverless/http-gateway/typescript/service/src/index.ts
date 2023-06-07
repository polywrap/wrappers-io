import { rawHandler as publish } from "./routes/publish";
import { rawHandler as resolve } from "./routes/resolve";
import { rawHandler as packageInfo } from "./routes/packageInfo";

export const server = {
  publish,
  resolve,
  packageInfo,
};
