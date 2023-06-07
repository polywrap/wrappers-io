import { Account } from "../src/types/Account";
import { FunctionManager } from "../src/functions/FunctionManager";
import { HttpResponse, IRepository, InMemoryDb, RepositoryBase } from "serverless-utils";
describe("InternalServer", () => {
  let manager: FunctionManager;
  let accountRepo: IRepository<Account>;

  beforeEach(() => {
    const db = new InMemoryDb();
    accountRepo = new RepositoryBase<Account>(db, "name");
    manager = new FunctionManager(accountRepo, "adminKey");
  });

  describe("verify", () => {
    it("should return 404 when wrong adminKey is used", async () => {
      const response = await manager.verify("test", "key", "wrongKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should return 404 when account is not found", async () => {
      const response = await manager.verify("test", "key", "adminKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should return 200 when account is found and key matches", async () => {
      const account: Account = { name: "test", apiKey: "key", isDeleted: false };
      await accountRepo.save(account);

      const response = await manager.verify("test", "key", "adminKey");
      expect(response).toEqual(HttpResponse.Ok({ message: "Verified." }));
    });
  });

  describe("create", () => {
    it("should return 404 when wrong adminKey is used", async () => {
      const response = await manager.create("test", "wrongKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should create account and return 200 when correct adminKey is used", async () => {
      const response = await manager.create("test", "adminKey");
      expect(response.statusCode).toBe(200);

      const body = (response as any).body;
      expect(body).toHaveProperty("message", "Account created.");
      expect(body).toHaveProperty("apiKey");

      const account = await accountRepo.read("test");
      expect(account).toHaveProperty("name", "test");
      expect(account).toHaveProperty("apiKey", body.apiKey);
    });
  });

  describe("delete", () => {
    it("should return 404 when wrong adminKey is used", async () => {
      const response = await manager.delete("test", "wrongKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should mark account as deleted and return 200 when correct adminKey is used", async () => {
      const account: Account = { name: "test", apiKey: "key", isDeleted: false };
      await accountRepo.save(account);

      const response = await manager.delete("test", "adminKey");
      expect(response).toEqual(HttpResponse.Ok(undefined));

      const deletedAccount = await accountRepo.read("test");
      expect(deletedAccount).toHaveProperty("isDeleted", true);
    });
  });

  describe("restore", () => {
    it("should return 404 when wrong adminKey is used", async () => {
      const response = await manager.restore("test", "wrongKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should mark account as not deleted and return 200 when correct adminKey is used", async () => {
      const account: Account = { name: "test", apiKey: "key", isDeleted: true };
      await accountRepo.save(account);

      const response = await manager.restore("test", "adminKey");
      expect(response).toEqual(HttpResponse.Ok(undefined));

      const restoredAccount = await accountRepo.read("test");
      expect(restoredAccount).toHaveProperty("isDeleted", false);
    });
  });

  describe("get", () => {
    it("should return 404 when wrong adminKey is used", async () => {
      const response = await manager.get("test", "wrongKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should return 404 when account is not found", async () => {
      const response = await manager.get("test", "adminKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should return account and 200 when correct adminKey is used and account exists", async () => {
      const account: Account = { name: "test", apiKey: "key", isDeleted: false };
      await accountRepo.save(account);

      const response = await manager.get("test", "adminKey");
      expect(response).toEqual(HttpResponse.Ok(account));
    });
  });
});