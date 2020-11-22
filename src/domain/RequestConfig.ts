import { RequestType } from "./RequestType";
import { ExecutorFunction } from "./ExecutorFunction";

export interface RequestConfig {
  idName: string;
  requestType: RequestType;
  isPatternized: boolean;
  latency: number;

  errorFilePath: string;
  errorMsg: string;
  errorStatusCode: number;

  searchPaths: string[];
  successFilePath: string;
  successMsg: string;
  successStatusCode: number;
  writePath: string;

  executorFunction: ExecutorFunction;

  otherConfig?: Record<string, any>;
}
