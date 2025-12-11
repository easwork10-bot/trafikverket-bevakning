// src/routes/timesRoutes.js
import express from "express";
import { getTimesController } from "../controllers/timesController.js";

const router = express.Router();

router.post("/", getTimesController);

export default router;
