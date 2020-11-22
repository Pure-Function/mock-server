import { Request, Response } from "express";
import express from "express";
import { isNumber } from "lodash";

import { DataStore } from "../dao/DataStore";
import { FileDataStore } from "../dao/FileDataStore";
import { ConfigService } from "../config/ConfigService";
import { getExecutors } from "../executor";
import { RequestMethod } from "../domain/RequestMethod";
import { RequestExecutor } from "../executor/RequestExecutor";
import { RequestUtil } from "../request/RequestUtil";
import { RequestConfigService } from "../request/RequestConfigService";
import { RequestConfig } from "../domain/RequestConfig";

export class Routes {
  dataPath: string;
  configPath: string;
  dataStore: DataStore;
  configService: ConfigService;
  reqExecutors: RequestExecutor[];
  requestConfigService: RequestConfigService;

  constructor(dataPath: string, configPath: string, dynamicConfig: any) {
    this.dataPath = dataPath;
    this.configPath = configPath;
    this.configService = new ConfigService(configPath, dynamicConfig);
    this.dataStore = new FileDataStore(dataPath);
    this.requestConfigService = new RequestConfigService(
      this.configService,
      this.dataStore
    );
    this.reqExecutors = getExecutors(this.dataStore);
  }

  private getReqExecutor(requestType: string): RequestExecutor {
    if (requestType !== null) {
      for (const reqExecutor of this.reqExecutors) {
        if (reqExecutor.getSupportedRequestTypes().indexOf(requestType) != -1) {
          return reqExecutor;
        }
      }
    }
    return null;
  }

  protected throwError(
    request: Request,
    response: Response,
    dataStore: DataStore,
    requestConfig: RequestConfig
  ) {
    const reqPath: string = request.path;
    const idName =
      requestConfig && requestConfig.idName ? requestConfig.idName : null;
    const objIdValue = idName
      ? this.requestConfigService.getIdValue(
          request,
          idName,
          reqPath,
          requestConfig.isPatternized
        )
      : null;
    RequestUtil.sendResponseData(null, response, reqPath, idName, objIdValue);
  }

  private executeRequest(
    reqPath: string,
    requestConfig: RequestConfig,
    requestMethod: RequestMethod,
    request: Request,
    response: Response
  ) {
    if (!requestConfig || !requestConfig.requestType) {
      console.log("Could not find request type, path: ", reqPath);
      this.throwError(request, response, this.dataStore, requestConfig);
      return;
    }

    const reqExecutor = this.getReqExecutor(requestConfig.requestType);
    if (reqExecutor == null) {
      console.log("Invalid request type: ", requestConfig.requestType, reqPath);
      this.throwError(request, response, this.dataStore, requestConfig);
      return;
    }

    reqExecutor.execute(
      requestMethod,
      request,
      response,
      requestConfig,
      this.requestConfigService
    );
  }

  private processRequest(
    requestMethod: RequestMethod,
    request: Request,
    response: Response
  ) {
    const reqPath: string = request.path;
    const forPost =
      RequestMethod.POST == requestMethod || RequestMethod.PUT == requestMethod;
    const requestConfig = Routes.getRequestConfig(
      reqPath,
      this.requestConfigService,
      forPost
    );
    //const self = this;
    if (
      requestConfig &&
      requestConfig.latency &&
      isNumber(requestConfig.latency)
    ) {
      setTimeout(() => {
        this.executeRequest(
          reqPath,
          requestConfig,
          requestMethod,
          request,
          response
        );
      }, requestConfig.latency);
    } else {
      this.executeRequest(
        reqPath,
        requestConfig,
        requestMethod,
        request,
        response
      );
    }
  }

  public routes(app: express.Application): void {
    app
      .route("/*")
      .get((request: Request, response: Response) => {
        this.processRequest(RequestMethod.GET, request, response);
      })
      .post((request: Request, response: Response) => {
        this.processRequest(RequestMethod.POST, request, response);
      })
      .put((request: Request, response: Response) => {
        this.processRequest(RequestMethod.PUT, request, response);
      })
      .delete((request: Request, response: Response) => {
        this.processRequest(RequestMethod.DELETE, request, response);
      });
  }

  private static getRequestConfig(
    reqPath: string,
    configService: RequestConfigService,
    forPost: boolean
  ): RequestConfig {
    return configService.getRequestConfig(reqPath, forPost);
  }
}
