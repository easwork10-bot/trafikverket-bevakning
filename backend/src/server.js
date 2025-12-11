// src/server.js
import express from "express";
import cors from "cors";
import { log } from "./utils/logger.js";

import authRoutes from "./routes/authRoutes.js";
import trafficRoutes from "./routes/trafficRoutes.js";
import timesRoutes from "./routes/timesRoutes.js";
import watcherRoutes from "./routes/watcherRoutes.js";

import { startWatcher } from "./automation/watcher.js";

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/times", timesRoutes);
app.use("/api/watchers", watcherRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  log.info(`🚀 Backend running on port ${PORT}`);
});

// Start watcher loop
startWatcher();
