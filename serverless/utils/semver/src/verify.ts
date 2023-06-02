import { IVersion } from "./IVersion";
import { parseSemVer } from "./parseSemVer";

export function verify<T extends IVersion>(version: T): boolean {
  const parsed = parseSemVer(version.name);
  return parsed !== null;
}
