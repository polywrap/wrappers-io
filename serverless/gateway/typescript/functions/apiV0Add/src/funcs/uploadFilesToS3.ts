import { InMemoryFile } from "../types/InMemoryFile";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const uploadFilesToS3 = async (
  files: InMemoryFile[],
  ipfsHash: string,
  s3: S3Client,
  wrappersBucket: string
): Promise<void> => {
  console.log("uploadFilesToS3");
  for (const file of files) {
    await s3.send(new PutObjectCommand({
      Bucket: wrappersBucket,
      Key: `${ipfsHash}/${file.path}`,
      Body: file.content,
    }));
  }
  console.log("uploaded files to s3");

};
