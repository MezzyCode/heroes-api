const { Pool } = require("pg");

// Connection string (Supabase or local)
const connectionString = process.env.DATABASE_URL || "postgresql://localhost/postgres";

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // For Supabase
});

// Init tables if not exist
(async () => {
  // USERS
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      wins INT DEFAULT 0,
      losses INT DEFAULT 0,
      last_active TIMESTAMP DEFAULT NOW()
    );
  `);

  // HEROES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS heroes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      power TEXT NOT NULL,
      powerInt INT NOT NULL,
      creator_id INT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // BATTLES
  await pool.query(`
    CREATE TABLE IF NOT EXISTS battles (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})();

module.exports = pool;
