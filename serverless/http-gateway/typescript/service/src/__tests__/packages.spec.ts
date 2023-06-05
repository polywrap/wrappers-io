import { IRepository, InMemoryDb, RepositoryBase } from "serverless-utils";
import { Package } from "../types/Package";
import { Version } from "../types/Version";
import { PackageService } from "../services/PackageService";

describe('Server', () => {
  let packageRepo: IRepository<Package>;
  let service: PackageService;

  beforeEach(() => {
    const dbMock = new InMemoryDb();
    packageRepo = new RepositoryBase<Package>(dbMock, "name");
    service = new PackageService(packageRepo);
  });

  describe('publish', () => {
    it('should save new version correctly', async () => {
      const user = 'user';
      const packageName = 'package';
      const uri = 'uri';
      const version = '1.0.0';

      await service.publish(user, packageName, uri, version);

      const savedPackage = await packageRepo.read(`${user}/${packageName}`);
      expect(savedPackage).toEqual({
        name: `${user}/${packageName}`,
        versions: [{ name: version, uri }]
      });
    });

    it('should save multiple versions', async () => {
      const user = 'user';
      const packageName = 'package';
      const uri1 = 'uri1';
      const uri2 = 'uri2';
      const version1 = '1.0.0';
      const version2 = '2.0.0';

      await service.publish(user, packageName, uri1, version1);
      await service.publish(user, packageName, uri2, version2);

      const savedPackage = await packageRepo.read(`${user}/${packageName}`);
      expect(savedPackage).toEqual({
        name: `${user}/${packageName}`,
        versions: [{ name: version1, uri: uri1 }, { name: version2, uri: uri2 }]
      });
    });
  });

  describe('resolve', () => {
    it('should return latest version if no version is specified', async () => {
      const user = 'user';
      const packageName = 'package';
      const version1: Version = { name: '1.0.0', uri: 'uri1' };
      const version2: Version = { name: '2.0.0', uri: 'uri2' };

      await packageRepo.save({
        name: `${user}/${packageName}`,
        versions: [version1, version2]
      });

      const result = await service.resolve(user, packageName);

      expect(result).toEqual({ statusCode: 200, headers: { "x-wrap-uri": version2.uri } });
    });

    it('should return the specified version', async () => {
      const user = 'user';
      const packageName = 'package';
      const version1: Version = { name: '1.0.0', uri: 'uri1' };
      const version2: Version = { name: '2.0.0', uri: 'uri2' };

      await packageRepo.save({
        name: `${user}/${packageName}`,
        versions: [version1, version2]
      });

      const result = await service.resolve(user, packageName, version1.name);

      expect(result).toEqual({ statusCode: 200, headers: { "x-wrap-uri": version1.uri } });
    });

    it('should return 404 if package not found', async () => {
      const user = 'user';
      const packageName = 'non_existent_package';

      const result = await service.resolve(user, packageName);

      expect(result).toEqual({ statusCode: 404 });
    });
  });
});
