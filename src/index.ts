import http from 'http';
import App from "./server";
import router from "./router";
import logger from './lib/logger';

// Enable Datadog tracing
require('dd-trace').init({
  service: process.env.DD_SERVICE || 'tridmo-api',
  env: process.env.DD_ENV || 'prod',
  version: process.env.DD_VERSION || '1.0.0',
  traceAgentless: process.env.DD_TRACE_AGENTLESS_ENABLED || true,
  tags: process.env.DD_TAGS || 'team:backend,component:api'
});

const ExpressApp = new App(router)

const server = http.createServer(ExpressApp.getServer);
const port = process.env.PORT || 5000

// Log server startup
logger.info('Starting Tridmo API server', { port, nodeEnv: process.env.NODE_ENV });

server.listen(port, () => {
  logger.info('Tridmo API server started successfully', { port });
  console.info("Listening port on " + port);
});

// Handle graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info('Received shutdown signal, closing server gracefully', { signal });
  
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception occurred', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason, promise });
});