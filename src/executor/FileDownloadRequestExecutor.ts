import { DataStore } from "../dao/DataStore";
import { Request, Response } from "express";
import { RequestMethod } from "../domain/RequestMethod";
import { RequestUtil } from "../request/RequestUtil";
import { RequestConfig } from "../domain/RequestConfig";
import { RequestExecutor } from "./RequestExecutor";
import { RequestType } from "../domain/RequestType";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";
import { ContentDispositionType } from "../domain/ContentDispositionType";
import { RequestConfigService } from "../request/RequestConfigService";

export class FileDownloadRequestExecutor implements RequestExecutor {
  dataStore: DataStore;

  constructor(dataStore: DataStore) {
    this.dataStore = dataStore;
  }

  protected getContentDisposition(): string {
    return ContentDispositionType.ATTACHMENT.toString();
  }

  protected getContentType(fileExtension: string): string {
    return fileExtension
      ? (mime.contentType(fileExtension) as string)
      : "application/octet-stream";
  }

  private getFileName(objIdValue: string, absolutePath: string) {
    return objIdValue
      ? objIdValue
      : absolutePath
      ? path.parse(absolutePath).name
      : "file";
  }

  protected processResponse(
    response: Response,
    fileName: string,
    fileExtension: string,
    respStream: fs.ReadStream
  ) {
    if (!fileName.endsWith(fileExtension)) {
      fileName = fileName + fileExtension;
    }

    response.setHeader(
      "Content-disposition",
      this.getContentDisposition() + "; filename=" + fileName
    );
    response.setHeader("Content-type", this.getContentType(fileExtension));
    respStream.pipe(response);
  }

  protected getData(
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
      searchPaths,
      writePath,
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
    const fileNamePrefix = requestConfigService.getFileNamePrefix(
      reqPath,
      isPatternized
    );

    if (objIdValue || successFilePath) {
      if (writePath) {
        searchPaths.push(writePath);
      }
      const absolutePath: string = dataStore.getAbsulteFilePath(
        objIdValue,
        searchPaths,
        successFilePath,
        fileNamePrefix
      );
      const respStream: fs.ReadStream = dataStore.getReadStream(
        objIdValue,
        searchPaths,
        successFilePath,
        fileNamePrefix
      );
      this.processResponse(
        response,
        this.getFileName(objIdValue, absolutePath),
        path.extname(absolutePath),
        respStream
      );
    } else {
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
    return [RequestType.FILE_DOWNLOAD];
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
        this.getData(
          request,
          response,
          this.dataStore,
          requestConfig,
          requestConfigService
        );
        break;
      case RequestMethod.PUT:
      case RequestMethod.DELETE:
        this.throwError(
          request,
          response,
          this.dataStore,
          requestConfig,
          requestConfigService
        );
        break;
      default:
        console.log("File download -> Invalid Request Method...");
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
