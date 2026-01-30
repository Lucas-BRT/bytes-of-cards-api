const APP_PORT = process.env.PORT || 3000;
const APP_HOST = process.env.HOST || "localhost";
const ENVIRONMENT = process.env.ENVIRONMENT || "development";

const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
const DATABASE_NAME = process.env.DATABASE_NAME || "postgres";
const DATABASE_USER = process.env.DATABASE_USER || "postgres";
const DATABASE_PASSWORD = process.env.DATABASE_PORT || "postgres";
const DATABASE_PORT = process.env.DATABASE_PORT || "5432";
const DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

const env = {
  DATABASE_URL,
  APP_PORT,
  APP_HOST,
  ENVIRONMENT,
};

export default env;
