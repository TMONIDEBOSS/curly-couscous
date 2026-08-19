import { Router } from "express";
import { readAll, getById, getStats } from "../services/historyStore.js";

const router = Router();

// Returns recent scans plus summary stats for the dashboard. Note: this
// is a shared, global history for now since there's no login system yet
// — every visitor sees the same list. Once accounts exist, filter by
// owner here instead.
router.get("/history", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json({
    items: readAll().slice(0, limit),
    stats: getStats(),
  });
});

router.get("/history/:id", (req, res) => {
  const record = getById(req.params.id);
  if (!record) {
    return res.status(404).json({ error: "That scan report could not be found." });
  }
  res.json(record);
});

export default router;
