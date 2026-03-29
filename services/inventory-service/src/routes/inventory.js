const express = require("express");
const Stock = require("../models/Stock");

const router = express.Router();

router.post("/inventory", async (req, res) => {
  try {
    const { productId, quantity = 0 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId e obrigatorio" });
    }

    const stock = await Stock.findOneAndUpdate(
      { productId },
      { productId, quantity },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(stock);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/inventory/:productId", async (req, res) => {
  const stock = await Stock.findOne({ productId: req.params.productId }).lean();

  if (!stock) {
    return res.status(404).json({ message: "Estoque nao encontrado para o produto" });
  }

  return res.status(200).json(stock);
});

router.put("/inventory/:productId", async (req, res) => {
  const { quantity, quantityChange } = req.body;
  const stock = await Stock.findOne({ productId: req.params.productId });

  if (!stock) {
    return res.status(404).json({ message: "Estoque nao encontrado para o produto" });
  }

  let nextQuantity = stock.quantity;

  if (typeof quantity === "number") {
    nextQuantity = quantity;
  }

  if (typeof quantityChange === "number") {
    nextQuantity += quantityChange;
  }

  if (nextQuantity < 0) {
    return res.status(409).json({ message: "Estoque insuficiente" });
  }

  stock.quantity = nextQuantity;
  await stock.save();

  return res.status(200).json(stock);
});

module.exports = router;
