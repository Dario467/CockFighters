const mongoose = require('mongoose');

const URI = "mongodb+srv://CookFighter2025:CookFighter2025@cook.hz77si2.mongodb.net/CockFighter";

const conectarDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log(">>> Base de datos conectada");
    } catch (error) {
        console.error("Error conectando a la BD:", error);
    }
};

module.exports = conectarDB; 