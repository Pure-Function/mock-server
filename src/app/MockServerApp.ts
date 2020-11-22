import * as bodyParser from "body-parser";
import express from "express";
import { Routes } from "../routes/routes";
import fileUpload from "express-fileupload";
import { FileSystemService } from "../filesystem/FileSystemService";
import { ConfigConstants } from "../config/ConfigConstants";

class MockServerApp {
  public app: express.Application;
  public routePrv: Routes;
  constructor(configPath: string, dataPath: string, dynamicConfig: any) {
    // express app initialization
    this.app = express();
    this.config();
    // initialize configuration
    // this.initialize(process.env.CONFIG_PATH);
    this.initialize(configPath);
    // route setup
    // this.routePrv = new Routes(process.env.DATA_PATH, process.env.CONFIG_PATH);
    this.routePrv = new Routes(dataPath, configPath, dynamicConfig);
    this.routePrv.routes(this.app);
  }

  private getGlobalInitData(): any {
    return {
      pathSettings: {
        "/": {
          idName: "id",
          statusCode: 200,
          response: '{"status":"Ok"}'
        }
      },
      defaultConfig: {
        requestType: "REST",
        statusCode: 200,
        idName: "id",
        response: "To Be Implemented.",
        latency: 0,
        otherConfig: {}
      },
      errorConfig: {
        statusCode: 400,
        response: "Invalid Request."
      },
      overwriteConfig: {
        statusCode: null,
        response: null,
        latency: null
      }
    };
  }

  private initialize(configPath: string) {
    if (FileSystemService.exists(configPath)) {
      const globalPath = FileSystemService.join(
        configPath,
        ConfigConstants.DEFAULT_CONFIG
      );
      if (!FileSystemService.exists(globalPath)) {
        FileSystemService.writeFileSync(globalPath, this.getGlobalInitData());
      }
    }
  }

  private config(): void {
    // support application/json type post data
    this.app.use(bodyParser.json({ limit: "25mb" }));

    // support application/x-www-form-urlencoded post data
    this.app.use(
      bodyParser.urlencoded({
        limit: "25mb",
        parameterLimit: 10000000,
        extended: true
      })
    );

    this.app.use(
      fileUpload({
        createParentPath: true,
        limits: {
          fileSize: 1024 * 1024 * 1024 * 1024 //1GB max file(s) size
        }
      })
    );
  }
}

export default MockServerApp;
