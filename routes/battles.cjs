const express = require("express");
const pool = require("../db.cjs");
const { authenticate, updateLastActive } = require("../middleware/auth.cjs");

const router = express.Router();

// Battle
router.post("/", authenticate, async (req, res) => {
  const { heroId, opponentId } = req.body;

  const user = await pool.query(`SELECT id FROM users WHERE username=$1`, [req.user.username]);
  const userId = user.rows[0].id;

  // Daily battle cap
  const battleCount = await pool.query(
    `SELECT COUNT(*) FROM battles WHERE user_id=$1 AND DATE(created_at)=CURRENT_DATE`,
    [userId]
  );
  if (parseInt(battleCount.rows[0].count) >= 10) {
    return res.status(400).json({ error: "Daily battle cap reached (10/day)." });
  }

  // Fetch heroes
  const heroRes = await pool.query(`SELECT * FROM heroes WHERE id=$1`, [heroId]);
  const oppRes = await pool.query(`SELECT * FROM heroes WHERE id=$1`, [opponentId]);
  const hero = heroRes.rows[0];
  const opp = oppRes.rows[0];
  if (!hero || !opp) return res.status(404).json({ error: "Hero not found" });

  let winner, loser, deletedHero;
  if (hero.powerint > opp.powerint) {
    winner = hero.creator_id;
    loser = opp.creator_id;
    deletedHero = opp.id;
  } else if (hero.powerint < opp.powerint) {
    winner = opp.creator_id;
    loser = hero.creator_id;
    deletedHero = hero.id;
  } else {
    return res.json({ result: "Draw! No one dies." });
  }

  await pool.query(`UPDATE users SET wins=wins+1 WHERE id=$1`, [winner]);
  await pool.query(`UPDATE users SET losses=losses+1 WHERE id=$1`, [loser]);
  await pool.query(`DELETE FROM heroes WHERE id=$1`, [deletedHero]);
  await pool.query(`INSERT INTO battles (user_id) VALUES ($1)`, [userId]);

  await updateLastActive(req.user.username);

  res.json({
    result: "Battle complete",
    winnerHero: deletedHero === hero.id ? opp : hero,
    loserHero: deletedHero === hero.id ? hero : opp,
  });
});

module.exports = router;
