import { IHttpResponse } from "./IHttpResponse";

export class HttpResponse {
  static Ok<TBody>(body: TBody, headers?: Record<string, string>) {
    if (body) {
      return {
        statusCode: 200,
        body: body,
        headers
      } as IHttpResponse;
    } else {
      return {
        statusCode: 200,
        headers
      } as IHttpResponse;
    }
  }

  static ServerError(message: string, headers?: Record<string, string>) {
    return {
      statusCode: 500,
      body: message,
      headers
    } as IHttpResponse;
  }

  static NotFound(headers?: Record<string, string>) {
    return {
      statusCode: 404,
      headers
    } as IHttpResponse;
  }
}
