const express = require("express");
const Payment = require("../models/Payment");

const router = express.Router();

router.post("/payments", async (req, res) => {
  const { orderId, total, forceStatus } = req.body;

  if (!orderId || typeof total !== "number") {
    return res.status(400).json({ message: "orderId e total sao obrigatorios" });
  }

  const status =
    forceStatus === "APROVADO" || forceStatus === "RECUSADO"
      ? forceStatus
      : total <= 1000
        ? "APROVADO"
        : "RECUSADO";

  const reason = status === "APROVADO" ? "Pagamento aprovado" : "Pagamento recusado por regra interna";

  const payment = await Payment.create({
    orderId,
    total,
    status,
    reason
  });

  return res.status(201).json(payment);
});

module.exports = router;
