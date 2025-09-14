const express = require("express");
const crypto = require("crypto");
const pool = require("../db.cjs");
const { authenticate, updateLastActive } = require("../middleware/auth.cjs");

const router = express.Router();

// Helper
function generatePowerInt(name, power) {
  const str = name + power;
  const hash = crypto.createHash("md5").update(str).digest("hex");
  const num = parseInt(hash.substring(0, 8), 16);
  return (num % 10) + 1; // 1-10
}

// Create hero
router.post("/", authenticate, async (req, res) => {
  const { name, power } = req.body;
  const powerInt = generatePowerInt(name, power);

  const user = await pool.query(`SELECT id FROM users WHERE username=$1`, [req.user.username]);
  const userId = user.rows[0].id;

  // Hero caps (same logic as before)
  const totalCount = await pool.query(`SELECT COUNT(*) FROM heroes WHERE creator_id=$1`, [userId]);
  if (parseInt(totalCount.rows[0].count) >= 5) {
    return res.status(400).json({ error: "Hero cap reached (max 5 per user)." });
  }

  const dailyCount = await pool.query(
    `SELECT COUNT(*) FROM heroes WHERE creator_id=$1 AND DATE(created_at)=CURRENT_DATE`,
    [userId]
  );
  if (parseInt(dailyCount.rows[0].count) >= 5) {
    return res.status(400).json({ error: "Daily hero creation cap reached (5/day)." });
  }

  const result = await pool.query(
    `INSERT INTO heroes (name, power, powerInt, creator_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, power, powerInt, userId]
  );

  await updateLastActive(req.user.username);

  res.status(201).json(result.rows[0]);
});

// List all heroes
router.get("/", async (req, res) => {
  const result = await pool.query(`SELECT * FROM heroes`);
  res.json(result.rows);
});

// My heroes
router.get("/mine", authenticate, async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, power, powerInt, creator_id
    FROM heroes
    WHERE creator_id = (SELECT id FROM users WHERE username=$1)`,
    [req.user.username]
  );
  res.json(result.rows);
});

module.exports = router;
