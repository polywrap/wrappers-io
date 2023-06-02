export const buildParseRouteEvent =<TRouteEvent>(
  pathParameters: readonly string[], 
  queryParameters: readonly string[], 
  headers: readonly string[]
) => {
  return (event: any): TRouteEvent => {
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

    const body = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64').toString() 
      : event.body;

    return {
      pathParameters: typePathParams,
      queryParameters: typedQueryParams,
      headers: typedHeaders,
      body: JSON.parse(body),
    } as unknown as TRouteEvent;
    };
};
