import { HttpResponse, IDb, IRepository } from "serverless-utils";
import { getLatest, sortVersions } from "semver";
import { Package } from "../types/Package";

export class PackageService {
  constructor(private readonly packageRepository: IRepository<Package>) { }

  async publish(
    user: string,
    packageName: string,
    uri: string,
    version?: string
  ): Promise<any> {
    const requiredVersion = version
      ? version as string
      : "latest";

    const key = `${user}/${packageName}`;

    let savedPackage = await this.packageRepository.read(key);

    if (!savedPackage) {
      savedPackage = {
        name: key,
        versions: [],
      };
    }

    savedPackage.versions.push({ name: requiredVersion, uri: uri as string });

    await this.packageRepository.save(savedPackage);

    return HttpResponse.Ok({ message: `Published: ${uri}` });
  }

  async resolve(
    user: string,
    packageName: string,
    version?: string
  ): Promise<any> {
    const key = `${user}/${packageName}`;

    let savedPackage = await this.packageRepository.read(key);

    let uri = undefined;

    if (version && savedPackage) {
      uri = getLatest(version, savedPackage.versions)?.uri;
    } else if (savedPackage) {
      const sorted = sortVersions(savedPackage.versions);
      uri = sorted[sorted.length - 1].uri;
    }

    if (!uri) {
      return HttpResponse.NotFound();
    }

    return HttpResponse.Ok(undefined, {
      "x-wrap-uri": uri,
    });
  }
}
