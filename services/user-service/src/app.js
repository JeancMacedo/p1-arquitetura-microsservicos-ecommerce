const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", service: "user-service" });
});

app.use(userRoutes);

module.exports = app;
