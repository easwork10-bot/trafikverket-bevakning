import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./api/authRoutes.js";
import watchRoutes from "./api/watchRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/watch", watchRoutes);

export default app;
