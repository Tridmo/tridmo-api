import { config } from 'dotenv';
config();
const { env } = process;

export const adminUsername = env.ADMIN_USERNAME;

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
  logLevel: env.LOG_LEVEL,
  nodeEnv: env.NODE_ENV,
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

export const chatApi = {
  key: env.CHAT_API_KEY,
  url: env.CHAT_API_URL,
  webhook_payload_url: env.CHAT_WEBHOOK_PAYLOAD_URL,
  webhook_secret: env.CHAT_WEBHOOK_SECRET,
  expiresIn: Number(env.CHAT_EXPIRES_IN)
};

export const s3Vars = {
  accountId: env.S3_ACCOUNT_ID,
  region: `auto`,
  accessKeyId: env.S3_ACCESS_ID,
  secretAccessKey: env.S3_SECRET_KEY,
  privateEndpoint: `https://${env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  publicImagesEndpoint: env.BASE_IMG_URL,
  publicFilesEndpoint: env.BASE_FILES_URL,
  imagesBucket: env.S3_IMAGES_BUCKET_NAME,
  filesBucket: env.S3_FILES_BUCKET_NAME,
}
