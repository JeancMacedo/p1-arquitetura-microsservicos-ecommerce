const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../models/Order");

const router = express.Router();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3002";
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || "http://localhost:3001";
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || "http://localhost:3004";
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3005";

function formatAxiosError(error) {
  if (error.response) {
    return {
      status: error.response.status,
      data: error.response.data
    };
  }

  return {
    status: 503,
    data: { message: "Servico indisponivel" }
  };
}

router.post("/orders", async (req, res) => {
  const { userId, items, forcePaymentStatus } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "userId e items sao obrigatorios" });
  }

  try {
    await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
  } catch (error) {
    const err = formatAxiosError(error);
    return res.status(err.status).json({ message: "Usuario invalido", details: err.data });
  }

  try {
    const enrichedItems = [];

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== "number" || item.quantity <= 0) {
        return res.status(400).json({ message: "Cada item deve ter productId e quantity > 0" });
      }

      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          message: "productId invalido",
          productId: item.productId
        });
      }

      const [productResponse, stockResponse] = await Promise.all([
        axios.get(`${CATALOG_SERVICE_URL}/products/${item.productId}`),
        axios.get(`${INVENTORY_SERVICE_URL}/inventory/${item.productId}`)
      ]);

      if (stockResponse.data.quantity < item.quantity) {
        return res.status(409).json({
          message: "Estoque insuficiente",
          productId: item.productId,
          available: stockResponse.data.quantity,
          requested: item.quantity
        });
      }

      const unitPrice = productResponse.data.price;
      enrichedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal: unitPrice * item.quantity
      });
    }

    const total = enrichedItems.reduce((acc, current) => acc + current.subtotal, 0);

    const order = await Order.create({
      userId,
      items: enrichedItems,
      total,
      status: "CRIADO"
    });

    const paymentResponse = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, {
      orderId: order._id.toString(),
      total,
      forceStatus: forcePaymentStatus
    });

    order.paymentId = paymentResponse.data._id;

    if (paymentResponse.data.status === "APROVADO") {
      for (const item of enrichedItems) {
        await axios.put(`${INVENTORY_SERVICE_URL}/inventory/${item.productId}`, {
          quantityChange: -item.quantity
        });
      }

      order.status = "PAGO";
    } else {
      order.status = "CANCELADO";
    }

    await order.save();

    return res.status(201).json(order);
  } catch (error) {
    const err = formatAxiosError(error);
    return res.status(err.status || 500).json({
      message: "Falha ao processar pedido",
      details: err.data || error.message
    });
  }
});

router.get("/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id).lean();

  if (!order) {
    return res.status(404).json({ message: "Pedido nao encontrado" });
  }

  return res.status(200).json(order);
});

module.exports = router;
