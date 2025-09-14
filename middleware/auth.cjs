const jwt = require("jsonwebtoken");
const pool = require("../db.cjs");

const SECRET = process.env.JWT_SECRET || "supersecret";

function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "No token provided!" });

  jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token!" });
    req.user = decoded;
    next();
  });
}

async function updateLastActive(username) {
  await pool.query(`UPDATE users SET last_active = NOW() WHERE username=$1`, [username]);
}

module.exports = { authenticate, updateLastActive, SECRET };
