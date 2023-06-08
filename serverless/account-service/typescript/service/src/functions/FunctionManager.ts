import { HttpResponse, IHttpResponse } from "serverless-utils";
import { AccountService, CreateError, DeleteError, RestoreError, ReadError } from "../services/AccountService";

export class FunctionManager {
  constructor(private readonly accountService: AccountService, private readonly adminKey: string) {
  }

  async verify(name: string, key: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const result = await this.accountService.read(name);
    
    if (result.ok && result.value.apiKey === key && !result.value.isDeleted) {
      return HttpResponse.Ok();
    } else {
      return HttpResponse.NotFound();
    }
  }

  async create(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const result = await this.accountService.create(name);

    if (result.ok) {
      return HttpResponse.Ok({ message: "Account created.", apiKey: result.value.apiKey });
    }

    switch (result.error) {
      case CreateError.AccountAlreadyExists:
        return HttpResponse.Conflict();
      default:
        return HttpResponse.ServerError("Account service returned an unknown error");
    }
  }

  async delete(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const result = await this.accountService.delete(name);

    if (result.ok) {
      return HttpResponse.Ok(undefined);
    }
    
    switch (result.error) {
      case DeleteError.AccountNotFound:
        return HttpResponse.NotFound();
      default:
        return HttpResponse.ServerError("Account service returned an unknown error");
    }
  }

  async restore(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const result = await this.accountService.restore(name);
    
    if (result.ok) {
      return HttpResponse.Ok(undefined);
    }

    switch (result.error) {
      case RestoreError.AccountNotFound:
        return HttpResponse.NotFound();
      default:
        return HttpResponse.ServerError("Account service returned an unknown error");
    }
  }

  async get(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const result = await this.accountService.read(name);

    if (result.ok) {
      return HttpResponse.Ok(result.value);
    } 

    switch (result.error) {
      case ReadError.AccountNotFound:
        return HttpResponse.NotFound();
      default:
        return HttpResponse.ServerError("Account service returned an unknown error");
    }
  }
}
