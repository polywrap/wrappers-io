import { SemVer } from "./SemVer";

export function parseSemVer(version: string): SemVer | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);
  if (match === null) {
    return null;
  }
  const [, major, minor, patch, preRelease = '', buildMetadata = ''] = match;
  return [
    parseInt(major, 10),
    parseInt(minor, 10),
    parseInt(patch, 10),
    preRelease,
    buildMetadata
  ];
}
