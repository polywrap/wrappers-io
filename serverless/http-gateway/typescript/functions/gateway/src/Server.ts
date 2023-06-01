import { IDb } from "./IDb";
import { Status } from "./Status";
import { DynamoDb } from "./DynamoDb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { InternalServer } from "./InternalServer";
import { AccountService } from "./AccountService";
import { UploadsService } from "./UploadsService";

export class Server {
  async publish(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { uploadsDb: uploadsDb, accountServiceUri, adminKey } = result;
    const server = new InternalServer(new UploadsService(uploadsDb), new AccountService(accountServiceUri, adminKey));

    const { user, package: packageAndVersion } = event.pathParameters;
    const apiKey = event.headers["x-api-key"];

    console.log("event", event);
    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
    console.log("body", body);

    const { uri } = JSON.parse(body);
    console.log("uri", uri);

    const [packageName, version] = packageAndVersion.split("@");

    if (!user || !packageName) {
      return Status.ServerError("Error: Missing User or Package Name");
    }

    const response = await server.publish(
      user,
      packageName,
      uri,
      apiKey,
      version,
    );

    return {
      ...response,
      body: JSON.stringify(response.body),
    };
  }

  async resolve(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { uploadsDb: uploadsDb, accountServiceUri, adminKey } = result;
    const server = new InternalServer(new UploadsService(uploadsDb), new AccountService(accountServiceUri, adminKey));

    const { user, package: packageAndVersion } = event.pathParameters;

    const [packageName, version] = packageAndVersion.split("@");

    if (!user || !packageName) {
      return Status.ServerError("Error: Missing User or Package Name");
    }

    const response = await server.resolve(
      user,
      packageName,
      version
    );

    return {
      ...response,
      body: JSON.stringify(response.body),
    };
  }
}

export const setup = (): [result: {
  uploadsDb: IDb,
  accountServiceUri: string,
  adminKey: string
} | undefined, error: any] => {
  const UPLOADS_TABLE = process.env.UPLOADS_TABLE;

  if (!UPLOADS_TABLE) {
    return [undefined, Status.ServerError(
      "Error: Environment variable UPLOADS_TABLE missing"
    )];
  }

  const ACCOUNT_SERVICE_URI = process.env.ACCOUNT_SERVICE_URI;

  if (!ACCOUNT_SERVICE_URI) {
    return [undefined, Status.ServerError(
      "Error: Environment variable ACCOUNT_SERVICE_URI missing"
    )];
  }

  const WRAPPERS_GATEWAY_ADMIN_KEY = process.env.WRAPPERS_GATEWAY_ADMIN_KEY;

  if (!WRAPPERS_GATEWAY_ADMIN_KEY) {
    return [undefined, Status.ServerError(
      "Error: Environment variable WRAPPERS_GATEWAY_ADMIN_KEY missing"
    )];
  }


  const dynamoDbClient = getDynamoDbClient();
  const db =  new DynamoDb(dynamoDbClient, UPLOADS_TABLE);

  return [{uploadsDb: db, accountServiceUri: ACCOUNT_SERVICE_URI, adminKey: WRAPPERS_GATEWAY_ADMIN_KEY}, undefined];
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
