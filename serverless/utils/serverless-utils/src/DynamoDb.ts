import { DynamoDBClient, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { IDb } from "./IDb";

export class DynamoDb implements IDb {
  constructor(private dynamoDbClient: DynamoDBClient, private tableName: string) { }

  async save<TVal>(
    keyName: string,
    keyValue: string,
    value: TVal
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Item: {
        [keyName]: { S: keyValue },
        data: { S: JSON.stringify(value) },
      },
    };

    await this.dynamoDbClient.send(new PutItemCommand(params));
  }

  async read<TVal>(
    keyName: string,
    keyValue: string
  ): Promise<TVal | undefined> {
    const params = {
      TableName: this.tableName,
      Key: {
        [keyName]: { S: keyValue },
      }
    };

    const result = await this.dynamoDbClient.send(new GetItemCommand(params));

    if (!result.Item || !result.Item.data || !result.Item.data.S) {
      return undefined;
    }

    return JSON.parse(result.Item.data.S) as TVal;
  }
}
