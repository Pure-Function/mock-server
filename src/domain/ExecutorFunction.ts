import { Request, Response } from "express";
import { RequestConfig } from "./RequestConfig";

export type ExecutorFunction = (
  request: Request,
  response: Response,
  configData: RequestConfig
) => void;
