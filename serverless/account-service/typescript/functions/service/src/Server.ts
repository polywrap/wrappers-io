import { IDb } from "./IDb";
import { Status } from "./Status";
import { DynamoDb } from "./DynamoDb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { InternalServer } from "./InternalServer";

export class Server {
  async verify(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { accountsDb, adminKey } = result;
    const server = new InternalServer(accountsDb, adminKey);

    const { user, key, adminKey: providedAdminKey } = event.pathParameters;
    if (!user || !key) {
      return Status.ServerError("Error: Missing user or API Key");
    }

    const response = await server.verify(
      user,
      key,
      providedAdminKey
    );

    return response.toStringifiedBody();
  }

  async create(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { accountsDb, adminKey } = result;
    const server = new InternalServer(accountsDb, adminKey);

    const { user, adminKey: providedAdminKey } = event.pathParameters;
    if (!user || !providedAdminKey) {
      return Status.ServerError("Error: Missing user or key");
    }

    const response = await server.create(
      user,
      providedAdminKey
    );

    return response.toStringifiedBody();
  }

  async delete(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { accountsDb, adminKey } = result;
    const server = new InternalServer(accountsDb, adminKey);

    const { user, adminKey: providedAdminKey } = event.pathParameters;
    if (!user || !providedAdminKey) {
      return Status.ServerError("Error: Missing user or key");
    }

    const response = await server.delete(
      user,
      providedAdminKey
    );

    return response.toStringifiedBody();
  }

  async restore(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { accountsDb, adminKey } = result;
    const server = new InternalServer(accountsDb, adminKey);

    const { user, adminKey: providedAdminKey } = event.pathParameters;
    if (!user || !providedAdminKey) {
      return Status.ServerError("Error: Missing user or key");
    }

    const response = await server.restore(
      user,
      providedAdminKey
    );

    return response.toStringifiedBody();
  }

  async get(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { accountsDb, adminKey } = result;
    const server = new InternalServer(accountsDb, adminKey);

    const { user, adminKey: providedAdminKey } = event.pathParameters;
    if (!user || !providedAdminKey) {
      return Status.ServerError("Error: Missing user or key");
    }

    const response = await server.get(
      user,
      providedAdminKey
    );

    return response.toStringifiedBody();
  }
}

export const setup = (): [result: {
  accountsDb: IDb,
  adminKey: string,
} | undefined, error: any] => {
  const ACCOUNTS_TABLE = process.env.ACCOUNTS_TABLE;

  if (!ACCOUNTS_TABLE) {
    return [undefined, Status.ServerError(
      "Error: Environment variable ACCOUNTS_TABLE missing"
    )];
  }

  const WRAPPERS_GATEWAY_ADMIN_KEY = process.env.WRAPPERS_GATEWAY_ADMIN_KEY;

  if (!WRAPPERS_GATEWAY_ADMIN_KEY) {
    return [undefined, Status.ServerError(
      "Error: Environment variable WRAPPERS_GATEWAY_ADMIN_KEY missing"
    )];
  }
  
  const dynamoDbClient = getDynamoDbClient();
  const db =  new DynamoDb(dynamoDbClient, ACCOUNTS_TABLE);

  return [{accountsDb: db, adminKey: WRAPPERS_GATEWAY_ADMIN_KEY}, undefined];
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
