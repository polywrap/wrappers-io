import { setupRoute } from "../setup";
import { EnvVars } from "../envs";
import { FunctionManager } from "../functions/FunctionManager";
import { buildParseRouteEvent } from "serverless-utils";

const pathParameters = ["user", "key", "adminKey"] as const;
const queryParameters = [] as const;
const headers = [] as const;
type Body = {
};

const handler = async (event: RouteEvent, functionManager: FunctionManager, envVars: EnvVars): Promise<any> => {
  const { user, key, adminKey } = event.pathParameters;
  
  return await functionManager.verify(
    user,
    key,
    adminKey
  );
};

export const rawHandler = (event: any, context: any): Promise<any> => {
  return setupRoute(event, context, handler, buildParseRouteEvent(pathParameters, queryParameters, headers));
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
