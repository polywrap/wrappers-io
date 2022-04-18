import { LoggerConfig } from "../config/LoggerConfig";
import pg from "pg";

interface IDependencies {
  loggerConfig: LoggerConfig;
}

export class EnsTrackingService {
  deps: IDependencies;

  constructor(deps: IDependencies) {
    this.deps = deps;
  }

  resolve(ensNode: string) {
  }

  resolveMany(ensNodes: string[]) {

  }
}
