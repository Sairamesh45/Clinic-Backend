import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
};

export default config;
