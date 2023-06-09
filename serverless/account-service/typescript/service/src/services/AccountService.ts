import { Result, ResultErr, ResultOk } from "@polywrap/result";
import { Account } from "../types/Account";
import { IRepository } from "serverless-utils";

export enum ReadError {
  AccountNotFound = "Account not found",
}

export enum CreateError {
  AccountAlreadyExists = "Account already exists",
}

export enum DeleteError {
  AccountNotFound = "Account not found",
}

export enum RestoreError {
  AccountNotFound = "Account not found",
}

export class AccountService {
  constructor(private readonly accountRepo: IRepository<Account>) {}

  async read(name: string): Promise<Result<Account, ReadError>> {
    const account = await this.accountRepo.read(name);
    if (account) {
      return ResultOk(account);
    } else {
      return ResultErr(ReadError.AccountNotFound);
    }
  }

  async create(name: string): Promise<Result<Account, CreateError>> {
    const account = await this.accountRepo.read(name);
    if (account) {
      return ResultErr(CreateError.AccountAlreadyExists);
    }

    const apiKey = Math.random().toString(36).substring(2, 15);
    const newAccount: Account = { name, apiKey, isDeleted: false };

    await this.accountRepo.save(newAccount);

    return ResultOk(newAccount);
  }

  async delete(name: string): Promise<Result<void, DeleteError>> {
    const account = await this.accountRepo.read(name);
    if (!account) {
      return ResultErr(DeleteError.AccountNotFound);
    }

    account.isDeleted = true;
    await this.accountRepo.save(account);

    return ResultOk(undefined);
  }

  async restore(name: string): Promise<Result<void, RestoreError>> {
    const account = await this.accountRepo.read(name);
    if (!account) {
      return ResultErr(RestoreError.AccountNotFound);
    }

    account.isDeleted = false;
    await this.accountRepo.save(account);

    return ResultOk(undefined);
  }
}
