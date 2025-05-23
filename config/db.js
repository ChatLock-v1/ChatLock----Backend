require("dotenv").config();
const mongoose = require("mongoose");

const db = mongoose.createConnection(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on("error", console.error.bind(console, "Db connection error:"));
db.once("open", () => {
  console.log("Database is live!");
});

module.exports = { db };
