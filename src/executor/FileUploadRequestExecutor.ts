import { DataStore } from "../dao/DataStore";
import { Request, Response } from "express";
import { RequestMethod } from "../domain/RequestMethod";
import { RequestUtil } from "../request/RequestUtil";
import { RequestConfig } from "../domain/RequestConfig";
import { RequestExecutor } from "./RequestExecutor";
import { RequestType } from "../domain/RequestType";
import { FileSystemService } from "../filesystem/FileSystemService";
import { RequestConfigService } from "../request/RequestConfigService";
import { UploadedFile } from "express-fileupload";

export class FileUploadRequestExecutor implements RequestExecutor {
  dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  protected saveData(
    request: Request,
    response: Response,
    dataStore: DataStore,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    const reqPath: string = request.path;
    let respData: any = null;
    const {
      idName,
      writePath,
      errorStatusCode,
      errorMsg,
      successStatusCode
    } = requestConfig;
    if (request.files) {
      const uploadedFile = request.files[idName] as UploadedFile;
      //TODO: this to be changed to support other file systems.
      uploadedFile.mv(
        FileSystemService.join(
          this.dataStore.getFilePathInSystem(writePath),
          uploadedFile.name
        )
      );
      //TODO: output format should be configurable
      respData = {
        status: true,
        message: "File is uploaded",
        fileName: uploadedFile.name,
        size: uploadedFile.size
      };
    }
    RequestUtil.sendResponseData(
      respData,
      response,
      reqPath,
      idName,
      null,
      errorStatusCode,
      errorMsg,
      successStatusCode
    );
  }

  protected throwError(
    request: Request,
    response: Response,
    dataStore: DataStore,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    const reqPath: string = request.path;
    const {
      idName,
      isPatternized,
      errorStatusCode,
      errorMsg,
      successStatusCode
    } = requestConfig;
    const objIdValue = requestConfigService.getIdValue(
      request,
      idName,
      reqPath,
      isPatternized
    );
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

  public getSupportedRequestTypes(): string[] {
    return [RequestType.FILE_UPLOAD];
  }

  public execute(
    method: RequestMethod,
    request: Request,
    response: Response,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ) {
    switch (method) {
      case RequestMethod.POST:
        this.saveData(
          request,
          response,
          this.dataStore,
          requestConfig,
          requestConfigService
        );
        break;
      case RequestMethod.GET | RequestMethod.PUT | RequestMethod.DELETE:
        this.throwError(
          request,
          response,
          this.dataStore,
          requestConfig,
          requestConfigService
        );
        break;
      default:
        console.log("Invalid Request Method...");
        this.throwError(
          request,
          response,
          this.dataStore,
          requestConfig,
          requestConfigService
        );
    }
  }
}
