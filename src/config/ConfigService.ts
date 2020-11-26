import { FileSystemService } from "../filesystem/FileSystemService";
import { ConfigConstants } from "./ConfigConstants";
import { PathConfig } from "../domain/PathConfig";
import { ErrorConfig } from "../domain/ErrorConfig";
import { DefaultConfig } from "../domain/DefaultConfig";
import { OverrideConfig } from "../domain/OverrideConfig";
import { PatternizedPathConfig } from "../domain/PatternizedPathConfig";
import { PatternizedConfigService } from "./PatternizedPathConfigService";
import { isEmpty } from "lodash";
export class ConfigService {
  private configFolderPath: string;

  private fixedPathConfigData: { [key: string]: PathConfig } = {};
  private patternizedPathConfigData: PatternizedPathConfig[] = [];
  private defaultConfigData: DefaultConfig;
  private errorConfigData: ErrorConfig;
  private overrideConfigData: OverrideConfig;

  constructor(configFolderPath: string, dynamicConfig: any) {
    this.configFolderPath = configFolderPath;
    this.initializePathConfigData(dynamicConfig as PathConfig[]);
    this.initializeDefaultConfigData();
    this.initializeErrorConfigData();
    this.initializeOverrideConfigData();
  }

  private getConfigFilesByOrder() {
    const configFileNames = FileSystemService.readDirSync(
      this.configFolderPath
    );
    configFileNames.splice(
      configFileNames.indexOf(ConfigConstants.DEFAULT_CONFIG),
      1
    );
    configFileNames.sort();
    return [ConfigConstants.DEFAULT_CONFIG].concat(configFileNames);
  }

  private processPathSettings(pathSettings: any) {
    for (const reqConfigPath in pathSettings) {
      if (PatternizedConfigService.isPatternizedPathConfig(reqConfigPath)) {
        this.patternizedPathConfigData.push(
          PatternizedConfigService.getPatternizedPathConfig(
            reqConfigPath,
            pathSettings[reqConfigPath]
          )
        );
      } else {
        this.fixedPathConfigData[reqConfigPath] = pathSettings[reqConfigPath];
      }
    }
  }

  private initializePathConfigData(dynamicConfig: PathConfig[]) {
    const configFileNames = this.getConfigFilesByOrder();
    for (const configFileName of configFileNames) {
      console.log("processing configuration file: ", configFileName);
      const fileContent: any = FileSystemService.readJsonFileSyncFromFolder(
        this.configFolderPath,
        configFileName
      );
      if (fileContent != null) {
        const pathSettings: any =
          fileContent[ConfigConstants.KEYCONFIG_PATH_SETTINGS];
        this.processPathSettings(pathSettings);
      }
    }
    this.processPathSettings(dynamicConfig);
    this.patternizedPathConfigData = PatternizedConfigService.sort(
      this.patternizedPathConfigData
    );
    // console.log("after sort ----------- ", this.patternizedPathConfigData);
  }

  private initializeDefaultConfigData() {
    const fileContent: any = FileSystemService.readJsonFileSyncFromFolder(
      this.configFolderPath,
      ConfigConstants.DEFAULT_CONFIG
    );
    this.defaultConfigData =
      fileContent[ConfigConstants.KEYCONFIG_DEFAULT_CONFIG];
  }

  private initializeErrorConfigData() {
    const fileContent: any = FileSystemService.readJsonFileSyncFromFolder(
      this.configFolderPath,
      ConfigConstants.DEFAULT_CONFIG
    );
    this.errorConfigData = fileContent[ConfigConstants.KEYCONFIG_ERROR_CONFIG];
  }

  private initializeOverrideConfigData() {
    const fileContent: any = FileSystemService.readJsonFileSyncFromFolder(
      this.configFolderPath,
      ConfigConstants.DEFAULT_CONFIG
    );
    this.overrideConfigData =
      fileContent[ConfigConstants.KEYCONFIG_OVERRIDE_CONFIG];
  }

  public getPathConfig(reqPath: string, forPost = false): PathConfig {
    if (reqPath in this.fixedPathConfigData) {
      return this.fixedPathConfigData[reqPath];
    } else {
      for (const patternizedPathConfig of this.patternizedPathConfigData) {
        if (
          PatternizedConfigService.isPatternizedPathMatch(
            reqPath,
            patternizedPathConfig,
            forPost
          )
        ) {
          return patternizedPathConfig;
        }
      }
    }
    return null;
  }

  public getOverrideConfig(reqPath: string): OverrideConfig {
    return this.overrideConfigData;
  }

  public getDefaultConfig(reqPath: string): DefaultConfig {
    return this.defaultConfigData;
  }

  public getErrorConfig(reqPath: string): ErrorConfig {
    return this.errorConfigData;
  }

  public isPatternized(pathConfig: PathConfig | PatternizedPathConfig) {
    return (
      pathConfig &&
      !isEmpty((pathConfig as PatternizedPathConfig).requestConfigPath)
    );
  }

  public getPatternizedIdValue(requestPath: string, idName: string) {
    return PatternizedConfigService.getIdValue(
      requestPath,
      idName,
      this.getPathConfig(requestPath) as PatternizedPathConfig
    );
  }

  public getFileName(requestPath: string, idValue: string) {
    const config = this.getPathConfig(requestPath) as PatternizedPathConfig;
    return config.isIdNameFromQuery
      ? PatternizedConfigService.getFileNameFromPath(
          requestPath,
          config,
          idValue
        )
      : PatternizedConfigService.getFileNameFromPath(requestPath, config);
  }

  private addFileIdSep(value: string) {
    return value ? value + PatternizedConfigService.SEP_FILENAME_ID : null;
  }

  public getFileNamePrefix(requestPath: string, forPost: boolean) {
    const config = this.getPathConfig(
      requestPath,
      forPost
    ) as PatternizedPathConfig;
    return this.addFileIdSep(
      config
        ? config.isIdNameFromQuery
          ? PatternizedConfigService.getFileNameFromPath(requestPath, config)
          : PatternizedConfigService.getFileNameFromPath(
              requestPath,
              config,
              null,
              true
            )
        : null
    );
  }
}
