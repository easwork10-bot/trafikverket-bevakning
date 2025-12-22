// src/controllers/loginController.js
import fetch from "node-fetch";
import QRCode from "qrcode";
import { v4 as uuid } from "uuid";
import { replaceAllCookies } from "../services/cookieStore.js";
import { log } from "../utils/logger.js";

const BASE = "https://fp.trafikverket.se/Boka";

// sessionId -> session object
const sessions = new Map();

// If QR stops rotating for this long → expired
const QR_STALL_TIMEOUT_MS = 20_000;

// ---------- helpers ------------------------------------------------

const now = () => Date.now();

function parseSetCookieHeaders(setCookieArr = []) {
  return setCookieArr
    .map(h => h.split(";")[0])
    .map(pair => {
      const idx = pair.indexOf("=");
      return idx > 0
        ? { name: pair.slice(0, idx).trim(), value: pair.slice(idx + 1).trim() }
        : null;
    })
    .filter(Boolean);
}

function mergeCookies(oldC = [], newC = []) {
  const map = new Map(oldC.map(c => [c.name, c.value]));
  newC.forEach(c => map.set(c.name, c.value));
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

function cookiesToHeader(cookies = []) {
  return cookies.map(c => `${c.name}=${c.value}`).join("; ");
}

// ---------- controllers --------------------------------------------

/**
 * POST /api/login/qr/start
 */
export async function startQrLoginController(req, res) {
  try {
    const userId = 1;
    log.info("[QR] begin-authentication");

    const response = await fetch(`${BASE}/begin-authentication`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0"
      },
      body: "null"
    });

    const json = await response.json();
    const data = json?.data;
    if (!data?.qrCode) throw new Error("No QR returned");

    const cookies = parseSetCookieHeaders(
      response.headers.raw()?.["set-cookie"] || []
    );

    const sessionId = uuid();
    sessions.set(sessionId, {
      userId,
      flow: {
        referenceId: data.referenceId,
        qrStartToken: data.qrStartToken,
        qrStartTime: data.qrStartTime,
        qrStartSecret: data.qrStartSecret,
        qrCode: data.qrCode
      },
      cookieJar: cookies,
      lastQrAt: now(),
      createdAt: now()
    });

    log.info(`[QR] Session ${sessionId} created`);
    res.json({ sessionId });
  } catch (err) {
    log.error("[QR] start failed:", err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/login/qr/:sessionId
 */
export async function getQrImageController(req, res) {
  const s = sessions.get(req.params.sessionId);
  if (!s) return res.status(404).end();

  const png = await QRCode.toBuffer(s.flow.qrCode, {
    type: "png",
    width: 320,
    margin: 1
  });

  res.type("png").send(png);
}
/**
 * GET /api/login/qr/:sessionId/status
 */
export async function getQrStatusController(req, res) {
  const sessionId = req.params.sessionId;
  const s = sessions.get(sessionId);

  if (!s) {
    return res.json({ status: "expired" });
  }
  if (s.done === true) {
    return res.json({ status: "success" });
  }

  // ❌ QR stopped rotating → expired
  if (now() - s.lastQrAt > QR_STALL_TIMEOUT_MS) {
    sessions.delete(sessionId);
    log.warn("[QR] QR stalled → expired");
    return res.json({ status: "expired" });
  }

  const response = await fetch(`${BASE}/check-authentication-status-qr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "Mozilla/5.0",
      "Cookie": cookiesToHeader(s.cookieJar)
    },
    body: JSON.stringify(s.flow)
  });

  // ✅ ALWAYS merge cookies (even if body is empty)
  const newCookies = parseSetCookieHeaders(
    response.headers.raw()?.["set-cookie"] || []
  );
  s.cookieJar = mergeCookies(s.cookieJar, newCookies);

  // ✅ Read body safely
  let json = null;
  const text = await response.text();

  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text);
    } catch (err) {
      log.warn("[QR] Non-JSON response, treating as pending");
    }
  }

  // 🔁 QR ROTATION
  if (json?.data?.qrCode && json.data.qrCode !== s.flow.qrCode) {
    s.flow.qrCode = json.data.qrCode;
    s.lastQrAt = now();
    log.info("[QR] QR rotated");
  }

  // ✅ SUCCESS detection (authoritative)
  const loggedIn =
    s.cookieJar.some(c => c.name === "LoginValid") &&
    s.cookieJar.some(c => c.name === "FpsExternalIdentity");

  if (loggedIn || json?.data === true) {
    log.info("[QR] Login successful");

    await replaceAllCookies(s.userId, s.cookieJar);
     s.done = true;
    sessions.delete(sessionId);

    return res.json({ status: "success" });
  }

  // ❌ Trafikverket explicit failure
  if (json?.data?.status === "failed" || json?.data?.status === "expired") {
    log.warn("[QR] Trafikverket reported failure");
    sessions.delete(sessionId);
    return res.json({ status: "failed" });
  }

  // ⏳ Still waiting
  return res.json({ status: "pending" });
}

