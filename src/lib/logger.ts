import * as winston from 'winston'
import * as dotenv from "dotenv";
dotenv.config();

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
})

export default logger
