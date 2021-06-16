import { RequestType } from "../domain/RequestType";
import { FileDownloadRequestExecutor } from "./FileDownloadRequestExecutor";
import { ContentDispositionType } from "../domain/ContentDispositionType";

export class FileViewRequestExecutor extends FileDownloadRequestExecutor {
  protected getContentDisposition(): string {
    return ContentDispositionType.INLINE.toString();
  }
  public getSupportedRequestTypes(): string[] {
    return [RequestType.FILE_VIEW];
  }
}
