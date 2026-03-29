const express = require("express");
const cors = require("cors");
const inventoryRoutes = require("./routes/inventory");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", service: "inventory-service" });
});

app.use(inventoryRoutes);

module.exports = app;
