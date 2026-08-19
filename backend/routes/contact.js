import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "contact-messages.json");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

// Tighter than the general API limiter in server.js — keeps the contact
// form from being used to spam the message store or flood an inbox once
// email sending is wired up.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many messages sent from this connection. Try again in a bit." },
});

const router = Router();

// Stores the message to a local JSON file so nothing is lost, but does
// NOT send an email or notification yet — no email provider is wired up.
// Next step: plug in a transactional email service (e.g. Resend, SendGrid)
// here so messages actually reach an inbox instead of just sitting on disk.
router.post("/contact", contactLimiter, (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are all required." });
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  ensureStore();
  const entry = {
    id: crypto.randomUUID(),
    name: String(name).trim().slice(0, 200),
    email: email.trim().slice(0, 200),
    message: String(message).trim().slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };

  const all = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  all.unshift(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(all.slice(0, 500), null, 2));

  res.json({ ok: true });
});

export default router;
