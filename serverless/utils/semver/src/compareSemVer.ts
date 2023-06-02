import { SemVer } from "./SemVer";

export function compareSemVer(a: SemVer, b: SemVer): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) {
      return (a[i] as number) - (b[i] as number); // The 'as number' type assertion is safe here, because we know that a[i] and b[i] are numbers for i < 3.
    }
  }
  if (a[3] === b[3]) {
    return 0;
  }
  if (a[3] === null) {
    return 1;
  }
  if (b[3] === null) {
    return -1;
  }
  return a[3].localeCompare(b[3]);
}
