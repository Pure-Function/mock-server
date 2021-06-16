import { Request, Response } from "express";
import { RequestType } from "../domain/RequestType";
import { ConfigConstants } from "../config/ConfigConstants";

export class RequestUtil {
  public static getQueryValue(request: Request, paramName: string): any {
    if (request && request.query && paramName in request.query) {
      return request.query[paramName];
    }
  }

  public static isCurdRequest(requestType: RequestType): boolean {
    return requestType === null || requestType === RequestType.REST;
  }

  public static isPluralRequest(requestType: RequestType): boolean {
    return requestType !== null && requestType === RequestType.REST_PLURAL;
  }

  public static sendResponseData(
    respData: any,
    response: Response,
    reqPath: string,
    objIdName: string,
    objIdValue: any,
    errorStatusCode: number = ConfigConstants.DEFAULT_ERROR_HTTP_STATUS_CODE,
    errorMessage: string = ConfigConstants.DEFAULT_ERROR_MSG,
    statusCode = 200
  ) {
    if (!respData) {
      const errorRespData: any = {
        message: errorMessage,
        path: reqPath
      };
      if (objIdName) {
        errorRespData[objIdName] = objIdValue;
      }
      response.status(errorStatusCode).send(errorRespData);
    } else {
      response.status(statusCode).send(respData);
    }
  }
}
