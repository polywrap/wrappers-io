import { setupRoute } from "../setup";
import { EnvVars } from "../envs";
import { FunctionManager } from "../functions/FunctionManager";
import { buildParseRouteEvent } from "serverless-utils";

export const pathParameters = ["user", "adminKey"] as const;
export const queryParameters = [] as const;
export const headers = [] as const;
type Body = {
};

const handler = async (event: RouteEvent, functionManager: FunctionManager, envVars: EnvVars): Promise<any> => {
  const { user, adminKey } = event.pathParameters;

  return functionManager.delete(user, adminKey);
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
