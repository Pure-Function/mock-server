import { Application } from "express";
import dotenv from "dotenv";

import MockServerApp from "./app/MockServerApp";

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

/*
startMockServer("../mock-restapi-server/mock_data/config", "../mock-restapi-server/mock_data/data", 
{"/test": {
  "idName": "testId",
  "requestType": "CUSTOM",
  "otherConfig": {"custom_attr1": "value1"},
  "response": function (request:any, response:any, requestConfig:any) {
    response.status(400).send({"success":"test successful!!!!!!!!!"});
  } 
} }, 3000);
*/
