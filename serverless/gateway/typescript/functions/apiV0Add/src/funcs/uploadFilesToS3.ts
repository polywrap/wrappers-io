import { InMemoryFile } from "../types/InMemoryFile";
import * as AWS from "aws-sdk";

export const uploadFilesToS3 = async (
  files: InMemoryFile[],
  ipfsHash: string,
  s3: AWS.S3,
  wrappersBucket: string
): Promise<void> => {
  console.log("uploadFilesToS3");
  for (const file of files) {
    await s3
      .putObject({
        Bucket: wrappersBucket,
        Key: `${ipfsHash}/${file.path}`,
        Body: file.content,
      })
      .promise();
  }
  console.log("uploaded files to s3");

};
