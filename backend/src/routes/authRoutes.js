// src/routes/authRoutes.js
import express from "express";
import { sessionStatus, login } from "../controllers/authController.js";

const router = express.Router();

router.get("/session", sessionStatus);
router.post("/login", login);

export default router;
