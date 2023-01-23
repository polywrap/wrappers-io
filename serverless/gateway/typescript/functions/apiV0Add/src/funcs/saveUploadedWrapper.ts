import { InMemoryFile } from "../types/InMemoryFile";
import * as AWS from "aws-sdk";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export const saveUploadedWrapper = async (
  cid: string,
  dynamoDbClient: DynamoDBClient,
  wrappersTable: string
): Promise<void> => {
  const params = {
    TableName: wrappersTable,
    Item: {
      cid,
    },
  };

  console.log("saveUploadedWrapper");
  await dynamoDbClient.send(
    new PutItemCommand({
      TableName: wrappersTable,
      Item: {
        cid: { S: cid },
      },
    })
  );
  console.log("saved");
};
