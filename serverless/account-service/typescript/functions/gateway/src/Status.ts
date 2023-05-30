import { IResponse } from "./IResponse";
import { Response } from "./Response";


export class Status {
  static Ok<T>(body: T): Response<T> {
    return new Response<T>(200, body);
  }

  static ServerError(message: string): Response<string> {
    return new Response<string>(500, message);
  }

  static NotFound(): IResponse {
    return {
      statusCode: 404,
      toStringifiedBody: () => { statusCode: 404 },
    };
  }
}
