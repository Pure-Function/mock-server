import { PathConfig } from "../domain/PathConfig";
import { PatternizedPathConfig } from "../domain/PatternizedPathConfig";
import { isString } from "lodash";
import { ConfigConstants } from "./ConfigConstants";
import { RequestType } from "../domain/RequestType";

export class PatternizedConfigService {
  private static SEP_HTTP_PATH = "/";
  public static readonly SEP_FILENAME_ID = ".";
  private static REGEX_PARAM_PATH = /\/:/;
  private static REGEX_PARAM_PATTTENIZED = /^:[a-z0-9_.\-]+$/gi;
  private static REGEX_PARAMMATCH_PATTERN = /^\S+$/; // any non space char. For ASCII, whitespace characters are [ \n\r\t\f]

  private static isPatternizedFragment(fragmentText: string): boolean {
    return this.REGEX_PARAM_PATTTENIZED.test(fragmentText);
  }

  public static isPatternizedPathConfig(reqConfigPath: string): boolean {
    // console.log("---------- ", reqConfigPath, this.REGEX_PARAM_PATH.test(reqConfigPath));
    return this.REGEX_PARAM_PATH.test(reqConfigPath);
  }

  public static getPatternizedPathConfig(
    reqConfigPath: string,
    pathConfig: PathConfig
  ): PatternizedPathConfig {
    const config = {
      requestConfigPath: reqConfigPath,
      requestType: pathConfig.requestType,
      fragmentsMatch: [] as (string | RegExp)[],
      fragmentIndexToParamIdMap: {},
      statusCode: pathConfig.statusCode,
      idName: "",
      isIdNameFromQuery: false,
      response: pathConfig.response,
      latency: pathConfig.latency,
      otherConfig: pathConfig.otherConfig
    };

    this.initializePatternizedPathConfig(
      reqConfigPath,
      config.fragmentsMatch,
      config.fragmentIndexToParamIdMap
    );
    this.initializeIdName(pathConfig, config);
    return config;
  }

  private static getFragments(requestPath: string): string[] {
    return requestPath.split(this.SEP_HTTP_PATH);
  }

  public static initializePatternizedPathConfig(
    reqConfigPath: string,
    fragmentsMatch: (string | RegExp)[],
    fragmentIndexToNameMap: Record<number, string>
  ) {
    const fragments = this.getFragments(reqConfigPath);
    for (let i = 0; i < fragments.length; i++) {
      if (this.isPatternizedFragment(fragments[i])) {
        fragmentIndexToNameMap[i] = fragments[i].substring(1); //omitting :
        fragmentsMatch.push(this.REGEX_PARAMMATCH_PATTERN);
      } else {
        fragmentsMatch.push(fragments[i]);
      }
    }
  }

  private static isPatternizedPath(
    patternizedPathConfig: PatternizedPathConfig
  ): boolean {
    return (
      !patternizedPathConfig.isIdNameFromQuery &&
      (!patternizedPathConfig.requestType ||
        patternizedPathConfig.requestType === RequestType.REST)
    );
  }

  public static isPatternizedPathMatch(
    requestPath: string,
    patternizedPathConfig: PatternizedPathConfig,
    forPost = false
  ): boolean {
    const fragments = this.getFragments(requestPath);
    if (
      !forPost &&
      patternizedPathConfig.fragmentsMatch.length !== fragments.length
    ) {
      return false;
    }
    if (forPost) {
      if (
        this.isPatternizedPath(patternizedPathConfig) &&
        patternizedPathConfig.fragmentsMatch.length - 1 !== fragments.length
      ) {
        return false;
      }
      if (
        !this.isPatternizedPath(patternizedPathConfig) &&
        patternizedPathConfig.fragmentsMatch.length !== fragments.length
      ) {
        return false;
      }
    }

    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      const fragmentMatch = patternizedPathConfig.fragmentsMatch[i];
      if (isString(fragmentMatch)) {
        if (fragmentMatch !== fragment) {
          return false;
        }
      } else if (!fragmentMatch.test(fragment)) {
        return false;
      }
    }
    return true;
  }

  private static initializeIdName(
    pathConfig: PathConfig,
    patternizedPathConfig: PatternizedPathConfig
  ) {
    if (pathConfig.idName) {
      patternizedPathConfig.idName = pathConfig.idName;
      patternizedPathConfig.isIdNameFromQuery = true;
    } else {
      const lastfragmentIndex = patternizedPathConfig.fragmentsMatch.length - 1;
      if (
        lastfragmentIndex in patternizedPathConfig.fragmentIndexToParamIdMap
      ) {
        patternizedPathConfig.idName =
          patternizedPathConfig.fragmentIndexToParamIdMap[lastfragmentIndex];
        patternizedPathConfig.isIdNameFromQuery = false;
      } else {
        patternizedPathConfig.idName = ConfigConstants.DEFAULT_ID_NAME;
        patternizedPathConfig.isIdNameFromQuery = true;
      }
    }
  }

  public static getIdValue(
    requestPath: string,
    idName: string,
    patternizedPathConfig: PatternizedPathConfig
  ): string {
    const fragments = this.getFragments(requestPath);
    for (const fragmentIndex in patternizedPathConfig.fragmentIndexToParamIdMap) {
      if (
        patternizedPathConfig.fragmentIndexToParamIdMap[fragmentIndex] ===
        idName
      ) {
        return fragments[fragmentIndex];
      }
    }
    return null;
  }

  public static getFileNameFromPath(
    requestPath: string,
    patternizedPathConfig: PatternizedPathConfig,
    suffix: string = null,
    excludeLastId = false
  ) {
    const fragments = this.getFragments(requestPath);
    let pathId = "";
    const fragmentIndices: number[] = (Object.keys(
      patternizedPathConfig.fragmentIndexToParamIdMap
    ) as unknown) as number[];
    fragmentIndices.sort();
    for (
      let i = 0;
      excludeLastId
        ? i < fragmentIndices.length - 1
        : i < fragmentIndices.length;
      i++
    ) {
      if (pathId) {
        pathId = pathId + this.SEP_FILENAME_ID;
      }
      pathId = pathId + fragments[fragmentIndices[i]];
    }
    return pathId
      ? suffix
        ? pathId + this.SEP_FILENAME_ID + suffix
        : pathId
      : null;
  }

  public static sort(
    configs: PatternizedPathConfig[]
  ): PatternizedPathConfig[] {
    return configs.sort(
      (config1: PatternizedPathConfig, config2: PatternizedPathConfig) => {
        if (
          config1.requestType == RequestType.REST &&
          config2.requestType != RequestType.REST
        ) {
          return -1;
        }
        if (
          config1.requestType != RequestType.REST &&
          config2.requestType == RequestType.REST
        ) {
          return 1;
        }
        if (config1.isIdNameFromQuery && !config2.isIdNameFromQuery) {
          return -1;
        }
        if (!config1.isIdNameFromQuery && config2.isIdNameFromQuery) {
          return 1;
        }
        if (
          config1.requestConfigPath.length > config2.requestConfigPath.length
        ) {
          return -1;
        } else if (
          config1.requestConfigPath.length < config2.requestConfigPath.length
        ) {
          return 1;
        }

        return 0;
      }
    );
  }
}
