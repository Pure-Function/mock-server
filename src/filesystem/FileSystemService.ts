import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";

export class FileSystemService {
  private static readonly EXTN_JSON = ".json";

  public static getJsonExtension() {
    return this.EXTN_JSON;
  }

  public static getFileSystem(filePath: string): fs.ReadStream {
    return filePath ? fs.createReadStream(filePath) : null;
  }

  public static join(...pathFragments: string[]) {
    return path.join(...pathFragments);
  }

  public static exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  public static isDirectory(filePath: string): boolean {
    return this.exists(filePath) && fs.lstatSync(filePath).isDirectory();
  }

  public static isFile(filePath: string): boolean {
    return this.exists(filePath) && fs.lstatSync(filePath).isFile();
  }

  public static mkdirs(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      this.mkdirs(this.join(filePath, ".."));
      fs.mkdirSync(filePath);
    }
  }

  public static readDirSync(filePath: string) {
    try {
      return fs.readdirSync(filePath);
    } catch (e) {
      console.log(e);
    }
    return [];
  }

  static createReadStream(dataFilePath: string): fs.ReadStream {
    return dataFilePath ? fs.createReadStream(dataFilePath) : null;
  }

  static getFileExtension(filePath: string): string {
    return filePath ? path.extname(filePath) : null;
  }

  private static getFilePathSync(filePath: string): string {
    if (filePath) {
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      if (fs.existsSync(filePath + this.getJsonExtension())) {
        return filePath + this.getJsonExtension();
      }
    }
    return null;
  }

  public static readSync(filePath: string): Buffer {
    try {
      filePath = this.getFilePathSync(filePath);
      if (filePath) {
        return fs.readFileSync(filePath);
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  public static readJsonSync(filePath: string): any {
    if (filePath) {
      const buf: Buffer = this.readSync(filePath);
      if (buf === null) {
        console.log("Invalid file path: ", filePath);
        return null;
      }
      const content: string = buf.toString();
      let contentJson: any;
      try {
        contentJson = JSON.parse(content);
      } catch (e) {
        console.log(e);
      }
      return contentJson ? contentJson : null;
    }
    return null;
  }

  public static readJsonFileSync(filePath: string): object {
    return this.readJsonSync(filePath);
  }

  public static readFileSyncAsArray(filePath: string): object[] {
    const json = this.readJsonSync(filePath);
    return Array.isArray(json) ? json : null;
  }

  public static readJsonFileSyncFromFolder(
    folderPath: string,
    fileName: string
  ): object {
    const filePath = this.join(folderPath, fileName);
    return this.readJsonFileSync(filePath);
  }

  public static readAllJsonFilesSync(
    folderPath: string,
    prefix: string = null
  ) {
    const folderContent: object[] = [];
    for (const fileName of this.readDirSync(folderPath)) {
      if (prefix && !fileName.startsWith(prefix)) {
        continue;
      }
      const filePath = this.join(folderPath, fileName);
      if (this.isFile(filePath)) {
        folderContent.push(this.readJsonFileSync(filePath));
      }
    }
    return folderContent;
  }

  public static readAllJsonFilesSyncFromFolderList(
    folderPaths: string[],
    prefix: string = null
  ): object[] {
    let folderContent: object[] = [];
    for (const folderPath of folderPaths) {
      folderContent = folderContent.concat(
        this.readAllJsonFilesSync(folderPath, prefix)
      );
    }
    return folderContent;
  }

  public static searchFilePathSync(
    fileName: string,
    searchFolderPaths: string[],
    defaultFilePath: string
  ): string {
    if (fileName && !_.isEmpty(searchFolderPaths)) {
      for (const searchFolderPath of searchFolderPaths) {
        const filePath = this.getFilePathSync(
          this.join(searchFolderPath, fileName)
        );
        if (filePath) {
          return filePath;
        }
      }
    }
    return this.getFilePathSync(defaultFilePath);
  }

  public static writeFileSync(filePath: string, data: object): boolean {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  public static writeFileSyncFromFolder(
    folderPath: string,
    fileName: string,
    data: object
  ): object {
    if (!fileName || !folderPath) {
      return null;
    }
    this.mkdirs(folderPath);
    const filePath = this.join(folderPath, fileName);
    this.writeFileSync(filePath, data);
    return data;
  }

  public static deleteFileSync(folderPath: string, fileName: string): boolean {
    if (folderPath && fileName) {
      const filePath = this.getFilePathSync(this.join(folderPath, fileName));
      if (filePath) {
        fs.unlinkSync(filePath);
        return true;
      }
    }
    console.log("delete failed: ", folderPath, fileName);
    return false;
  }
}
