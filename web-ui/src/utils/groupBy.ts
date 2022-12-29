export const groupBy = <T>(array: T[], getter: (item: T) => { toString(): string }): Record<string, T[]> => {
  let emptyMap = {} as Record<string, T[]>;
  return array.reduce(function(rv, x) {
    (rv[getter(x).toString()] = rv[getter(x).toString()] || []).push(x);
    return rv;
  }, emptyMap);
};
