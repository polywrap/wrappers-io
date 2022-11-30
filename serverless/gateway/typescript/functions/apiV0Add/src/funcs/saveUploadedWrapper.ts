import { InMemoryFile } from "../types/InMemoryFile";
import * as AWS from "aws-sdk";

export const saveUploadedWrapper = async (
  cid: string,
  dynamoDbClient: AWS.DynamoDB.DocumentClient,
  wrappersTable: string
): Promise<void> => {
  const params = {
    TableName: wrappersTable,
    Item: {
      cid,
    },
  };

  console.log("saveUploadedWrapper");
  await dynamoDbClient.put(params).promise();
  console.log("saved");
};
