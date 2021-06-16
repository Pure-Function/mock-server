import { PathConfig } from "./PathConfig";

export interface PatternizedPathConfig extends PathConfig {
  requestConfigPath: string;
  fragmentsMatch: (string | RegExp)[];
  fragmentIndexToParamIdMap: Record<number, string>;
  isIdNameFromQuery: boolean;
}
