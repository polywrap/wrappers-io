import { WrapperModel } from "../models/WrapperModel";
import { WrapperEnsModel } from "../models/WrapperEnsModel";
import { loadAllWrappersFromGateway } from "./loadAllWrappersFromGateway";

export const getWrappersFromEns = async (): Promise<WrapperEnsModel[]> => {
  const wrappers = await loadAllWrappersFromGateway();

  const sortedByDownloads: WrapperModel[] = wrappers.sort(
    (a: any, b: any) => b.downloadCount - a.downloadCount
  );

  const wrappersFromEns: WrapperEnsModel[] = sortedByDownloads.flatMap(wrapper => {
    return wrapper.indexes
      .filter(index => index.name.startsWith("ens-"))
      .flatMap(index => {
        return index.ens.map(ensInfo => {
          return {
            ...wrapper,
            network: index.name.slice(4, index.name.length),
            ens: ensInfo,
          }
        });
      });
  });

  return wrappersFromEns;
};
