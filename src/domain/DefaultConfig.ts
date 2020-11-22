import { RequestType } from "./RequestType";

export interface DefaultConfig {
  requestType: RequestType;
  statusCode: number;
  idName: string;
  response: string | string[];
  latency: number;
  otherConfig?: Record<string, any>;
}
