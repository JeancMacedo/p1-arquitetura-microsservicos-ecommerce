const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", service: "order-service" });
});

app.use(orderRoutes);

module.exports = app;
