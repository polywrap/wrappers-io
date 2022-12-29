import { WRAPPERS_GATEWAY_URL } from "../constants";
import { WrapperModel } from "../models/WrapperModel";
import { CacheLoader } from "./CacheLoader";

import axios from "axios";

export async function loadAllWrappersFromGateway(): Promise<WrapperModel[]> {
  const wrappersCache = CacheLoader.wrappers();

  const wrappers = (await wrappersCache.getOrUpdate("all", () =>
    axios.get(`${WRAPPERS_GATEWAY_URL}/pins?json=true`).then((x) => x.data)
  )) as WrapperModel[];

  wrappersCache.save();

  return wrappers;
}
