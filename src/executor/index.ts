import { DataStore } from "../dao/DataStore";
import { RequestExecutor } from "./RequestExecutor";
import { RestRequestExecutor } from "./RestRequestExecutor";
import { FileDownloadRequestExecutor } from "./FileDownloadRequestExecutor";
import { FileViewRequestExecutor } from "./FileViewRequestExecutor";
import { FileUploadRequestExecutor } from "./FileUploadRequestExecutor";
import { CustomRequestExecutor } from "./CustomRequestExecutor";

const executorInstances: RequestExecutor[] = [];

export { RestRequestExecutor } from "./RestRequestExecutor";
export { FileDownloadRequestExecutor } from "./FileDownloadRequestExecutor";
export { FileViewRequestExecutor } from "./FileViewRequestExecutor";
export { FileUploadRequestExecutor } from "./FileUploadRequestExecutor";
export { CustomRequestExecutor } from "./CustomRequestExecutor";

export function getExecutors(dataStore: DataStore): RequestExecutor[] {
  if (executorInstances.length == 0) {
    executorInstances.push(new RestRequestExecutor(dataStore));
    executorInstances.push(new FileDownloadRequestExecutor(dataStore));
    executorInstances.push(new FileViewRequestExecutor(dataStore));
    executorInstances.push(new FileUploadRequestExecutor(dataStore));
    executorInstances.push(new CustomRequestExecutor(dataStore));
  }
  return executorInstances;
}
