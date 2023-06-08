import { IRepository } from "serverless-utils"; 
import { PackageService, PublishError, ResolveError } from "../services/PackageService";
import { Package } from "../types/Package";

describe("PackageService", () => {
  let packageService: PackageService;
  let mockPackageRepo: IRepository<Package>;
  
  beforeEach(() => {
    mockPackageRepo = { 
      read: jest.fn(),
      save: jest.fn(),
    };
    packageService = new PackageService(mockPackageRepo);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should successfully publish a new package when all fields are provided correctly", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";
    const version = "1.0.0";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce(null);

    const result = await packageService.publish(user, packageName, uri, version);

    expect(mockPackageRepo.save).toBeCalledWith({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: version,
          uri: uri,
        },
      ],
    });

    expect(result.ok).toEqual(true);
  });

  it("should successfully publish a new package with the version set as 'latest' when the version is not specified", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce(null);

    const result = await packageService.publish(user, packageName, uri);

    expect(mockPackageRepo.save).toBeCalledWith({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "latest",
          uri: uri,
        },
      ],
    });

    expect(result.ok).toEqual(true);
  });

  it("should return an error when trying to publish a package with an invalid version (not in the correct format)", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";
    const version = "invalid_version";

    const result = await packageService.publish(user, packageName, uri, version);

    expect(result.ok).toEqual(false);
    if (result.ok !== false) {
      throw new Error("Expected result.ok to be false");
    }

    expect(result.error).toEqual(PublishError.InvalidVersionFormat);
  });

  it("should return an error when trying to publish a duplicate version", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";
    const version = "1.0.0";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "1.0.0",
          uri: "uri2",
        },
      ],
    });

    const result = await packageService.publish(user, packageName, uri, version);

    expect(result.ok).toEqual(false);
    if (result.ok !== false) {
      throw new Error("Expected result.ok to be false");
    }

    expect(result.error).toEqual(PublishError.DuplicateVersion);
  });

  it("should return an error when trying to publish latest version after specific ones", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "1.0.0",
          uri: "uri2",
        },
      ],
    });

    const result = await packageService.publish(user, packageName, uri);

    expect(result.ok).toEqual(false);
    if (result.ok !== false) {
      throw new Error("Expected result.ok to be false");
    }

    expect(result.error).toEqual(PublishError.LatestVersionNotAllowed);
  });

  it("should publish latest version if it exists", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "latest",
          uri: "uri2",
        },
      ],
    });

    const result = await packageService.publish(user, packageName, uri);

    expect(result.ok).toEqual(true);
  });

  it("should successfully save the new package", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";
    const version = "1.0.0";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce(null);

    await packageService.publish(user, packageName, uri, version);

    expect(mockPackageRepo.save).toBeCalledWith({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: version,
          uri: uri,
        },
      ],
    });
  });

  it("should resolve the concrete version", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";
    const version = "1.0.0";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: version,
          uri: uri,
        },
      ],
    });

    const result = await packageService.resolve(user, packageName, version);

    expect(result.ok).toEqual(true);
    if (result.ok !== true) {
      throw new Error("Expected result.ok to be true");
    }

    expect(result.value).toEqual(uri);
  });

  it("should resolve the partial patch version", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "1.0.4",
          uri: "uri2",
        },
        {
          name: "1.0.5",
          uri: uri,
        },
      ],
    });

    const result = await packageService.resolve(user, packageName, "1.0");

    expect(result.ok).toEqual(true);
    if (result.ok !== true) {
      throw new Error("Expected result.ok to be true");
    }

    expect(result.value).toEqual(uri);
  });

  it("should resolve the partial minor version", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "1.0.4",
          uri: "uri2",
        },
        {
          name: "1.1.4",
          uri: "uri3",
        },
        {
          name: "1.2.5",
          uri: uri,
        },
      ],
    });

    const result = await packageService.resolve(user, packageName, "1");

    expect(result.ok).toEqual(true);
    if (result.ok !== true) {
      throw new Error("Expected result.ok to be true");
    }

    expect(result.value).toEqual(uri);
  });

  it("should resolve the latest major version", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "1.0.4",
          uri: "uri2",
        },
        {
          name: "1.1.4",
          uri: "uri3",
        },
        {
          name: "1.2.5",
          uri: uri,
        },
      ],
    });

    const result = await packageService.resolve(user, packageName);

    expect(result.ok).toEqual(true);
    if (result.ok !== true) {
      throw new Error("Expected result.ok to be true");
    }

    expect(result.value).toEqual(uri);
  });

  it("should resolve the latest version", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "latest",
          uri,
        },
      ],
    });

    const result = await packageService.resolve(user, packageName);

    expect(result.ok).toEqual(true);
    if (result.ok !== true) {
      throw new Error("Expected result.ok to be true");
    }

    expect(result.value).toEqual(uri);
  });

  it("should not resolve the latest version when a partial version is provided", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "latest",
          uri,
        },
      ],
    });

    const result = await packageService.resolve(user, packageName, "1.0");

    expect(result.ok).toEqual(false);
    if (result.ok !== false) {
      throw new Error("Expected result.ok to be false");
    }

    expect(result.error).toEqual(ResolveError.VersionNotFound);
  });

  it("should not resolve the latest version when a concrete version is provided", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockResolvedValueOnce({
      name: `${user}/${packageName}`,
      versions: [
        {
          name: "latest",
          uri,
        },
      ],
    });

    const result = await packageService.resolve(user, packageName, "1.0.0");

    expect(result.ok).toEqual(false);
    if (result.ok !== false) {
      throw new Error("Expected result.ok to be false");
    }

    expect(result.error).toEqual(ResolveError.VersionNotFound);
  });

  it("should return an error when the package is not found", async () => {
    const user = "user1";
    const packageName = "package1";
    const uri = "uri1";

    (mockPackageRepo.read as jest.Mock).mockImplementationOnce((key: string) => {
      if (key === `${user}/${packageName}`) {
        return Promise.resolve({
          name: `${user}/${packageName}`,
          versions: [
            {
              name: "1.0.0",
              uri,
            },
          ],
        });
      } else {
        return Promise.resolve(null);
      }
    });

    const result = await packageService.resolve(user, "other-package", "1.0.0");

    expect(result.ok).toEqual(false);
    if (result.ok !== false) {
      throw new Error("Expected result.ok to be false");
    }

    expect(result.error).toEqual(ResolveError.PackageNotFound);
  });
});
