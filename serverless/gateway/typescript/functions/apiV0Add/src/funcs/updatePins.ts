// import { InMemoryFile } from "../types/InMemoryFile";
// import * as AWS from "aws-sdk";

// export const updatePins = async (
//   cid: string,
//   dynamoDbClient: AWS.DynamoDB.DocumentClient,
//   wrappersTable: string
// ): Promise<void> => {
//   const params = {
//     TableName: wrappersTable,
//     Item: {
//       cid,
//     },
//   };

//   const pins = await dynamoDbClient.get({
//     TableName: wrappersTable,
//     Key: {
//       name: "pinned-wrappers",
//     },
//   }).promise();

//   pins.Item

//   console.log("saveUploadedWrapper");
//   await dynamoDbClient.update(params).promise();
//   console.log("saved");
// };

// cid: string, 
// name: string,
// version: string,
// type: string,
// size: string,
// indexes: string[],