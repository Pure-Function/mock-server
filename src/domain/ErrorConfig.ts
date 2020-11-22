import { RequestType } from "./RequestType";

export interface ErrorConfig {
  statusCode: number;
  response: string; // 1) a path to a file that will be sent as a response, 2) a message that will be sent as a response.
}
