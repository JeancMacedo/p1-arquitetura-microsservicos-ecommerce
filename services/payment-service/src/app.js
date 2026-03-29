const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/payments");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", service: "payment-service" });
});

app.use(paymentRoutes);

module.exports = app;
