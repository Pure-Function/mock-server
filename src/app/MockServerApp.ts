import * as bodyParser from "body-parser";
import express from "express";
import { Routes } from "../routes/routes";
import fileUpload from "express-fileupload";

class MockServerApp {
  public app: express.Application;
  public routePrv: Routes;
  constructor(configPath: string, dataPath: string, dynamicConfig: any) {
    // express app initialization
    this.app = express();
    this.config();

    // route setup
    // this.routePrv = new Routes(process.env.DATA_PATH, process.env.CONFIG_PATH);
    this.routePrv = new Routes(dataPath, configPath, dynamicConfig);
    this.routePrv.routes(this.app);
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
