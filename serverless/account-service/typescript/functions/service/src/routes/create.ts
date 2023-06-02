import { setupRoute } from "../setup";
import { EnvVars } from "../envs";
import { FunctionManager } from "../functions/FunctionManager";

const pathParameters = ["user", "adminKey"] as const;
const queryParameters = [] as const;
const headers = [] as const;
type Body = {
};

const handler = async (event: RouteEvent, functionManager: FunctionManager, envVars: EnvVars): Promise<any> => {
  const { user, adminKey } = event.pathParameters;

  return functionManager.create(user, adminKey);
};

export const rawHandler = (event: any, context: any): Promise<any> => {
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
