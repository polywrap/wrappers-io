
export class Status {
  static Ok<TBody>(body: TBody) {
    return {
      statusCode: 200,
      body: body,
    };
  }

  static ServerError(message: string) {
    return {
      statusCode: 500,
      body: message,
    };
  }

  static NotFound() {
    return {
      statusCode: 404,
    };
  }
}
