import express, { NextFunction, Request, Response } from "express";
import { handleError } from "./api-server/handleError";
import { runServer } from "./api-server/runServer";
import { MainDependencyContainer } from "./buildMainDependencyContainer";

export class EnsTrackingApi {
  deps: MainDependencyContainer;

  constructor(deps: MainDependencyContainer) {
    this.deps = deps;
  }

  async run() {
    const app = express();

    app.all('*', handleError(async (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      //Trim and redirect multiple slashes in URL
      if (req.url.match(/[/]{2,}/g)) {
        req.url = req.url.replace(/[/]+/g, '/');
        res.redirect(req.url);
        return;
      }

      if (req.method === 'OPTIONS') {
        res.send(200);
      } else {
        this.deps.logger.log("Request: " + req.method + " " + req.url);
        next();
      }
    }));

    app.get('/api/ens/node/resolve/:ensNode', handleError(async (req, res) => {
      const ensNode = (req.params as any).ensNode;

      const resolved = this.deps.ensTrackingService.resolve(ensNode);

      res.send(resolved);
    }));

    app.post('/api/ens/node/resolve-many', handleError(async (req, res) => {
      const ensNodes: string[] = req.body.ensNodes;

      const resolved = this.deps.ensTrackingService.resolveMany(ensNodes);

      res.send(resolved);
    }));

    app.get("/", handleError(async (req, res) => {
      res.send("Status: running");
    }));

    app.get("/status", handleError(async (req, res) => {
      res.json({
        status: "running"
      });
    }));

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(500).send("Something went wrong. Check the logs for more info.");
      this.deps.logger.log(err.message);
    });

    runServer(this.deps.httpConfig, app);
  }
}