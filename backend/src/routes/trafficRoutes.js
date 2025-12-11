// src/routes/trafficRoutes.js
import express from "express";
import { getSearchInformation } from "../controllers/trafficController.js";
import { getTimesController } from "../controllers/timesController.js";

const router = express.Router();

router.post("/search-information", getSearchInformation);
router.post("/times", getTimesController);

export default router;
