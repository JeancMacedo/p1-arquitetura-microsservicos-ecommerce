require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const { seedProducts } = require("./seed/products");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/catalog_db";

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI);
    await seedProducts();
    app.listen(PORT, () => {
      console.log(`catalog-service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting catalog-service:", error.message);
    process.exit(1);
  }
}

bootstrap();
