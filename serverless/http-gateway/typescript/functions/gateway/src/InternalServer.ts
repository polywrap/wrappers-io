import { AccountService } from "./AccountService";
import { Status } from "./Status";
import { UploadsService } from "./UploadsService";

export class InternalServer {
  constructor(private readonly uploadsService: UploadsService, private readonly accountService: AccountService) {}

  async publish(
    user: string,
    packageName: string,
    uri: string,
    apiKey?: string,
    version?: string,
  ): Promise<any> {
    const isVerified = await this.accountService.verify(user, apiKey);

    if (!isVerified) {
      return Status.NotFound();
    }

    return this.uploadsService.publish(user, packageName, uri, version);
  }

  async resolve(
    user: string,
    packageName: string,
    version?: string
  ): Promise<any> {
    return this.uploadsService.resolve(user, packageName, version);
  }
}
