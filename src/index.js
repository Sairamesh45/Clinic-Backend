import dotenv from "dotenv";

// Load environment variables first, before any other imports
// Use override:true so values in project .env take precedence over system env vars
dotenv.config({ override: true });

import config from "./config/index.js";
import app from "./app.js";
import http from "http";

const PORT = config.port;

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

const server = http.createServer(app);

server.on("listening", () => {
  console.log(`Clinic backend up at http://localhost:${PORT}`);
  console.log(`JWT authentication configured`);
  // Log which DATABASE_URL host is being used (masked)
  try {
    const dbUrl = process.env.DATABASE_URL || "(not set)";
    const hostMatch = dbUrl.match(/@([^:/?]+)/);
    const host = hostMatch ? hostMatch[1] : dbUrl;
    console.log(`Using database host: ${host}`);
  } catch (e) {
    // ignore
  }
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  // Exit with non-zero code so process managers (nodemon) report failure
  process.exit(1);
});

server.listen(PORT);
