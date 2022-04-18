import fs from "fs";
import https from "https";
import http from "http";
import path from "path";
import cors from "cors";
import { HttpConfig } from "../config/HttpConfig";
import { Express } from 'express';

export const runServer = (httpConfig: HttpConfig, app: Express) => {
  app.use(cors({
    origin: "*",
  }));

  if (httpConfig.sslDir) {
    if (!httpConfig.sslDir) {
      throw new Error("SSL directory not specified");
    }

    const options = {
      key: fs.readFileSync(path.join(httpConfig.sslDir, "key.pem"), { encoding: "utf-8" }),
      cert: fs.readFileSync(path.join(httpConfig.sslDir, "cert.pem"), { encoding: "utf-8" }),
      ca: fs.readFileSync(path.join(httpConfig.sslDir, "ca.pem"), { encoding: "utf-8" }),
    };

    const server = https.createServer(options, app);

    server.listen(httpConfig.httpsPort, function () {
      console.log(`HTTPS server started at http://localhost:${httpConfig.httpsPort}`);
    });
  } 
  
  if (httpConfig.httpPort) {
    const server = http.createServer({}, app);

    server.listen(httpConfig.httpPort, function () {
      console.log(`HTTP server started at http://localhost:${httpConfig.httpPort}`);
    });
  }
  
};