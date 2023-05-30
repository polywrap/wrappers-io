import { IDb } from "./IDb";
import { Status } from "./Status";
import { Version } from "./Version";
import { getLatest, sortVersions } from "./semver";

export class InternalServer {
  constructor(private readonly uploadsDb: IDb) {}

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

    let versions = await this.uploadsDb.read<Version[]>("name", key);

    if (!versions) {
      versions = [];
    }

    versions.push({ name: requiredVersion, uri: uri as string });

    await this.uploadsDb.save("name", key, versions);

    return Status.Ok({ message: "Published." });
  }

  async resolve(
    user: string,
    packageName: string,
    version?: string
  ): Promise<any> {
    const key = `${user}/${packageName}`;

    let versions = await this.uploadsDb.read<Version[]>("name", key) ?? [];

    let uri = undefined;

    if (version && versions) {
      uri = getLatest(version, versions)?.uri;
    } else if (versions && versions.length > 0) {
      const sorted = sortVersions(versions);
      uri = sorted[sorted.length - 1].uri;
    }

    if (!uri) {
      return {
        statusCode: 404,
      };
    }
    return Status.Ok({ uri });
  }
}
