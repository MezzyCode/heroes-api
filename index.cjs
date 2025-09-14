const express = require("express");
const cors = require("cors");

const users = require("./routes/users.cjs");
const heroes = require("./routes/heroes.cjs");
const battles = require("./routes/battles.cjs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("⚔️ Welcome to the Coliseum API!"));

// Routes
app.use("/", users);
app.use("/heroes", heroes);
app.use("/battle", battles);

app.listen(PORT, () => {
  console.log(`Coliseum API running on port ${PORT}`);
});
