import { DataStore } from "../dao/DataStore";
import { Request, Response } from "express";
import { RequestMethod } from "../domain/RequestMethod";
import { RequestUtil } from "../request/RequestUtil";
import { RequestConfig } from "../domain/RequestConfig";
import { RequestExecutor } from "./RequestExecutor";
import { RequestType } from "../domain/RequestType";
import { RequestConfigService } from "../request/RequestConfigService";

export class CustomRequestExecutor implements RequestExecutor {
  dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  public getSupportedRequestTypes(): string[] {
    return [RequestType.CUSTOM];
  }

  protected throwError(
    request: Request,
    response: Response,
    errorStatusCode: number,
    errorMsg: string
  ) {
    const reqPath: string = request.path;
    RequestUtil.sendResponseData(
      null,
      response,
      reqPath,
      null,
      null,
      errorStatusCode,
      errorMsg
    );
  }

  public execute(
    method: RequestMethod,
    request: Request,
    response: Response,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    switch (method) {
      case RequestMethod.GET:
      case RequestMethod.POST:
      case RequestMethod.PUT:
      case RequestMethod.DELETE:
        const { executorFunction, errorStatusCode } = requestConfig;
        if (executorFunction == null) {
          this.throwError(
            request,
            response,
            errorStatusCode,
            "Could not find executor function from configuration."
          );
        }
        console.log("Request configuration: ", requestConfig);
        executorFunction(request, response, requestConfig);
        break;
      default:
        console.log("Invalid Request Method...");
    }
  }
}
