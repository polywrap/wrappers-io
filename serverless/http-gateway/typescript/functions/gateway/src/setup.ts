import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDb, HttpResponse, IDb, IHttpResponse, RepositoryBase } from "serverless-utils";
import { Package } from "./types/Package";
import { FunctionManager } from "./functions/FunctionManager";
import { Result, ResultErr, ResultOk } from "@polywrap/result";
import { ENV_VARS, EnvVars } from "./envs";
import { AccountService } from "./services/AccountService";
import { PackageService } from "./services/PackageService";

const initializeDependencies = (): Result<{functionManager: FunctionManager, envVars: EnvVars}, HttpResponse> => {
  const result = setupEnvVars();
  if (!result.ok) {
    return result;
  }
  const envVars = result.value;

  const dynamoDbClient = getDynamoDbClient();

  const packagesDb = new DynamoDb(dynamoDbClient, envVars.PACKAGES_TABLE);
  const packageRepository = new RepositoryBase<Package>(packagesDb, "name");
  const accountService = new AccountService(envVars.ACCOUNT_SERVICE_URI, envVars.WRAPPERS_GATEWAY_ADMIN_KEY);

  const functionManager = new FunctionManager(
    new PackageService(packageRepository), 
    accountService
  );

  return ResultOk({functionManager, envVars: envVars as EnvVars});
};

export const setupRoute = async (event: any, context: any, handler: (event: any, functionManager: FunctionManager, envVars: EnvVars) => Promise<any>, parse: (event: any) => any) => {
  const result = initializeDependencies();
  if (!result.ok) {
    return result.error;
  }

  const { functionManager, envVars } = result.value;

  const response = await handler(parse(event), functionManager, envVars);

  return {
    ...response,
    body: response.body ? JSON.stringify(response.body) : undefined,
  };
}

const setupEnvVars = (): Result<EnvVars, IHttpResponse> => {
  const envVars: any = {};

  for (const envVar of ENV_VARS) {
    if (!process.env[envVar]) {
      return ResultErr(HttpResponse.ServerError(
        `Error: Environment variable ${envVar} missing`
      ));
    } else {
      envVars[envVar] = process.env[envVar];
    }
  }

  return ResultOk(envVars as EnvVars);
};

function getDynamoDbClient(): DynamoDBClient {
  console.log("OFFLINE", process.env.IS_OFFLINE);
  if (process.env.IS_OFFLINE) {
    return new DynamoDBClient({
      region: "localhost",
      endpoint: "http://localhost:8001",
      credentials: {
        accessKeyId: "DEFAULT_ACCESS_KEY",
        secretAccessKey: "DEFAULT_SECRET",
      },
    });
  }

  return new DynamoDBClient({});
}
