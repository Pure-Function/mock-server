import { Request, Response } from "express";
import express from "express";
import { isNumber, isFunction, isPlainObject } from "lodash";

import { DataStore } from "../dao/DataStore";
import { FileDataStore } from "../dao/FileDataStore";
import { ConfigService } from "../config/ConfigService";
import { ConfigConstants } from "../config/ConfigConstants";
import { getExecutors } from "../executor";
import { RequestMethod } from "../domain/RequestMethod";
import { RequestExecutor } from "../executor/RequestExecutor";
import { RequestUtil } from "../request/RequestUtil";
import { RequestConfigService } from "../request/RequestConfigService";
import { RequestConfig } from "../domain/RequestConfig";
import { FileSystemService } from "../filesystem/FileSystemService";

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
    // setup global data
    this.initialize(configPath);

    this.configService = new ConfigService(configPath, dynamicConfig);
    this.dataStore = new FileDataStore(dataPath);
    this.requestConfigService = new RequestConfigService(
      this.configService,
      this.dataStore
    );
    this.reqExecutors = getExecutors(this.dataStore);
  }

  private initializeGlobalInitData(): any {
    return {
      pathSettings: {
        "/": {
          response: "Ok."
        }
      },
      defaultConfig: {
        requestType: "REST",
        statusCode: 200,
        idName: "id",
        response: "To Be Implemented.",
        latency: 0,
        otherConfig: {}
      },
      errorConfig: {
        statusCode: 400,
        response: "Invalid Request."
      },
      overwriteConfig: {
        statusCode: null,
        response: null,
        latency: null
      }
    };
  }

  private initialize(configPath: string) {
    if (FileSystemService.exists(configPath)) {
      const globalPath = FileSystemService.join(
        configPath,
        ConfigConstants.DEFAULT_CONFIG
      );
      if (!FileSystemService.exists(globalPath)) {
        FileSystemService.writeFileSync(
          globalPath,
          this.initializeGlobalInitData()
        );
      }
    }
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
    let idName,
      objIdValue,
      errorStatusCode,
      errorMsg,
      successStatusCode = null;

    if (isPlainObject(requestConfig)) {
      idName = requestConfig.idName;
      if (idName) {
        objIdValue = this.requestConfigService.getIdValue(
          request,
          idName,
          reqPath,
          requestConfig.isPatternized
        );
      }
      errorStatusCode = requestConfig.errorStatusCode;
      errorMsg = requestConfig.errorMsg;
      successStatusCode = requestConfig.successStatusCode;
    }
    RequestUtil.sendResponseData(
      null,
      response,
      reqPath,
      idName,
      objIdValue,
      errorStatusCode,
      errorMsg,
      successStatusCode
    );
  }

  private executeRequest(
    reqPath: string,
    requestConfig: RequestConfig,
    requestMethod: RequestMethod,
    request: Request,
    response: Response,
    next: any
  ) {
    if (!requestConfig || !requestConfig.requestType) {
      console.log("Could not find request type, path: ", reqPath);
      if (next && isFunction(next)) {
        next();
      } else {
        this.throwError(request, response, this.dataStore, requestConfig);
        return;
      }
    }

    const reqExecutor = this.getReqExecutor(requestConfig.requestType);
    if (reqExecutor == null) {
      if (next && isFunction(next)) {
        next();
      } else {
        console.log(
          "Invalid request type: ",
          requestConfig.requestType,
          reqPath
        );
        this.throwError(request, response, this.dataStore, requestConfig);
        return;
      }
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
    response: Response,
    next: any
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
          response,
          null
        );
      }, requestConfig.latency);
    } else {
      this.executeRequest(
        reqPath,
        requestConfig,
        requestMethod,
        request,
        response,
        next
      );
    }
  }

  public routes(app: express.Application): void {
    app
      .route("/*")
      .get((request: Request, response: Response) => {
        this.processRequest(RequestMethod.GET, request, response, null);
      })
      .post((request: Request, response: Response) => {
        this.processRequest(RequestMethod.POST, request, response, null);
      })
      .put((request: Request, response: Response) => {
        this.processRequest(RequestMethod.PUT, request, response, null);
      })
      .delete((request: Request, response: Response) => {
        this.processRequest(RequestMethod.DELETE, request, response, null);
      });
  }

  public middleware(request: Request, response: Response, next: any) {
    const requestMethod =
      RequestMethod[request.method as keyof typeof RequestMethod];
    this.processRequest(requestMethod, request, response, next);
  }

  private static getRequestConfig(
    reqPath: string,
    configService: RequestConfigService,
    forPost: boolean
  ): RequestConfig {
    return configService.getRequestConfig(reqPath, forPost);
  }
}
