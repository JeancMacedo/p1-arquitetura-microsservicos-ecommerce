const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({ status: "ok", service: "catalog-service" });
});

app.use(productRoutes);

module.exports = app;
