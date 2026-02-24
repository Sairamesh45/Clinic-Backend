import express from "express";
import cors from "cors";
import registerModuleRoutes from "./modules/index.js";
import requestLogger from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import config from "./config/index.js";

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

registerModuleRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
