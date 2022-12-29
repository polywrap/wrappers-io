import { ContractCall, Provider } from "ethers-multicall";

export const mapWithMultiCall = async <T, TResult>(
  items: T[],
  provider: Provider,
  map: (
    item: T,
    call: <TCallResult = any>(
      contractCall: ContractCall
    ) => Promise<TCallResult>
  ) => Promise<TResult>
): Promise<TResult[]> => {
  let calls: {
    contractCall: ContractCall;
    resolve: (result: any) => void;
  }[] = [];

  const call = async <TCallResult>(
    contractCall: ContractCall
  ): Promise<TCallResult> => {
    return new Promise((resolve) => {
      calls.push({
        contractCall,
        resolve,
      });
    }) as unknown as TCallResult;
  };

  const tasks = items.map((item) => map(item, call));

  while (await shouldContinue(tasks)) {
    if (calls.length === 0) {
      continue;
    }
    const results = await provider.all(calls.map((x) => x.contractCall));
    const oldCalls = calls.map((x) => x);
    calls = [];

    results.forEach((result: any, i: number) => {
      const callObj = oldCalls[i];
      callObj.resolve(result);
    });
  }

  return Promise.all(tasks);
};

const shouldContinue = async (tasks: Promise<any>[]): Promise<boolean> => {
  const result = await Promise.race([
    Promise.all(tasks),
    new Promise((resolve) => setTimeout(() => resolve(false))),
  ]);

  if (result != false) {
    return false;
  }

  return true;
};
