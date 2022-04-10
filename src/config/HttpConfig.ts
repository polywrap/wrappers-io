export class HttpConfig {
  httpPort = process.env.HTTP_PORT ?? 4444;
  httpsPort = process.env.HTTPS_PORT ?? 4445;
  sslDir = process.env.SSL_DIR ?? '';
}
