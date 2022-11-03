import { useEffect, useState } from "react";
import { useEthers } from "@usedapp/core";

export const useNetwork = (): string | undefined => {
  const [networkName, setNetworkName] = useState<string | undefined>();

  const { chainId } = useEthers();

  useEffect(() => {
    console.log(chainId);
  }, [chainId]);

  return networkName;
};
