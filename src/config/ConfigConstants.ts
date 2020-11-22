import { RequestType } from "../domain/RequestType";

export class ConfigConstants {
  public static readonly DEFAULT_CONFIG: string = "global.json";
  public static readonly DEFAULT_ID_NAME: string = "id";
  public static readonly DEFAULT_REQUEST_TYPE: RequestType = RequestType.REST;
  public static readonly DEFAULT_STATUS_CODE: number = 200;
  public static readonly DEFAULT_OTHER_CONFIG: any = {};
  public static readonly DEFAULT_ERROR_MSG: string = "Invalid Request.";
  public static readonly DEFAULT_ERROR_HTTP_STATUS_CODE: number = 400;

  public static readonly KEYCONFIG_PATH_SETTINGS: string = "pathSettings";
  public static readonly KEYCONFIG_DEFAULT_CONFIG: string = "defaultConfig";
  public static readonly KEYCONFIG_OVERWRITE_CONFIG: string = "overwriteConfig";
  public static readonly KEYCONFIG_ERROR_CONFIG: string = "errorConfig";

  public static readonly KEY_REQUEST_TYPE: string = "requestType";
  public static readonly KEY_STATUS_CODE: string = "statusCode";
  public static readonly KEY_ID_NAME: string = "idName";
  public static readonly KEY_RESPONSE: string = "response";
  public static readonly KEY_OTHER_CONFIG: string = "otherConfig";
  public static readonly KEY_LATENCY: string = "latency";
}
