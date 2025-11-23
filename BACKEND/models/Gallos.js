const mongoose = require('mongoose');

const galloSchema = new mongoose.Schema({
    nombre: String,
    vida: Number,
    poder: Number,
    bullet: Number,
    sprites: {
        spriteBack: String,
        spriteFront: String
    },
    action:[
        "recharge"
    ]
    
}, { 
    collection: "Cock's" // Tu colección específica
});

// Exportamos el MODELO para poder usar "Gallo.find()" en otros archivos
module.exports = mongoose.model('Gallo', galloSchema);