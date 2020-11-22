import { isNumber, isArray, isString, isFunction } from "lodash";

import { RequestConfig } from "../domain/RequestConfig";
import { PathConfig } from "../domain/PathConfig";
import { DefaultConfig } from "../domain/DefaultConfig";
import { ErrorConfig } from "../domain/ErrorConfig";
import { OverwriteConfig } from "../domain/OverwriteConfig";
import { RequestType } from "../domain/RequestType";
import { ExecutorFunction } from "../domain/ExecutorFunction";

import { ConfigConstants } from "../config/ConfigConstants";
import { ConfigService } from "../config/ConfigService";

import { FileSystemService } from "../filesystem/FileSystemService";

import { DataStore } from "../dao/DataStore";

export class RequestConfigConverter {
  configService: ConfigService;
  dataStore: DataStore;

  constructor(configService: ConfigService, dataStore: DataStore) {
    this.configService = configService;
    this.dataStore = dataStore;
  }

  private getValue<T>(...values: T[]): T {
    for (const value of values) {
      if (value || isNumber(value)) {
        return value;
      }
    }
    return null;
  }

  private isFile(filePath: string): boolean {
    return FileSystemService.isFile(
      this.dataStore.getFilePathInSystem(filePath)
    );
  }

  private isDirectory(filePath: string): boolean {
    return FileSystemService.isDirectory(
      this.dataStore.getFilePathInSystem(filePath)
    );
  }

  private isValidFilePath(value: string): boolean {
    return value && value.startsWith("/");
  }

  private getFilePath(value: string | string[] | ExecutorFunction): string {
    const v: string = isFunction(value)
      ? null
      : isArray(value)
      ? value[0]
      : value;
    return this.isValidFilePath(v) && this.isFile(v) ? v : null;
  }

  private getFolderPath(value: string | string[] | ExecutorFunction): string {
    const v: string = isFunction(value)
      ? null
      : isArray(value)
      ? value[0]
      : value;
    return this.isValidFilePath(v) && this.isDirectory(v) ? v : null;
  }

  private getFolderPaths(
    value: string | string[] | ExecutorFunction
  ): string[] {
    if (!value || isFunction(value)) {
      return null;
    }
    const folderPaths: string[] = [];
    value = isString(value) ? [value] : value;
    if (!isArray(value)) {
      return null;
    }
    for (const v of value) {
      if (this.isValidFilePath(v) && this.isDirectory(v)) {
        folderPaths.push(v);
      } else {
        return null;
      }
    }
    return folderPaths.length > 0 ? folderPaths : null;
  }

  private getResponseMessage(
    value: string | string[] | ExecutorFunction
  ): string {
    const v: string = isFunction(value)
      ? null
      : isArray(value)
      ? value[0]
      : value;
    return !this.isValidFilePath(v) ? v : null;
  }

  private getFunction(
    value: string | string[] | ExecutorFunction
  ): ExecutorFunction {
    return isFunction(value) ? (value as ExecutorFunction) : null;
  }

  private getAttrValue(configObj: any, attrName: string): any {
    return configObj && attrName ? configObj[attrName] : null;
  }

  private getIdName(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): string {
    const attrName = ConfigConstants.KEY_ID_NAME;
    return this.getValue(
      this.getAttrValue(pathConfig, attrName),
      this.getAttrValue(defaultConfig, attrName),
      ConfigConstants.DEFAULT_ID_NAME
    );
  }

  private getRequestType(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): RequestType {
    const attrName = ConfigConstants.KEY_REQUEST_TYPE;
    return this.getValue(
      this.getAttrValue(pathConfig, attrName),
      this.getAttrValue(defaultConfig, attrName),
      ConfigConstants.DEFAULT_REQUEST_TYPE
    );
  }

  private isPtternized(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): boolean {
    return this.configService.isPatternized(pathConfig);
  }

  private getLatency(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): number {
    const attrName = ConfigConstants.KEY_LATENCY;
    return this.getValue(
      this.getAttrValue(overwriteConfig, attrName),
      this.getAttrValue(pathConfig, attrName),
      this.getAttrValue(defaultConfig, attrName),
      0
    );
  }

  private getErrorFilePath(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): string {
    const attrName = ConfigConstants.KEY_RESPONSE;
    return this.getFilePath(this.getAttrValue(errorConfig, attrName));
  }

  private getErrorMsg(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): string {
    const attrName = ConfigConstants.KEY_RESPONSE;
    return this.getValue(
      this.getResponseMessage(this.getAttrValue(errorConfig, attrName)),
      ConfigConstants.DEFAULT_ERROR_MSG
    );
  }

  private getErrorStatusCode(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): number {
    const attrName = ConfigConstants.KEY_STATUS_CODE;
    return this.getValue(
      this.getAttrValue(errorConfig, attrName),
      ConfigConstants.DEFAULT_ERROR_HTTP_STATUS_CODE
    );
  }

  private getSuccessFilePath(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): string {
    const attrName = ConfigConstants.KEY_RESPONSE;
    return this.getAttrValue(overwriteConfig, attrName)
      ? this.getFilePath(this.getAttrValue(overwriteConfig, attrName))
      : this.getFilePath(this.getAttrValue(pathConfig, attrName));
  }

  private getSuccessMsg(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): string {
    const attrName = ConfigConstants.KEY_RESPONSE;
    return this.getAttrValue(overwriteConfig, attrName)
      ? this.getResponseMessage(this.getAttrValue(overwriteConfig, attrName))
      : this.getResponseMessage(this.getAttrValue(pathConfig, attrName));
  }

  private getSuccessStatusCode(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): number {
    const attrName = ConfigConstants.KEY_STATUS_CODE;
    return this.getValue(
      this.getAttrValue(overwriteConfig, attrName),
      this.getAttrValue(pathConfig, attrName),
      this.getAttrValue(defaultConfig, attrName),
      ConfigConstants.DEFAULT_ERROR_HTTP_STATUS_CODE
    );
  }

  private getSearchPaths(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): string[] {
    const attrName = ConfigConstants.KEY_RESPONSE;
    return this.getAttrValue(overwriteConfig, attrName)
      ? this.getFolderPaths(this.getAttrValue(overwriteConfig, attrName))
      : this.getValue(
          this.getFolderPaths(this.getAttrValue(pathConfig, attrName)),
          this.getFolderPaths(this.getAttrValue(defaultConfig, attrName))
        );
  }

  private getWritePath(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): string {
    const attrName = ConfigConstants.KEY_RESPONSE;
    return this.getAttrValue(overwriteConfig, attrName)
      ? this.getFolderPath(this.getAttrValue(overwriteConfig, attrName))
      : this.getValue(
          this.getFolderPath(this.getAttrValue(pathConfig, attrName)),
          this.getFolderPath(this.getAttrValue(defaultConfig, attrName))
        );
  }

  private getExecutorFunction(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): ExecutorFunction {
    const attrName = ConfigConstants.KEY_RESPONSE;
    return this.getFunction(this.getAttrValue(pathConfig, attrName));
  }
  private getOtherConfig(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): Record<string, any> {
    const attrName = ConfigConstants.KEY_OTHER_CONFIG;
    return this.getValue(
      this.getAttrValue(pathConfig, attrName),
      this.getAttrValue(defaultConfig, attrName),
      ConfigConstants.DEFAULT_OTHER_CONFIG
    );
  }

  public convert(
    pathConfig: PathConfig,
    defaultConfig: DefaultConfig,
    errorConfig: ErrorConfig,
    overwriteConfig: OverwriteConfig
  ): RequestConfig {
    if (!pathConfig) {
      return null;
    }
    return {
      idName: this.getIdName(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      requestType: this.getRequestType(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      isPatternized: this.isPtternized(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      latency: this.getLatency(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),

      errorFilePath: this.getErrorFilePath(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      errorMsg: this.getErrorMsg(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      errorStatusCode: this.getErrorStatusCode(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),

      successFilePath: this.getSuccessFilePath(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      successMsg: this.getSuccessMsg(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      successStatusCode: this.getSuccessStatusCode(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      searchPaths: this.getSearchPaths(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      writePath: this.getWritePath(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),
      executorFunction: this.getExecutorFunction(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      ),

      otherConfig: this.getOtherConfig(
        pathConfig,
        defaultConfig,
        errorConfig,
        overwriteConfig
      )
    } as RequestConfig;
  }
}
