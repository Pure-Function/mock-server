import { DataStore } from "../dao/DataStore";
import { Request, Response } from "express";
import { RequestMethod } from "../domain/RequestMethod";
import { RequestUtil } from "../request/RequestUtil";
import { RequestConfig } from "../domain/RequestConfig";
import { RequestExecutor } from "./RequestExecutor";
import { RequestType } from "../domain/RequestType";
import { RequestConfigService } from "../request/RequestConfigService";

export class RestRequestExecutor implements RequestExecutor {
  dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  private static getData(
    request: Request,
    response: Response,
    dataStore: DataStore,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    const reqPath: string = request.path;
    const {
      idName,
      successFilePath,
      successMsg,
      searchPaths,
      isPatternized
    } = requestConfig;
    const objIdValue = requestConfigService.getIdValue(
      request,
      idName,
      reqPath,
      isPatternized
    );
    let respData: any = null;

    if (objIdValue || successFilePath) {
      /*if (writePath) {
        searchPaths.push(writePath);
      }*/
      const fileNamePrefix = requestConfigService.getFileNamePrefix(
        reqPath,
        isPatternized
      );
      respData = dataStore.get(
        objIdValue,
        searchPaths,
        successFilePath,
        fileNamePrefix
      );
    } else if (RequestUtil.isPluralRequest(requestConfig.requestType)) {
      const fileNamePrefix = requestConfigService.getFileNamePrefix(
        reqPath,
        isPatternized
      );
      respData = dataStore.getAll(searchPaths, successFilePath, fileNamePrefix);
    } else if (successMsg) {
      respData = successMsg;
    }
    RequestUtil.sendResponseData(
      respData,
      response,
      reqPath,
      idName,
      objIdValue
    );
  }

  private static saveData(
    request: Request,
    response: Response,
    dataStore: DataStore,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    const reqPath: string = request.path;
    const { idName, writePath, isPatternized } = requestConfig;
    const data = request.body;
    const fileNamePrefix = requestConfigService.getFileNamePrefix(
      reqPath,
      isPatternized,
      true
    );
    const respData = dataStore.save(idName, data, writePath, fileNamePrefix);
    RequestUtil.sendResponseData(respData, response, reqPath, idName, null);
  }

  private static updateData(
    request: Request,
    response: Response,
    dataStore: DataStore,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    const reqPath: string = request.path;
    const { idName, writePath, isPatternized } = requestConfig;
    const data = request.body;
    const fileNamePrefix = requestConfigService.getFileNamePrefix(
      reqPath,
      isPatternized,
      true
    );
    const respData = dataStore.update(idName, data, writePath, fileNamePrefix);
    RequestUtil.sendResponseData(respData, response, reqPath, idName, null);
  }

  private static deleteData(
    request: Request,
    response: Response,
    dataStore: DataStore,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    const reqPath: string = request.path;
    const {
      idName,
      writePath,
      errorMsg,
      errorStatusCode,
      isPatternized
    } = requestConfig;
    //const objIdValue = RequestUtil.getQueryValue(request, idName);
    const objIdValue = requestConfigService.getIdValue(
      request,
      idName,
      reqPath,
      isPatternized
    );
    const fileNamePrefix = requestConfigService.getFileNamePrefix(
      reqPath,
      isPatternized
    );
    const deleteStatus: boolean = dataStore.delete(
      writePath,
      objIdValue,
      fileNamePrefix
    );
    let respData: any = null;

    if (deleteStatus) {
      respData = { status: "Ok" };
    } else {
      console.log("Delete is failed");
    }
    RequestUtil.sendResponseData(
      respData,
      response,
      reqPath,
      idName,
      null,
      errorStatusCode,
      errorMsg
    );
  }

  public getSupportedRequestTypes(): string[] {
    return [RequestType.REST, RequestType.REST_PLURAL, RequestType.REST_FETCH];
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
        RestRequestExecutor.getData(
          request,
          response,
          this.dataStore,
          requestConfig,
          requestConfigService
        );
        break;
      case RequestMethod.POST:
        if (RequestUtil.isCurdRequest(requestConfig.requestType)) {
          RestRequestExecutor.saveData(
            request,
            response,
            this.dataStore,
            requestConfig,
            requestConfigService
          );
        } else {
          RestRequestExecutor.getData(
            request,
            response,
            this.dataStore,
            requestConfig,
            requestConfigService
          );
        }
        break;
      case RequestMethod.PUT:
        if (RequestUtil.isCurdRequest(requestConfig.requestType)) {
          RestRequestExecutor.updateData(
            request,
            response,
            this.dataStore,
            requestConfig,
            requestConfigService
          );
        } else {
          this.throwError(
            request,
            response,
            requestConfig.errorStatusCode,
            "Request method 'PUT' only support for Request type 'REST'."
          );
        }
        break;
      case RequestMethod.DELETE:
        if (RequestUtil.isCurdRequest(requestConfig.requestType)) {
          RestRequestExecutor.deleteData(
            request,
            response,
            this.dataStore,
            requestConfig,
            requestConfigService
          );
        } else {
          this.throwError(
            request,
            response,
            requestConfig.errorStatusCode,
            "Request method 'DELETE' only support for Request type 'REST'."
          );
        }
        break;
      default:
        console.log("Invalid Request Method...");
    }
  }
}
