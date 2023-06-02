import { setupRoute } from "../setup";
import { EnvVars } from "../envs";
import { FunctionManager } from "../functions/FunctionManager";

const pathParameters = ["user", "packageAndVersion"] as const;
const queryParameters = [] as const;
const headers = ["x-api-key"] as const;
type Body = {
  uri: string;
};

const handler = async (event: RouteEvent, functionManager: FunctionManager, envVars: EnvVars): Promise<any> => {
  const { user, packageAndVersion } = event.pathParameters;

  return functionManager.publish(user, packageAndVersion, event.body.uri, event.headers["x-api-key"]);
};

export const publish = (event: any, context: any): Promise<any> => {
  return setupRoute(event, context, handler, parse);
};

type PathParameters = {
  [key in typeof pathParameters[number]]: string;
};
type QueryParameters = {
  [key in typeof queryParameters[number]]: string;
};
type Headers = {
  [key in typeof headers[number]]: string;
};

type RouteEvent = {
  pathParameters: PathParameters,
  queryParameters: QueryParameters,
  headers: Headers,
  body: Body,
};

function parse(event: any): RouteEvent {
  const typePathParams: any = {};
  for (const param of pathParameters) {
    typePathParams[param] = event.pathParameters[param];
  }

  const typedQueryParams: any = {};
  for (const param of queryParameters) {
    typedQueryParams[param] = event.queryStringParameters[param];
  }

  const typedHeaders: any = {};
  for (const header of headers) {
    typedHeaders[header] = event.headers[header];
  }

  const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;

  return {
    pathParameters: typePathParams,
    queryParameters: typedQueryParams,
    headers: typedHeaders,
    body: JSON.parse(body),
  } as RouteEvent;
};
