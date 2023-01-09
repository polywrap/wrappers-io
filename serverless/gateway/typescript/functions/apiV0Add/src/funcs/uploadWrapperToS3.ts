import * as AWS from "aws-sdk";

export const uploadWrapperToS3 = async (
  buffer: Uint8Array,
  ipfsHash: string,
  s3: AWS.S3,
  wrappersBucket: string
): Promise<void> => {
  await s3
    .putObject({
      Bucket: wrappersBucket,
      Key: ipfsHash,
      Body: buffer,
    })
    .promise();
};
