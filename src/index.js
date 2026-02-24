import dotenv from "dotenv";

// Load environment variables first, before any other imports
dotenv.config();

import config from "./config/index.js";
import app from "./app.js";

const PORT = config.port;

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in environment variables");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Clinic backend up at http://localhost:${PORT}`);
  console.log(`JWT authentication configured`);
});
