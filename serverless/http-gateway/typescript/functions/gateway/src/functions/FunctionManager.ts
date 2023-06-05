import { HttpResponse, IHttpResponse } from "serverless-utils";
import { AccountService } from "../services/AccountService";
import { PackageService } from "../services/PackageService";

export class FunctionManager {
  constructor(private readonly uploadsService: PackageService, private readonly accountService: AccountService) {}

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

    return this.uploadsService.publish(user, packageName, uri, version);
  }

  async resolve(
    user: string,
    packageAndVersion: string,
  ): Promise<IHttpResponse> {
    const [packageName, version] = packageAndVersion.split("@");

    if (!user || !packageName) {
      return HttpResponse.ServerError("Error: Missing User or Package Name");
    }

    return this.uploadsService.resolve(user, packageName, version);
  }
}
