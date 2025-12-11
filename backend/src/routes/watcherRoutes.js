// src/routes/watcherRoutes.js
import express from "express";
import {
  listWatchers,
  createWatcher,
  deleteWatcher
} from "../controllers/watcherController.js";

const router = express.Router();

router.get("/", listWatchers);
router.post("/", createWatcher);
router.delete("/:id", deleteWatcher);

export default router;
