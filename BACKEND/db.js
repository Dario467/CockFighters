const mongoose = require('mongoose');

const URI = "mongodb+srv://CookFighter2025:CookFighter2025@cook.hz77si2.mongodb.net/CockFighter?retryWrites=true&w=majority&appName=Cook";

const conectarDB = async () => {
  try {
    await mongoose.connect(URI);
    console.log("✅ Base de datos conectada correctamente");
  } catch (error) {
    console.error("❌ Error conectando a la BD:", error.message);
  }
};

module.exports = conectarDB;
