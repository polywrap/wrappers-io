import { IVersion } from "./IVersion";
import { SemVer } from "./SemVer";
import { parseSemVer } from "./parseSemVer";
import { compareSemVer } from "./compareSemVer";

export function getLatest<T extends IVersion>(partial: string, versions: T[]): T | null {
  const partialParts = partial.split('.').map(Number);
  let latest: SemVer | null = null;
  let latestVersion: T | null = null;
  for (const version of versions) {
    const semVer = parseSemVer(version.name);
    if (semVer !== null && semVer.slice(0, partialParts.length).every((val, i) => val === partialParts[i])) {
      if (latest === null || compareSemVer(semVer, latest) > 0) {
        latest = semVer;
        latestVersion = version;
      }
    }
  }
  return latestVersion;
}
