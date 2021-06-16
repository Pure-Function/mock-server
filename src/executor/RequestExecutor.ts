import { Request, Response } from "express";
import { RequestMethod } from "../domain/RequestMethod";
import { RequestConfig } from "../domain/RequestConfig";
import { RequestConfigService } from "../request/RequestConfigService";

export interface RequestExecutor {
  getSupportedRequestTypes(): string[];
  execute(
    method: RequestMethod,
    request: Request,
    response: Response,
    requestConfig: RequestConfig,
    requestConfigService: RequestConfigService
  ): void;
}
