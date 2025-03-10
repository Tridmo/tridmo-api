import type { Knex } from 'knex';
import { config as envConfig } from 'dotenv';
import path from 'path';

envConfig({ path: path.join('..', '..', '.env') });
const { env } = process;

const commonConfig = {
  client: 'postgresql',
  connection: env.DB_URL,
  pool: {
    min: 2,
    max: 75,
  },
  migrations: {
    tableName: "migrations",
  },
  seeds: {
    loadExtensions: [".js"]
  }
}


const config: { [key: string]: Knex.Config } = {
  development: { ...commonConfig },
  staging: { ...commonConfig },
  production: { ...commonConfig },
};

export default config;
