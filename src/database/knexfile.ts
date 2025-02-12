import type { Knex } from 'knex';
import { config as envConfig } from 'dotenv';
import path from 'path';

envConfig({
  path: path.join('..', '..', '.env')
});

const { env } = process;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: env.DB_URL,
    pool: {
      min: 2,
      max: 75,
    },
    migrations: {
      tableName: "migrations",
    },
  },
  staging: {
    client: 'postgresql',
    connection: env.DB_URL,
    pool: {
      min: 2,
      max: 75,
    },
    migrations: {
      tableName: "migrations",
    },
  },
  production: {
    client: 'postgresql',
    connection: env.DB_URL,
    pool: {
      min: 2,
      max: 75,
    },
    migrations: {
      tableName: "migrations",
    },
  },
};

export default config;
