import { IVersion } from "./IVersion";
import { parseSemVer } from "./parseSemVer";
import { compareSemVer } from "./compareSemVer";

export function sortVersions<T extends IVersion>(versions: T[]): T[] {
  return versions.sort((a, b) => {
    const aSemVer = parseSemVer(a.name);
    const bSemVer = parseSemVer(b.name);
    if (aSemVer && bSemVer) {
      return compareSemVer(aSemVer, bSemVer);
    } else {
      return 0;
    }
  });
}
