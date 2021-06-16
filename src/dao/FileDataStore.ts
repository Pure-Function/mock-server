import { FileSystemService } from "../filesystem/FileSystemService";
import * as _ from "lodash";
//import { ConfigService } from "../config/ConfigService";
import * as fs from "fs";

export class FileDataStore {
  private dataPath: string;

  constructor(dataPath: string) {
    this.dataPath = dataPath;
  }

  private createObjectId() {
    return new Date().getTime().toString();
  }

  public getFilePathInSystem(relativePath: string) {
    if (!relativePath) {
      return null;
    }
    return FileSystemService.join(this.dataPath, relativePath);
  }

  private getFilePaths(relativePaths: string[]) {
    return relativePaths
      ? relativePaths.map(relativePath =>
          this.getFilePathInSystem(relativePath)
        )
      : null;
  }

  private getFileName(objIdValue: string, prefix: string = null) {
    return objIdValue
      ? prefix
        ? prefix + objIdValue + FileSystemService.getJsonExtension()
        : objIdValue + FileSystemService.getJsonExtension()
      : null;
  }

  private getObjIdValue(data: any, objIdName: string): string {
    if (!_.isPlainObject(data) || !objIdName) {
      return null;
    }
    //objIdName = objIdName ? objIdName : ConfigService.getDefaultObjIdName();
    if (!data[objIdName]) {
      data[objIdName] = this.createObjectId();
    }
    return data[objIdName];
  }

  public getAbsulteFilePath(
    objIdValue: string,
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): string {
    const fileName: string = this.getFileName(objIdValue, prefix);
    const dataFilePath = FileSystemService.searchFilePathSync(
      fileName,
      this.getFilePaths(searchPaths),
      this.getFilePathInSystem(filePath)
    );
    return dataFilePath;
  }

  public get(
    objIdValue: string,
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): object {
    const dataFilePath = this.getAbsulteFilePath(
      objIdValue,
      searchPaths,
      filePath,
      prefix
    );
    if (dataFilePath) {
      return FileSystemService.readJsonFileSync(dataFilePath);
    }
    return null;
  }

  public getAll(
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): object[] {
    if (filePath) {
      return FileSystemService.readFileSyncAsArray(
        this.getFilePathInSystem(filePath)
      );
    } else {
      return FileSystemService.readAllJsonFilesSyncFromFolderList(
        this.getFilePaths(searchPaths),
        prefix
      );
    }
  }

  public getReadStream(
    objIdValue: string,
    searchPaths: string[],
    filePath: string,
    prefix: string = null
  ): fs.ReadStream {
    const dataFilePath = this.getAbsulteFilePath(
      objIdValue,
      searchPaths,
      filePath,
      prefix
    );
    return FileSystemService.createReadStream(dataFilePath);
  }

  public saveFile(fileName: string, data: object, writePath: string): object {
    return FileSystemService.writeFileSyncFromFolder(
      this.getFilePathInSystem(writePath),
      fileName,
      data
    );
  }

  public save(
    objIdName: string,
    data: object,
    writePath: string,
    prefix: string = null,
    isUpdate = false
  ): object {
    if (!writePath || !_.isPlainObject(data)) {
      console.log("Save failed:  ", writePath, data);
      return null;
    }

    const fileName: string = this.getFileName(
      this.getObjIdValue(data, objIdName),
      prefix
    );
    const filePathInSystem = this.getFilePathInSystem(writePath);
    if (
      FileSystemService.exists(
        FileSystemService.join(filePathInSystem, fileName)
      ) === isUpdate
    ) {
      return FileSystemService.writeFileSyncFromFolder(
        filePathInSystem,
        fileName,
        data
      );
    }
    return null;
  }

  public update(
    objIdName: string,
    data: object,
    writePath: string,
    prefix: string = null
  ): object {
    return this.save(objIdName, data, writePath, prefix, true);
  }

  public delete(
    writePath: string,
    objIdValue: string,
    prefix: string = null
  ): boolean {
    return FileSystemService.deleteFileSync(
      this.getFilePathInSystem(writePath),
      this.getFileName(objIdValue, prefix)
    );
  }
}
