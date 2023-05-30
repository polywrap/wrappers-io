import { Account } from "./Account";
import { IDb } from "./IDb.1";
import { IResponse } from "./IResponse";
import { Status } from "./Status";

export class InternalServer {
  constructor(private readonly accountsDb: IDb, private readonly adminKey: string) {
  }

  async verify(name: string, key: string, adminKey: string): Promise<IResponse> {
    if (adminKey !== this.adminKey) {
      return Status.NotFound();
    }

    const account = await this.accountsDb.read<Account>("name", name);
    if (account && account.apiKey === key) {
      return Status.Ok({ message: "Verified." });
    } else {
      return Status.NotFound();
    }
  }

  async create(name: string, adminKey: string): Promise<IResponse> {
    if (adminKey !== this.adminKey) {
      return Status.NotFound();
    }

    const apiKey = Math.random().toString(36).substring(2, 15);
    const account: Account = { name, apiKey, isDeleted: false };

    await this.accountsDb.save("name", name, account);

    return Status.Ok({ message: "Account created.", apiKey });
  }

  async delete(name: string, adminKey: string): Promise<IResponse> {
    if (adminKey !== this.adminKey) {
      return Status.NotFound();
    }
    const account = await this.accountsDb.read<Account>("name", name);

    if (!account) {
      return Status.NotFound();
    }

    account.isDeleted = true,

    await this.accountsDb.save("name", name, account);

    return Status.Ok(undefined);
  }

  async restore(name: string, adminKey: string): Promise<IResponse> {
    if (adminKey !== this.adminKey) {
      return Status.NotFound();
    }
    const account = await this.accountsDb.read<Account>("name", name);

    if (!account) {
      return Status.NotFound();
    }

    account.isDeleted = false,

    await this.accountsDb.save("name", name, account);
    
    return Status.Ok(undefined);
  }

  async get(name: string, adminKey: string): Promise<IResponse> {
    if (adminKey !== this.adminKey) {
      return Status.NotFound();
    }

    const account = await this.accountsDb.read<Account>("name", name);

    if (account) {
      return Status.Ok(account);
    } else {
      return Status.NotFound();
    }
  }
}
