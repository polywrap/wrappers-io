import { InMemoryFile } from "../types/InMemoryFile";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { pack } from "tar-stream";
import { gzip } from "node-gzip";
import { Readable } from "stream";

export const uploadFilesToS3 = async (
  files: InMemoryFile[],
  ipfsHash: string,
  s3: S3Client,
  wrappersBucket: string
): Promise<void> => {
  console.log("uploadFilesToS3");

  // Tarball
  const tarBall = pack();

  for (const file of files) {
    if (file.content?.length) {
      tarBall.entry({ name: file.path }, Buffer.from(file.content));
    }
  }

  tarBall.finalize();

  const buffer = await getBufferFromReadableStream(tarBall);

  // GZip
  const gzipped = await gzip(buffer);

  // Upload gzipped
  await s3.send(
    new PutObjectCommand({
      Bucket: wrappersBucket,
      Key: `${ipfsHash}.tar.gz`,
      Body: gzipped,
    })
  );
  
  console.log("uploaded files to s3");
};

async function getBufferFromReadableStream(tarBall: Readable): Promise<Buffer> {
  const buffers: Uint8Array[] = [];

  for await (const data of tarBall) {
    buffers.push(data);
  }

  const finalBuffer = Buffer.concat(buffers);

  return finalBuffer;
}
