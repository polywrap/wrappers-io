import { rawHandler as publish } from "./routes/publish";
import { rawHandler as resolve } from "./routes/resolve";

export const server = {
  publish,
  resolve,
};
