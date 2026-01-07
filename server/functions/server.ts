import serverless from "serverless-http";
import { createApp } from "../_core/index";

let app: any;

export const handler = async (event: any, context: any) => {
  if (!app) {
    app = await createApp();
  }
  const handler = serverless(app);
  return handler(event, context);
};
