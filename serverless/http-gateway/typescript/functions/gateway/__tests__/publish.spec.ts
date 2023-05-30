import { InMemoryDb } from "../src/InMemoryDb";
import { InternalServer } from "../src/InternalServer";
import { Version } from "../src/Version";

describe('Server', () => {
  let dbMock: InMemoryDb;
  let server: InternalServer;
  ;

  beforeEach(() => {
    dbMock = new InMemoryDb();
    server = new InternalServer(dbMock);
  });

  describe('_publish', () => {
    it('should save new version correctly', async () => {
      const user = 'user';
      const packageName = 'package';
      const uri = 'uri';
      const version = '1.0.0';

      await server.publish(user, packageName, uri, version);

      const savedVersions = await dbMock.read<Version[]>('name', `${user}/${packageName}`);
      expect(savedVersions).toEqual([{ name: version, uri }]);
    });

    it('should save multiple versions', async () => {
      const user = 'user';
      const packageName = 'package';
      const uri1 = 'uri1';
      const uri2 = 'uri2';
      const version1 = '1.0.0';
      const version2 = '2.0.0';

      await server.publish(user, packageName, uri1, version1);
      await server.publish(user, packageName, uri2, version2);

      const savedVersions = await dbMock.read<Version[]>('name', `${user}/${packageName}`);
      expect(savedVersions).toEqual([{ name: version1, uri: uri1 }, { name: version2, uri: uri2 }]);
    });
  });

  describe('resolve', () => {
    it('should return latest version if no version is specified', async () => {
      const user = 'user';
      const packageName = 'package';
      const version1: Version = { name: '1.0.0', uri: 'uri1' };
      const version2: Version = { name: '2.0.0', uri: 'uri2' };

      // first publish versions
      await dbMock.save('name', `${user}/${packageName}`, [version1, version2]);

      const result = await server.resolve(user, packageName);

      expect(result).toEqual({ statusCode: 200, body: { uri: version2.uri } });
    });

    it('should return the specified version', async () => {
      const user = 'user';
      const packageName = 'package';
      const version1: Version = { name: '1.0.0', uri: 'uri1' };
      const version2: Version = { name: '2.0.0', uri: 'uri2' };

      // first publish versions
      await dbMock.save('name', `${user}/${packageName}`, [version1, version2]);

      const result = await server.resolve(user, packageName, version1.name);

      expect(result).toEqual({ statusCode: 200, body: { uri: version1.uri } });
    });

    it('should return 404 if package not found', async () => {
      const user = 'user';
      const packageName = 'non_existent_package';

      const result = await server.resolve(user, packageName);

      expect(result).toEqual({ statusCode: 404 });
    });
  });
});
