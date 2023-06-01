import { Account } from "../src/Account";
import { InMemoryDb } from "../src/InMemoryDb";
import { InternalServer } from "../src/InternalServer";
import { Status } from "../src/Status";
describe('InternalServer', () => {
  let server: InternalServer;
  let db: InMemoryDb;

  beforeEach(() => {
    db = new InMemoryDb();
    server = new InternalServer(db, 'adminKey');
  });

  describe('verify', () => {
    it('should return 404 when wrong adminKey is used', async () => {
      const response = await server.verify('test', 'key', 'wrongKey');
      expect(response).toEqual(Status.NotFound());
    });

    it('should return 404 when account is not found', async () => {
      const response = await server.verify('test', 'key', 'adminKey');
      expect(response).toEqual(Status.NotFound());
    });

    it('should return 200 when account is found and key matches', async () => {
      const account: Account = { name: 'test', apiKey: 'key', isDeleted: false };
      await db.save('user', 'test', account);

      const response = await server.verify('test', 'key', 'adminKey');
      expect(response).toEqual(Status.Ok({ message: 'Verified.' }));
    });
  });

  describe('create', () => {
    it('should return 404 when wrong adminKey is used', async () => {
      const response = await server.create('test', 'wrongKey');
      expect(response).toEqual(Status.NotFound());
    });

    it('should create account and return 200 when correct adminKey is used', async () => {
      const response = await server.create('test', 'adminKey');
      expect(response.statusCode).toBe(200);

      const body = (response as any).body;
      expect(body).toHaveProperty('message', 'Account created.');
      expect(body).toHaveProperty('apiKey');

      const account = await db.read<Account>('user', 'test');
      expect(account).toHaveProperty('name', 'test');
      expect(account).toHaveProperty('apiKey', body.apiKey);
    });
  });

  describe('delete', () => {
    it('should return 404 when wrong adminKey is used', async () => {
      const response = await server.delete('test', 'wrongKey');
      expect(response).toEqual(Status.NotFound());
    });

    it('should mark account as deleted and return 200 when correct adminKey is used', async () => {
      const account: Account = { name: 'test', apiKey: 'key', isDeleted: false };
      await db.save('user', 'test', account);

      const response = await server.delete('test', 'adminKey');
      expect(response).toEqual(Status.Ok(undefined));

      const deletedAccount = await db.read<Account>('user', 'test');
      expect(deletedAccount).toHaveProperty('isDeleted', true);
    });
  });

  describe('restore', () => {
    it('should return 404 when wrong adminKey is used', async () => {
      const response = await server.restore('test', 'wrongKey');
      expect(response).toEqual(Status.NotFound());
    });

    it('should mark account as not deleted and return 200 when correct adminKey is used', async () => {
      const account: Account = { name: 'test', apiKey: 'key', isDeleted: true };
      await db.save('user', 'test', account);

      const response = await server.restore('test', 'adminKey');
      expect(response).toEqual(Status.Ok(undefined));

      const restoredAccount = await db.read<Account>('user', 'test');
      expect(restoredAccount).toHaveProperty('isDeleted', false);
    });
  });

  describe('get', () => {
    it('should return 404 when wrong adminKey is used', async () => {
      const response = await server.get('test', 'wrongKey');
      expect(response).toEqual(Status.NotFound());
    });

    it('should return 404 when account is not found', async () => {
      const response = await server.get('test', 'adminKey');
      expect(response).toEqual(Status.NotFound());
    });

    it('should return account and 200 when correct adminKey is used and account exists', async () => {
      const account: Account = { name: 'test', apiKey: 'key', isDeleted: false };
      await db.save('user', 'test', account);

      const response = await server.get('test', 'adminKey');
      expect(response).toEqual(Status.Ok(account));
    });
  });
});