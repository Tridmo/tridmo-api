import { server } from "../../../config";

export const isDevelopment = () => server.nodeEnv == 'development';
export const isProduction = () => server.nodeEnv == 'production';