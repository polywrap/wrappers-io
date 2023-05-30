type SemVer = [number, number, number, string | null, string | null];

interface IVersion {
  name: string;
}

function parseSemVer(version: string): SemVer | null {
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

function compareSemVer(a: SemVer, b: SemVer): number {
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

export function verify<T extends IVersion>(version: T): boolean {
  const parsed = parseSemVer(version.name);
  return parsed !== null;
}

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

export function sortVersions<T extends IVersion>(versions: T[]): T[] {
  return versions.sort((a, b) => {
    const aSemVer = parseSemVer(a.name);
    const bSemVer = parseSemVer(b.name);
    if (aSemVer && bSemVer) {
      return compareSemVer(aSemVer, bSemVer);
    } else {
      return 0;
    }
  })
} 
