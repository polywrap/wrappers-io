import { IHttpResponse } from "./IHttpResponse";

export class HttpResponse {
  static Ok<TBody>(body?: TBody, headers?: Record<string, string>) {
    return {
      statusCode: 200,
      body: body,
      headers
    } as IHttpResponse;
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

  static BadRequest(message?: string, headers?: Record<string, string>) {
    return {
      statusCode: 400,
      body: {
        message
      },
      headers
    } as IHttpResponse;
  }

  static Conflict(message?: string, headers?: Record<string, string>) {
    return {
      statusCode: 409,
      body: {
        message
      },
      headers
    } as IHttpResponse;
  }
}
