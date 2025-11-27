import { db } from "../utils/db.js";

export async function saveCookie(userId, cookies) {
  await db.query(
    `INSERT INTO cookies (user_id, data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (user_id) DO UPDATE SET data=$2::jsonb`,
    [userId, JSON.stringify(cookies)]
  );
}

export async function getCookie(userId) {
  const res = await db.query(
    "SELECT data FROM cookies WHERE user_id=$1",
    [userId]
  );

  if (!res.rows.length) return null;

  return res.rows[0].data; // ✔ jsonb → direkt JS-objekt
}
