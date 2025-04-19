import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  console.log('Loading .env from local file...');
  config();
} else {
  console.log('Running in production mode — .env not loaded.');
}

export const adminUsername = process.env.ADMIN_USERNAME;

export const pg = {
  connectionString: process.env.DB_URL,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB_NAME || 'postgres',
  migrationsTable: process.env.PG_MIGRATIONS_TABLE || 'migrations',
  maxPool: 75,
  minPool: 2,
};

export const server = {
  httpPort: process.env.HTTP_PORT || 4000,
  logLevel: process.env.LOG_LEVEL,
  nodeEnv: process.env.NODE_ENV,
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  }
};

export const emailService = {
  username: process.env.EMAIL_USERNAME,
  password: process.env.EMAIL_PASSWORD,
  hostname: process.env.EMAIL_HOSTNAME,
  from: process.env.EMAIL_FROM
};

export const PAYMENT = {
  PRODUCT: process.env.PRODUCT,
  TEST_TRANSACTION_URL: process.env.TEST_TRANSACTION_URL,
  TEST_TRANSACTION_API_KEY: process.env.TRANSACTION_API_KEY,
  TEST_TRANSACTION_API_URL: process.env.TRANSACTION_API_URL
};

export const chatApi = {
  key: process.env.CHAT_API_KEY,
  url: process.env.CHAT_API_URL,
  webhook_payload_url: process.env.CHAT_WEBHOOK_PAYLOAD_URL,
  webhook_secret: process.env.CHAT_WEBHOOK_SECRET,
  expiresIn: Number(process.env.CHAT_EXPIRES_IN)
};

export const s3Vars = {
  accountId: process.env.S3_ACCOUNT_ID,
  region: `auto`,
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_SECRET_KEY,
  privateEndpoint: `https://${process.env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  publicImagesEndpoint: process.env.BASE_IMG_URL,
  publicFilesEndpoint: process.env.BASE_FILES_URL,
  imagesBucket: process.env.S3_IMAGES_BUCKET_NAME,
  filesBucket: process.env.S3_FILES_BUCKET_NAME,
}
