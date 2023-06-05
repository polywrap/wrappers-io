export interface IHttpResponse {
  statusCode: number;
  headers: Record<string, string> | undefined;
}
