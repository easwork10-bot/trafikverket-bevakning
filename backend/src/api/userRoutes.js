import express from "express";
import { db } from "../utils/db.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const { userId, email, ssn, licenceId, cityId } = req.body;

  await db.query(`
    INSERT INTO watchers (user_id, email, ssn, licenceId, cityId)
    VALUES ($1, $2, $3, $4, $5)
  `, [userId, email, ssn, licenceId, cityId]);

  res.json({ success: true });
});

export default router;
