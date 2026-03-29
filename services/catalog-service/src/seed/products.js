const Product = require("../models/Product");

const sampleProducts = [
  {
    name: "Galaxy Nebula S20",
    description: "Tela AMOLED 6.5 e camera tripla",
    price: 2599,
    sku: "SAMSUNG-NEBULA-S20"
  },
  {
    name: "iFruit Photon 14",
    description: "Chip A18 e armazenamento de 256GB",
    price: 6999,
    sku: "IFRUIT-PHOTON-14"
  },
  {
    name: "Moto Falcon G9",
    description: "Bateria de longa duracao e 128GB",
    price: 1799,
    sku: "MOTO-FALCON-G9"
  },
  {
    name: "XiaNova Pulse 13",
    description: "Carregamento rapido 67W e 8GB RAM",
    price: 2199,
    sku: "XIANOVA-PULSE-13"
  },
  {
    name: "Noktel Titan X",
    description: "Resistencia reforcada e tela 120Hz",
    price: 2399,
    sku: "NOKTEL-TITAN-X"
  },
  {
    name: "OneStar Orbit 12",
    description: "Design premium com camera 50MP",
    price: 3299,
    sku: "ONESTAR-ORBIT-12"
  },
  {
    name: "ZenFone Aurora 11",
    description: "Desempenho para jogos com 12GB RAM",
    price: 2899,
    sku: "ZENFONE-AURORA-11"
  },
  {
    name: "RealSky Turbo 8",
    description: "Conjunto equilibrado para uso diario",
    price: 1499,
    sku: "REALSKY-TURBO-8"
  }
];

async function seedProducts() {
  const count = await Product.countDocuments();

  if (count > 0) {
    return;
  }

  await Product.insertMany(sampleProducts);
}

module.exports = {
  seedProducts
};
