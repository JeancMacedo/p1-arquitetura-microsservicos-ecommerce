const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email ja cadastrado" });
    }

    return res.status(400).json({ message: error.message });
  }
});

router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id).lean();

  if (!user) {
    return res.status(404).json({ message: "Usuario nao encontrado" });
  }

  return res.status(200).json(user);
});

module.exports = router;
