import { rawHandler as verify } from "./routes/verify";
import { rawHandler as create } from "./routes/create";
import { rawHandler as get } from "./routes/get";
import { rawHandler as restore } from "./routes/restore";
import { rawHandler as deleteHandler } from "./routes/delete";

export const server = {
  verify,
  create,
  get,
  restore,
  delete: deleteHandler,
};
