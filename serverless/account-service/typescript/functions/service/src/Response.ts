import { IResponse } from "./IResponse";

export class Response<T> implements IResponse {
  statusCode: number;
  body?: T;

  constructor(statusCode: number, body?: T) {
    this.statusCode = statusCode;
    this.body = body;
  }

  toStringifiedBody(): any {
    return {
      statusCode: this.statusCode,
      body: JSON.stringify(this.body),
    }
  }
}
