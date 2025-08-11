import knex from 'knex';
import knexConfig from './knexfile';
import { server } from '../config';
import logger from '../lib/logger';

const knexInstance = knex(knexConfig[server.nodeEnv]);

// Log database connection initialization
logger.info('Initializing database connection', { 
  environment: server.nodeEnv,
  client: knexConfig[server.nodeEnv].client 
});

// Test database connection
knexInstance.raw('SELECT 1')
  .then(() => {
    logger.info('Database connection established successfully');
  })
  .catch((error) => {
    logger.error('Failed to establish database connection', { 
      error: error.message,
      code: error.code 
    });
  });

// Add connection pool event handlers
knexInstance.on('query', (query) => {
  if (server.nodeEnv === 'development') {
    logger.debug('Database query executed', { 
      sql: query.sql?.substring(0, 100) + (query.sql?.length > 100 ? '...' : ''),
      bindings: query.bindings?.length
    });
  }
});

knexInstance.on('query-error', (error, query) => {
  logger.error('Database query error', { 
    error: error.message,
    sql: query.sql?.substring(0, 100) + (query.sql?.length > 100 ? '...' : ''),
    bindings: query.bindings?.length
  });
});

export default knexInstance;
