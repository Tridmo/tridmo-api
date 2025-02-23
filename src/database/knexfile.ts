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
    directory: path.resolve(__dirname, "migrations"),
    loadExtensions: [".js"]
  },
  seeds: {
    directory: path.resolve(__dirname, "seeds"),
    loadExtensions: [".js"]
  }
}


const config: { [key: string]: Knex.Config } = {
  development: { ...commonConfig },
  staging: { ...commonConfig },
  production: { ...commonConfig },
};

export default config;
