import { GetError, PackageService, PublishError, ResolveError } from "../services/PackageService";
import { IAccountService } from "../services/IAccountService";
import { HttpResponse } from "serverless-utils";
import { FunctionManager } from "../functions/FunctionManager";
import { ResultErr, ResultOk } from "@polywrap/result";

describe("FunctionManager", () => {
  let packageService: jest.Mocked<PackageService>;
  let accountService: jest.Mocked<IAccountService>;
  let functionManager: FunctionManager;

  beforeEach(() => {
    packageService = {
      publish: jest.fn(),
      resolve: jest.fn(),
      get: jest.fn(),
    } as any;

    accountService = {
      verify: jest.fn(),
    } as any;

    functionManager = new FunctionManager(packageService, accountService);
  });

  describe("publish", () => {
    it("should return an error when user or package name is missing", async () => {
      const response = await functionManager.publish("", "package@1.0.0", "uri", "apiKey");
      expect(response).toEqual(HttpResponse.ServerError("Error: Missing User or Package Name"));
    });

    it("should return 404 when user is not verified", async () => {
      accountService.verify.mockResolvedValue(false);
      const response = await functionManager.publish("user", "package@1.0.0", "uri", "apiKey");
      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should return OK when publishing is successful", async () => {
      accountService.verify.mockResolvedValue(true);
      packageService.publish.mockResolvedValue({ok: true, value: undefined });
      const response = await functionManager.publish("user", "package@1.0.0", "uri", "apiKey");
      expect(response).toEqual(HttpResponse.Ok());
    });

    it("should handle different publish errors", async () => {
      accountService.verify.mockResolvedValue(true);
      packageService.publish.mockResolvedValue({ok: false, error: PublishError.InvalidVersionFormat});
      let response = await functionManager.publish("user", "package@1.0.0", "uri", "apiKey");
      expect(response).toEqual(HttpResponse.BadRequest("Invalid Version Format"));

      packageService.publish.mockResolvedValue({ok: false, error: PublishError.DuplicateVersion});
      response = await functionManager.publish("user", "package@1.0.0", "uri", "apiKey");
      expect(response).toEqual(HttpResponse.BadRequest("Invalid Version Format"));

      packageService.publish.mockResolvedValue({ok: false, error: PublishError.LatestVersionNotAllowed});
      response = await functionManager.publish("user", "package@1.0.0", "uri", "apiKey");
      expect(response).toEqual(HttpResponse.BadRequest("Invalid Version Format"));
    });
  });

  describe("resolve", () => {
    it("should return an error when user or package name is missing", async () => {
      const response = await functionManager.resolve("", "package@1.0.0");
      expect(response).toEqual(HttpResponse.ServerError("Error: Missing User or Package Name"));
    });

    it("should return OK and uri when resolving is successful", async () => {
      packageService.resolve.mockResolvedValue({ok: true, value: "uri"});
      const response = await functionManager.resolve("user", "package@1.0.0");
      expect(response).toEqual(HttpResponse.Ok({uri: "uri"}));
    });

    it("should handle different resolve errors", async () => {
      packageService.resolve.mockResolvedValue({ok: false, error: ResolveError.PackageNotFound});
      let response = await functionManager.resolve("user", "package@1.0.0");
      expect(response).toEqual(HttpResponse.NotFound());

      packageService.resolve.mockResolvedValue({ok: false, error: ResolveError.VersionNotFound});
      response = await functionManager.resolve("user", "package@1.0.0");
      expect(response).toEqual(HttpResponse.NotFound());

      packageService.resolve.mockResolvedValue({ok: false, error: ResolveError.VersionNotFound});
      response = await functionManager.resolve("user", "package@1.0.0");
      expect(response).toEqual(HttpResponse.NotFound());
    });


    it("should resolve the concrete version", async () => {
      const uri = "uri";
      
      packageService.resolve.mockImplementationOnce((user: string, packageName: string, version?: string) => {
        if (user == "user" && packageName == "package" && version == "1.0.0") {
          return Promise.resolve(ResultOk(uri));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.resolve("user", "package@1.0.0");

      expect(response).toEqual(HttpResponse.Ok({ uri }));
    });

    it("should resolve the partial patch version", async () => {
      const uri = "uri";
     
      packageService.resolve.mockImplementationOnce((user: string, packageName: string, version?: string) => {
        if (user == "user" && packageName == "package" && version == "1.0") {
          return Promise.resolve(ResultOk(uri));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.resolve("user", "package@1.0");

      expect(response).toEqual(HttpResponse.Ok({ uri }));
    });

    it("should resolve the partial minor version", async () => {
      const uri = "uri";
     
      packageService.resolve.mockImplementationOnce((user: string, packageName: string, version?: string) => {
        if (user == "user" && packageName == "package" && version == "1") {
          return Promise.resolve(ResultOk(uri));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.resolve("user", "package@1");

      expect(response).toEqual(HttpResponse.Ok({ uri }));
    });

    it("should resolve the latest major version", async () => {
      const uri = "uri1";
     
      packageService.resolve.mockImplementationOnce((user: string, packageName: string, version?: string) => {
        if (user == "user" && packageName == "package" && !version) {
          return Promise.resolve(ResultOk(uri));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.resolve("user", "package");

      expect(response).toEqual(HttpResponse.Ok({ uri }));
    });

    it("should resolve the latest version", async () => {
      const uri = "uri";

      packageService.resolve.mockImplementationOnce((user: string, packageName: string, version?: string) => {
        if (user == "user" && packageName == "package" && version == "latest") {
          return Promise.resolve(ResultOk(uri));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.resolve("user", "package@latest");

      expect(response).toEqual(HttpResponse.Ok({ uri }));
    });

    it("should return an error when the version is not found", async () => {
      packageService.resolve.mockImplementationOnce((user: string, packageName: string, version?: string) => {
        if (user == "user" && packageName == "package" && version == "1.0.0") {
          return Promise.resolve(ResultErr(ResolveError.VersionNotFound));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.resolve("user", "package@1.0.0");

      expect(response).toEqual(HttpResponse.NotFound());
    });

    it("should return an error when the package is not found", async () => {
      packageService.resolve.mockImplementationOnce((user: string, packageName: string, version?: string) => {
        if (user == "user" && packageName == "package" && version == "1.0.0") {
          return Promise.resolve(ResultErr(ResolveError.PackageNotFound));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.resolve("user", "package@1.0.0");

      expect(response).toEqual(HttpResponse.NotFound());
    });
  });

  describe("packageInfo", () => {
    it("should return an error when user or package name is missing", async () => {
      expect(
        await functionManager.packageInfo("", "package")
      ).toEqual(HttpResponse.ServerError("Error: Missing User or Package Name"));
      expect(
        await functionManager.packageInfo("user", "")
      ).toEqual(HttpResponse.ServerError("Error: Missing User or Package Name"));
    });

    it("should return OK and info when package exists", async () => {
      const packageInfo = {
        name: "package",
        user: "user",
        versions: [
          {
            name: "1.0.0",
            uri: "uri1"
          }
        ]
      };
     
      packageService.get.mockImplementationOnce((user: string, packageName: string) => {
        if (user == packageInfo.user && packageName == packageInfo.name) {
          return Promise.resolve(ResultOk(packageInfo));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.packageInfo(packageInfo.user, packageInfo.name);

      expect(response).toEqual(HttpResponse.Ok(packageInfo));
    });


    it("should return error when package does not exist", async () => {
      const packageInfo = {
        name: "package",
        user: "user",
        versions: [
          {
            name: "1.0.0",
            uri: "uri1"
          }
        ]
      };
     
      packageService.get.mockImplementationOnce((user: string, packageName: string) => {
        if (user == packageInfo.user && packageName == "package2") {
          return Promise.resolve(ResultErr(GetError.PackageNotFound));
        } else {
          throw new Error("Unexpected call");
        }
      });

      const response = await functionManager.packageInfo(packageInfo.user, "package2");

      expect(response).toEqual(HttpResponse.NotFound());      
    });
  });
});
