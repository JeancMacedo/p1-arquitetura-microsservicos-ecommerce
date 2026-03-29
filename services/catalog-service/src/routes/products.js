const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const router = express.Router();

router.get("/products", async (_, res) => {
  const products = await Product.find().lean();
  return res.status(200).json(products);
});

router.get("/products/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "productId invalido" });
  }

  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    return res.status(404).json({ message: "Produto nao encontrado" });
  }

  return res.status(200).json(product);
});

router.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "SKU ja cadastrado" });
    }

    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
