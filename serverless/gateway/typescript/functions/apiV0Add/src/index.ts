import path from "path";
import * as parser from "lambda-multipart-parser";
import { InMemoryFile } from "./types";
import { saveUploadedWrapper, uploadFilesToS3, validateWrapperAndCalcCids } from "./funcs";
import * as AWS from "aws-sdk";

function prefix(words: string[]){
  // check border cases size 1 array and empty first word)
  if (!words[0] || words.length ==  1) return words[0] || "";
  let i = 0;
  // while all words have the same character at position i, increment i
  while(words[0][i] && words.every(w => w[i] === words[0][i]))
    i++;
  
  // prefix is the substring from the beginning to the last successfully checked i
  return words[0].substr(0, i);
}

export const stripBasePath = (files: InMemoryFile[]) => {
  if (files.length === 0 || files.length === 1) {
    return files;
  }
  let basePath = prefix(files.map(f => f.path + "/"));
  const lastPathSeparator = Math.max(basePath.lastIndexOf("/"), basePath.lastIndexOf("\\"));
  basePath = basePath.slice(0, lastPathSeparator + 1);

  return files.map(file => ({
    path: basePath 
      ? path.relative(basePath, file.path + "/") 
      : file.path,
    content: file.content
  })).filter(file => !!file.path);
};

const internalServerError = (message: string) => {
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message),
  };
};

const s3 = new AWS.S3();

const WRAPPERS_BUCKET = process.env.WRAPPERS_BUCKET
const UPLOADED_WRAPPERS_TABLE = process.env.UPLOADED_WRAPPERS_TABLE;

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

export const apiV0Add = async (event: any, context: any) => {
  if (!WRAPPERS_BUCKET) {
    return internalServerError('Error: Environment variable WRAPPERS_BUCKET missing');
  }

  if (!UPLOADED_WRAPPERS_TABLE) {
    return internalServerError('Error: Environment variable UPLOADED_WRAPPERS_TABLE missing');
  }

  const parseResult = await parser.parse(event);

  if (!parseResult.files) {
    return internalServerError('No files were uploaded');
  };

  const filesToAdd: InMemoryFile[] = parseResult.files.map(x => {
    const pathToFile = decodeURIComponent(x.filename);

    //If the file is a directory, we don't add the buffer, otherwise we get a different CID than expected
    if (x.contentType === "application/x-directory") {
      return {
        path: pathToFile,
      };
    } else {
      return {
        path: pathToFile,
        content: x.content,
      };
    }
  });

  const sanitizedFiles = stripBasePath(filesToAdd);

  const result = await validateWrapperAndCalcCids(sanitizedFiles);
 
  if(!result.valid) {
    return internalServerError(`Upload is not a valid wrapper. Reason: ${result.failReason}`);
  }

  console.log(`Gateway add: ${result.cid}`);

  if(!result.cid) {
    return internalServerError('Upload is not a valid directory');
  }

  const cid = result.cid;

  console.log("WRAPPERS_BUCKET", WRAPPERS_BUCKET);
  console.log("UPLOADED_WRAPPERS_TABLE", UPLOADED_WRAPPERS_TABLE);
  await uploadFilesToS3(result.files, cid, s3, WRAPPERS_BUCKET);

  await saveUploadedWrapper(cid, dynamoDbClient, UPLOADED_WRAPPERS_TABLE);
  // const info = this.deps.persistenceStateManager.getTrackedIpfsHashInfo(ipfsHash);
  // const retryCount = info?.unresponsiveInfo?.retryCount || info?.unresponsiveInfo?.retryCount === 0
  //   ? info?.unresponsiveInfo?.retryCount + 1
  //   : 0;

  // await this.deps.persistenceService.pinWrapper(ipfsHash, retryCount, info?.indexes ?? []);

  let resp = "";
  for (const file of result.files) {
    resp += JSON.stringify({
      Name: file.path,
      Hash: file.cid,
      Size: file.size,
    }) + "\n";
  }

  const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: resp,
  };
  return response;
};
