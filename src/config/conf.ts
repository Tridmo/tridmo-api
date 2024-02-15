import { config } from 'dotenv';
import path from 'path';

config({
  path: path.join(__dirname, '..', '..', '.env')
});

const { env } = process;

export const pg = {
  connectionString: env.DB_URL,
  host: env.PG_HOST,
  port: env.PG_PORT || 5432,
  user: env.PG_USER || 'postgres',
  password: env.PG_PASSWORD,
  database: env.PG_DB_NAME || 'postgres',
  migrationsTable: env.PG_MIGRATIONS_TABLE || 'migrations',
  maxPool: 75,
  minPool: 2,
};

export const server = {
  httpPort: env.HTTP_PORT || 4000,
  nodeEnv: env.NODE_ENV || 'development',
  refreshToken: {
    secret: env.REFRESH_TOKEN_SECRET,
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },
  accessToken: {
    secret: env.ACCESS_TOKEN_SECRET,
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  }
};

export const emailService = {
  username: env.EMAIL_USERNAME,
  password: env.EMAIL_PASSWORD,
  hostname: env.EMAIL_HOSTNAME,
  from: env.EMAIL_FROM
};

export const PAYMENT = {
  PRODUCT: env.PRODUCT,
  TEST_TRANSACTION_URL: env.TEST_TRANSACTION_URL,
  TEST_TRANSACTION_API_KEY: env.TRANSACTION_API_KEY,
  TEST_TRANSACTION_API_URL: env.TRANSACTION_API_URL
};

export const s3Vars = {
  accountId: env.S3_ACCOUNT_ID || 'cfd8d75b2205161fcfe63d07fd422e88',
  region: `auto`,
  accessKeyId: env.S3_ACCESS_ID,
  secretAccessKey: env.S3_SECRET_KEY,
  provateEndpoint: `https://${env.S3_ACCOUNT_ID || 'cfd8d75b2205161fcfe63d07fd422e88'}.r2.cloudflarestorage.com`,
  publicEndpoint: `https://pub-6ce793af255644e1a9778fab814f41bb.r2.dev`,
  imagesBucket: env.S3_IMAGES_BUCKET_NAME || 'demod-images',
  filesBucket: env.S3_FILES_BUCKET_NAME || 'demod-files',
};

export const supabaseConfig = {
  appUrl: env.SUPABASE_APP_URL,
  anon: env.SUPABASE_ANON,
  service_role: env.SUPABASE_SERVICE_ROLE,
  password: pg.password
}
