import { setupRoute } from "../setup";
import { EnvVars } from "../envs";
import { FunctionManager } from "../functions/FunctionManager";
import { buildParseRouteEvent } from "serverless-utils";

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
