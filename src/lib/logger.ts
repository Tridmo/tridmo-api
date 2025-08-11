import * as winston from 'winston'
import * as dotenv from "dotenv";
var DatadogWinston = require('datadog-winston')
dotenv.config();

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
})

logger.add(
  new DatadogWinston({
    apiKey: process.env.DD_API_KEY,
    hostname: process.env.DD_HOSTNAME,
    service: process.env.DD_SERVICE,
    ddsource: process.env.DD_SOURCE,
    ddtags: process.env.DD_TAGS,
  })
)

export default logger
