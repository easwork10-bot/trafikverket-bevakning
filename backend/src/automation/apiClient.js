import fetch from "node-fetch";
import { getCookie } from "../services/cookieStore.js";

export async function trafikverketRequest(userId, endpoint, body = null) {
  const cookie = await getCookie(userId);
  if (!cookie) return null;

  const cookieHeader = cookie.map(c => `${c.name}=${c.value}`).join("; ");

  const res = await fetch(`https://fp.trafikverket.se/Boka/${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
      "User-Agent": "Mozilla/5.0"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) return null;
  return res.json();
}
