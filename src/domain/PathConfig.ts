import { RequestType } from "./RequestType";
import { ExecutorFunction } from "./ExecutorFunction";

export interface PathConfig {
  requestType: RequestType;
  statusCode: number;
  idName: string;
  response: string | string[] | ExecutorFunction; // 1) a path to a folder for storing and
  //retrieving data pertaining to this request,
  // 2) a path to a file that will be sent as a response,
  // 3) a message that will be sent as a response,
  // 4) an array of paths to search ` to create the response, or
  // 5) (for js config) a method that returns a promise returning
  // a response - defaults to "/"
  // 6) function for dynamic configuration
  latency: number;
  otherConfig?: Record<string, any>; // Future work
}
