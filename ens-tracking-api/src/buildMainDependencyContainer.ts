import * as awilix from "awilix";
import { NameAndRegistrationPair } from "awilix";
import { HttpConfig } from "./config/HttpConfig";
import { LoggerConfig } from "./config/LoggerConfig";
import { EnsTrackingApi } from "./EnsTrackingApi";
import { EnsTrackingService } from "./services/EnsTrackingService";
import { Logger } from "./services/Logger";

export interface MainDependencyContainer {
  loggerConfig: LoggerConfig;
  httpConfig: HttpConfig;
  logger: Logger;
  ensTrackingApi: EnsTrackingApi;
  ensTrackingService: EnsTrackingService;
}

export const buildMainDependencyContainer = async (
  extensionsAndOverrides?: NameAndRegistrationPair<unknown>
): Promise<awilix.AwilixContainer<MainDependencyContainer>> => {

  const container = awilix.createContainer<MainDependencyContainer>({
    injectionMode: awilix.InjectionMode.PROXY,
  });

  container.register({
    httpConfig: awilix.asClass(HttpConfig).singleton(),
    loggerConfig: awilix.asClass(LoggerConfig).singleton(),
    logger: awilix.asClass(Logger).singleton(),
    ensTrackingApi: awilix.asClass(EnsTrackingApi).singleton(),
    ensTrackingService: awilix.asClass(EnsTrackingService).singleton(),
    ...extensionsAndOverrides,
  });

  return container;
};