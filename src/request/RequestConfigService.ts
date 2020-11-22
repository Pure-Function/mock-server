import { ConfigService } from "../config/ConfigService";
import { DataStore } from "../dao/DataStore";
import { RequestConfigConverter } from "./RequestConfigConverter";
import { RequestConfig } from "../domain/RequestConfig";
import { RequestUtil } from "./RequestUtil";
import { Request } from "express";

export class RequestConfigService {
  configService: ConfigService;
  dataStore: DataStore;
  coverter: RequestConfigConverter;

  constructor(configService: ConfigService, dataStore: DataStore) {
    this.configService = configService;
    this.dataStore = dataStore;
    this.coverter = new RequestConfigConverter(configService, dataStore);
  }

  public getRequestConfig(reqPath: string, forPost: boolean): RequestConfig {
    return this.coverter.convert(
      this.configService.getPathConfig(reqPath, forPost),
      this.configService.getDefaultConfig(reqPath),
      this.configService.getErrorConfig(reqPath),
      this.configService.getOverwriteConfig(reqPath)
    );
  }

  public getIdValue(
    request: Request,
    idName: string,
    requestPath: string,
    isPatternized: boolean
  ): any {
    if (isPatternized) {
      const idValue = this.configService.getPatternizedIdValue(
        requestPath,
        idName
      );
      if (idValue) {
        return idValue;
      }
    }
    return RequestUtil.getQueryValue(request, idName);
  }

  public getFileName(
    request: Request,
    idName: string,
    reqPath: string,
    isPatternized: boolean
  ) {
    const idValue = this.getIdValue(request, idName, reqPath, isPatternized);
    return isPatternized
      ? this.configService.getFileName(reqPath, idValue)
      : idValue;
  }

  public getFileNamePrefix(
    reqPath: string,
    isPatternized: boolean,
    forPost = false
  ) {
    return isPatternized
      ? this.configService.getFileNamePrefix(reqPath, forPost)
      : null;
  }
}
