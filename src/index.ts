import { Application } from "express";
import dotenv from "dotenv";

import MockServerApp from "./app/MockServerApp";
import { Routes } from "./routes/routes";
import { Request, Response } from "express";

dotenv.config();

export function createMockServer(
  configPath: string,
  dataPath: string,
  dynamicConfig: any = null
): Application {
  return new MockServerApp(configPath, dataPath, dynamicConfig).app;
}

export function startMockServer(
  configPath: string,
  dataPath: string,
  dynamicConfig: any = null,
  port = 3000
) {
  const app = createMockServer(configPath, dataPath, dynamicConfig);
  app.listen(port, () => {
    // tslint:disable-next-line
    console.log("Express server listening on port ", port);
  });
}

export function middleware(
  configPath: string,
  dataPath: string,
  dynamicConfig: any = null
) {
  const routes = new Routes(dataPath, configPath, dynamicConfig);
  return function(request: Request, response: Response, next: any) {
    return routes.middleware(request, response, next);
  };
}
