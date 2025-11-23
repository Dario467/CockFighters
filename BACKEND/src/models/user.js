const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//schema para la tarjeta de credito guarda solo los ultimos 4 digitos para mostrar la tarhjeta
const cardSchema = new mongoose.Schema({
    cardholderName: { type: String, required: true },
    last4:          { type: String, required: true },
    expMonth:       { type: Number, required: true },
    expYear:        { type: Number, required: true },
    encryptedCard:  { type: String, required: true }
});

//schema del usuario
const userSchema = new mongoose.Schema({
    username:  { type: String, required: true, unique: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },

    //guarda varias tarjetas
    creditCards: [cardSchema]

}, { timestamps: true });

//encriptacion de la tarjeta
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

//validacion de la contraseña en login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//metodo para guardar una tarjeta, se encriota antes de guardar
userSchema.methods.addCreditCard = function(cardNumber, cardholderName, expMonth, expYear) {
    // Encriptar tarjeta
    const cipher = crypto.createCipher('aes-256-ctr', process.env.CARD_SECRET || 'secretkey123');
    let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Obtener últimos 4 dígitos
    const last4 = cardNumber.slice(-4);

    // Agregar al arreglo
    this.creditCards.push({
        cardholderName,
        last4,
        expMonth,
        expYear,
        encryptedCard: encrypted
    });
};

module.exports = mongoose.model('User', userSchema);
