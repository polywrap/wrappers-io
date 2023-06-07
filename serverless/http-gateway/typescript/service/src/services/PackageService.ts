import { IRepository } from "serverless-utils";
import { getLatest, sortVersions, verify } from "semver";
import { Package } from "../types/Package";
import { Result, ResultErr, ResultOk } from "@polywrap/result";

export enum PublishError {
  InvalidVersionFormat = "Invalid version format",
  DuplicateVersion = "Duplicate version",
  // Cannot publish version as "latest" if there are already specific versions published
  LatestVersionNotAllowed = "Latest version not allowed",
}

export enum ResolveError {
  PackageNotFound = "Package not found",
  VersionNotFound = "Package version not found",
}

export enum GetError {
  PackageNotFound = "Package not found",
}

export class PackageService {
  constructor(private readonly packageRepo: IRepository<Package>) { }

  async publish(
    user: string,
    packageName: string,
    uri: string,
    version?: string
  ): Promise<Result<undefined, PublishError>> {
    if (version && !verify({ name: version })) {
      return ResultErr(PublishError.InvalidVersionFormat);
    }

    const requiredVersion = version
      ? version as string
      : "latest";

    const key = `${user}/${packageName}`;

    let savedPackage = await this.packageRepo.read(key);

    if (!savedPackage) {
      savedPackage = {
        user,
        name: key,
        versions: [],
      };
    } else {
      if (requiredVersion === "latest") {
        return this.publishLatestVersion(savedPackage, uri);
      }

      const existingVersion = savedPackage.versions.find(
        (v) => v.name === requiredVersion
      );

      if (existingVersion) {
        return ResultErr(PublishError.DuplicateVersion);
      }
    }

    savedPackage.versions.push({ name: requiredVersion, uri });

    savedPackage.versions.length && sortVersions(savedPackage.versions);

    await this.packageRepo.save(savedPackage);

    return ResultOk(undefined);
  }


  private async publishLatestVersion(savedPackage: Package, uri: string): Promise<Result<undefined, PublishError>> {
    if (savedPackage.versions.length > 1) {
      return ResultErr(PublishError.LatestVersionNotAllowed);
    }

    if (savedPackage.versions.length === 1) {
      const existingVersion = savedPackage.versions[0];

      if (existingVersion.name !== "latest") {
        return ResultErr(PublishError.LatestVersionNotAllowed);
      }

      existingVersion.uri = uri;
    } else {
      savedPackage.versions.push({ name: "latest", uri });
    }

    await this.packageRepo.save(savedPackage);

    return ResultOk(undefined);
  }

  async resolve(
    user: string,
    packageName: string,
    version?: string
  ): Promise<Result<string, ResolveError>> {
    const key = `${user}/${packageName}`;

    let savedPackage = await this.packageRepo.read(key);

    if (!savedPackage) {
      return ResultErr(ResolveError.PackageNotFound);
    }

    let uri = undefined;

    if (version) {
      uri = getLatest(version, savedPackage.versions)?.uri;

      if (!uri) {
        return ResultErr(ResolveError.VersionNotFound);
      } else {
        return ResultOk(uri);
      }
    } else if (savedPackage.versions.length === 0) {
      return ResultErr(ResolveError.VersionNotFound);
    } else {
      const sorted = sortVersions(savedPackage.versions);
      uri = sorted[sorted.length - 1].uri;
  
      return ResultOk(uri);
    } 
  }

  async get(
    user: string,
    packageName: string,
  ): Promise<Result<Package, GetError>> {
    const key = `${user}/${packageName}`;

    let savedPackage = await this.packageRepo.read(key);

    if (!savedPackage) {
      return ResultErr(GetError.PackageNotFound);
    }

    return ResultOk(savedPackage);
  }
}