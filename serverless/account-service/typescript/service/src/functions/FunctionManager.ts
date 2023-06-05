import { HttpResponse, IHttpResponse, IRepository } from "serverless-utils";
import { Account } from "../types/Account";

export class FunctionManager {
  constructor(private readonly accountRepo: IRepository<Account>, private readonly adminKey: string) {
  }

  async verify(name: string, key: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const account = await this.accountRepo.read(name);
    if (account && account.apiKey === key) {
      return HttpResponse.Ok({ message: "Verified." });
    } else {
      return HttpResponse.NotFound();
    }
  }

  async create(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const apiKey = Math.random().toString(36).substring(2, 15);
    const account: Account = { name, apiKey, isDeleted: false };

    await this.accountRepo.save(account);

    return HttpResponse.Ok({ message: "Account created.", apiKey });
  }

  async delete(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }
    const account = await this.accountRepo.read(name);

    if (!account) {
      return HttpResponse.NotFound();
    }

    account.isDeleted = true,

    await this.accountRepo.save(account);

    return HttpResponse.Ok(undefined);
  }

  async restore(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }
    const account = await this.accountRepo.read(name);

    if (!account) {
      return HttpResponse.NotFound();
    }

    account.isDeleted = false,

    await this.accountRepo.save(account);
    
    return HttpResponse.Ok(undefined);
  }

  async get(name: string, adminKey: string): Promise<IHttpResponse> {
    if (adminKey !== this.adminKey) {
      return HttpResponse.NotFound();
    }

    const account = await this.accountRepo.read(name);

    if (account) {
      return HttpResponse.Ok(account);
    } else {
      return HttpResponse.NotFound();
    }
  }
}
