# Heroes API

A Node.js + Express + PostgreSQL (Supabase) project where users create heroes, wage battles, and rise to glory!

## Features

### User Accounts

- Register / login with JWT-based auth.
- Tracks wins, losses, and last activity

### Heroes

- Create heroes (max 5 total per user, 5/day)
- Each hero gains powers from their name and power
- Heroes die forever upon losing a battle (RIP)

### Battles

- Fight between heroes, strongest wins
- Wins and losses is tracked
- Losing hero is deleted from DB
- Max 10 battles/day per user

## Tech Stack

- Backend: Node.js + Express
- Database: PostgreSQL (via Supabase)
- Auth: JWT + bcrypt
- Hosting: Designed for Render free tier

## API Endpoints

| Method | Endpoint    | Description                 |
| ------ | ----------- | --------------------------- |
| POST   | `/register` | Create a new account        |
| POST   | `/login`    | Login and receive JWT token |

| Method | Endpoint  | Description                     |
| ------ | --------- | ------------------------------- |
| POST   | `/heroes` | Create hero (respects caps)     |
| GET    | `/heroes` | List all heroes in the Coliseum |

| Method | Endpoint  | Description               |
| ------ | --------- | ------------------------- |
| POST   | `/battle` | Battle between two heroes |

## Setup

Clone Repo
```bash
git clone https://github.com/yourname/coliseum-api.git
cd coliseum-api
```

Install Dep
```bash
npm install
```

Configure .env
```env
DATABASE_URL=your_supabase_postgres_url
JWT_SECRET=your_secret
PORT=3000
```

Initialize Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW()
);

CREATE TABLE heroes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  power TEXT NOT NULL,
  powerInt INT NOT NULL,
  creator_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE battles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

Run Server
```bash
pnpm launch
```