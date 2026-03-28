const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGORITHM ?? "HS256",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((entry) => entry.trim()).filter(Boolean),
  aiSummarizerUrl: process.env.AI_SUMMARIZER_URL ?? "http://localhost:8000",
};

export default config;
