import type { Knex } from 'knex';
import { pg } from '../config/conf';

const {
  connectionString,
  maxPool,
  minPool,
} = pg;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: connectionString,
    pool: {
      min: minPool,
      max: maxPool,
    },
    migrations: {
      tableName: "migrations",
    },
  },
  staging: {
    client: 'postgresql',
    connection: connectionString,
    pool: {
      min: minPool,
      max: maxPool,
    },
    migrations: {
      tableName: "migrations",
    },
  },
  production: {
    client: 'postgresql',
    connection: connectionString,
    pool: {
      min: minPool,
      max: maxPool,
    },
    migrations: {
      tableName: "migrations",
    },
  },
};

export default config;
