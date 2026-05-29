import dotenv from "dotenv";

dotenv.config();

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: process.env.PORT || "4001",
  MONGO_URL: requiredEnv("MONGO_URI"),
  JWT_SECRET: requiredEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  // GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
  // FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  // ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "",
  // REDIS_HOST: process.env.REDIS_HOST || "localhost",
  // REDIS_PORT: process.env.REDIS_PORT || "6379",
  // REDIS_PASSWORD: process.env.REDIS_PASSWORD || "",
};
