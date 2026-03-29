require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 3005;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/payment_db";

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`payment-service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting payment-service:", error.message);
    process.exit(1);
  }
}

bootstrap();
