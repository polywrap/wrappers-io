import { IDb } from "./IDb";
import { Status } from "./Status";
import { DynamoDb } from "./DynamoDb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { InternalServer } from "./InternalServer";

export class Server {
  async publish(event: any, context: any): Promise<any> {
    const [result, error] = setup();
    if (error || !result) {
      return error;
    }

    const { uploadsDb: uploadsDb } = result;
    const server = new InternalServer(uploadsDb);

    const { user, package: packageAndVersion } = event.pathParameters;
    const { uri } = JSON.parse(event.body);

    const [packageName, version] = packageAndVersion.split("@");

    if (!user || !packageName) {
      return Status.ServerError("Error: Missing User or Package Name");
    }

    const response = await server.publish(
      user,
      packageName,
      uri,
      version
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

    const { uploadsDb: uploadsDb } = result;
    const server = new InternalServer(uploadsDb);

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
} | undefined, error: any] => {
  const UPLOADS_TABLE = process.env.UPLOADS_TABLE;

  const dynamoDbClient = getDynamoDbClient();

  if (!UPLOADS_TABLE) {
    return [undefined, Status.ServerError(
      "Error: Environment variable UPLOADS_TABLE missing"
    )];
  }

  const db =  new DynamoDb(dynamoDbClient, UPLOADS_TABLE);

  return [{uploadsDb: db}, undefined];
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
