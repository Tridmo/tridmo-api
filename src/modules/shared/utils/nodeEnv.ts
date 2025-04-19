import { server } from "../../../config";

export const isDevelopment = () => {
  console.log(server)
  console.log(server.nodeEnv)
  console.log(process.env.NODE_ENV)
  return server.nodeEnv == 'development'
};
export const isProduction = () => server.nodeEnv == 'production';