import { InMemoryFile } from "../types/InMemoryFile";
import * as AWS from "aws-sdk";
import { IpfsAddResult } from "../types";

export const validateWrapperAndCalcCids = async (
  files: InMemoryFile[],
): Promise<{
  valid: boolean;
  failReason?: number;
  cid: string;
  files: IpfsAddResult[];
}> => {
  console.log("validateWrapperAndCalcCids",  process.env.IS_OFFLINE);
  var lambda = new AWS.Lambda({
    endpoint: process.env.IS_OFFLINE ? "http://localhost:3002" : undefined,
  });
  
  const result = await lambda.invoke({
    FunctionName: 'validateWrapperAndCalcCids',
    Payload: JSON.stringify({
      files
    }),
  }).promise();

  
  const parsedResult = JSON.parse((result.$response.data as any).Payload as string);
  
  console.log("validateWrapperAndCalcCids done", parsedResult);
  return parsedResult;
};
