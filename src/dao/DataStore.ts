import * as fs from "fs";

export class DataStore {
  getFilePathInSystem(relativePath: string): string {
    throw new Error("Method not implemented.");
  }

  get(
    objIdValue: string,
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): object {
    throw new Error("Method not implemented.");
  }

  getAll(
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): object[] {
    throw new Error("Method not implemented.");
  }

  getAbsulteFilePath(
    objIdValue: string,
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): string {
    throw new Error("Method not implemented.");
  }

  getReadStream(
    objIdValue: string,
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): fs.ReadStream {
    throw new Error("Method not implemented.");
  }

  save(
    objIdName: string,
    data: object,
    writePath: string,
    prefix: string = null
  ): object {
    throw new Error("Method not implemented.");
  }

  update(
    objIdName: string,
    data: object,
    writePath: string,
    prefix: string = null
  ): object {
    throw new Error("Method not implemented.");
  }

  delete(
    writePath: string,
    objIdValue: string,
    prefix: string = null
  ): boolean {
    throw new Error("Method not implemented.");
  }
}
