import knex from 'knex';
import knexConfig from './knexfile';
import { server } from '../config';

const knexInstance = knex(knexConfig[server.nodeEnv]);

export default knexInstance;
