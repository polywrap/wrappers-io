import { HttpResponse, IHttpResponse } from "serverless-utils";
import { IAccountService } from "../services/IAccountService";
import { PackageService, PublishError, ResolveError } from "../services/PackageService";

export class FunctionManager {
  constructor(private readonly packageService: PackageService, private readonly accountService: IAccountService) {}

  async publish(
    user: string,
    packageAndVersion: string,
    uri: string,
    apiKey?: string,
  ): Promise<IHttpResponse> {
    const [packageName, version] = packageAndVersion.split("@");

    if (!user || !packageName) {
      return HttpResponse.ServerError("Error: Missing User or Package Name");
    }

    const isVerified = await this.accountService.verify(user, apiKey);

    if (!isVerified) {
      return HttpResponse.NotFound();
    }

    const result = await this.packageService.publish(user, packageName, uri, version);

    if (result.ok) {
      return HttpResponse.Ok();
    }

    switch (result.error) {
      case PublishError.InvalidVersionFormat:
        return HttpResponse.BadRequest("Invalid Version Format");
      case PublishError.DuplicateVersion:
        return HttpResponse.BadRequest("Invalid Version Format");
      case PublishError.LatestVersionNotAllowed:
        return HttpResponse.BadRequest("Invalid Version Format");
      default:
        return HttpResponse.ServerError("Error: Unknown Error from Package Service");
    }
  }

  async resolve(
    user: string,
    packageAndVersion: string,
  ): Promise<IHttpResponse> {
    const [packageName, version] = packageAndVersion.split("@");

    if (!user || !packageName) {
      return HttpResponse.ServerError("Error: Missing User or Package Name");
    }

    const result = await this.packageService.resolve(user, packageName, version);

    console.log("result", result);

    if (result.ok) {
      return HttpResponse.Ok({ uri: result.value });
    }

    switch (result.error) {
      case ResolveError.PackageNotFound:
        return HttpResponse.NotFound();
      case ResolveError.VersionNotFound:
        return HttpResponse.NotFound();
      default:
        return HttpResponse.ServerError("Error: Unknown Error from Package Service");
    }
  }
}
