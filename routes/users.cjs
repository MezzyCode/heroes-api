const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db.cjs");
const { authenticate, updateLastActive, SECRET } = require("../middleware/auth.cjs");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = bcrypt.hashSync(password, 8);
    await pool.query(`INSERT INTO users (username, password) VALUES ($1, $2)`, [username, hashed]);
    res.json({ message: "User registered!" });
  } catch (err) {
    res.status(400).json({ error: "User already exists or invalid input" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query(`SELECT * FROM users WHERE username=$1`, [username]);
  const user = result.rows[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  await updateLastActive(username);
  res.json({ token });
});

// User details
router.get("/me", authenticate, async (req, res) => {
  const { username } = req.user;
  const result = await pool.query(
    `SELECT id, username, wins, losses, last_active FROM users WHERE username=$1`,
    [username]
  );
  res.json(result.rows[0]);
});

module.exports = router;
