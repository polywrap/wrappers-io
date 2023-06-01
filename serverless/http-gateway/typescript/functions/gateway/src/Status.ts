
export class Status {
  static Ok<TBody>(body: TBody, headers?: Record<string, string>) {
    if (body) {
      return {
        statusCode: 200,
        body: body,
        headers
      };
    } else {
      return {
        statusCode: 200,
        headers
      };
    }
  }

  static ServerError(message: string, headers?: Record<string, string>) {
    return {
      statusCode: 500,
      body: message,
      headers
    };
  }

  static NotFound(headers?: Record<string, string>) {
    return {
      statusCode: 404,
      headers
    };
  }
}
