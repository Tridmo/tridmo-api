import * as winston from 'winston'
import * as dotenv from "dotenv";
var DatadogWinston = require('datadog-winston')
dotenv.config();

/**
 * Application Logger Configuration
 * 
 * This logger is configured with:
 * - Console transport for local development
 * - Datadog transport for production monitoring
 * - JSON format for structured logging
 * - Debug level to capture all log levels
 * 
 * Usage throughout the application:
 * - logger.info() - General information (user actions, business operations)
 * - logger.warn() - Warning conditions (failed validations, missing data)
 * - logger.error() - Error conditions (exceptions, failures)
 * - logger.debug() - Debug information (detailed operation tracking)
 * 
 * Security considerations:
 * - Never log sensitive data like passwords, tokens, or full personal information
 * - Partially obscure emails, phone numbers, and other PII
 * - Use structured logging with consistent field names
 */

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
})

// Add Datadog transport for production monitoring
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
