// src/routes/loginRoutes.js
import express from "express";
import {
  startQrLoginController,
  getQrImageController,
  getQrStatusController
} from "../controllers/loginController.js";

const router = express.Router();

router.post("/qr/start", startQrLoginController);
router.get("/qr/:sessionId", getQrImageController);
router.get("/qr/:sessionId/status", getQrStatusController);

export default router;
