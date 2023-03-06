import { WRAPPERS_GATEWAY_URL } from "../constants";
import { DomainModel } from "../models/DomainModel";
import { WrapperModel } from "../models/WrapperModel";
import { CacheLoader } from "./CacheLoader";

import axios from "axios";

export async function loadEnsInfoFromGateway(network: string): Promise<DomainModel[]> {
  const cache = CacheLoader.ensWrappersForNetwork(network);

  const domains = (await cache.getOrUpdate(network, () =>
    axios.get(`${WRAPPERS_GATEWAY_URL}/ens/${network}?json=true`).then((x) => x.data)
  )) as DomainModel[];

  cache.save();

  return domains;
}
