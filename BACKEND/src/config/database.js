const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    const URI = process.env.MONGO_URI;

    const conn = await mongoose.connect(URI);

    console.log("MongoDB conectado:", conn.connection.host);
  } catch (error) {
    console.error("Error al conectar a la DB:", error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;
