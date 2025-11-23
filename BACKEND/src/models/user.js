const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// schema tarjeta
const cardSchema = new mongoose.Schema({
    cardholderName: { type: String, required: true },
    last4:          { type: String, required: true },
    expMonth:       { type: Number, required: true },
    expYear:        { type: Number, required: true },
    encryptedCard:  { type: String, required: true }
});

// schema usuario
const userSchema = new mongoose.Schema({
    username:  { type: String, required: true, unique: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },

    creditCards: [cardSchema]

}, { timestamps: true });

// encriptación contraseña (CORREGIDO)
userSchema.pre('save', async function () {

    // mongoose 7 NO usa next() en async
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// validar contraseña
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// agregar tarjeta (CORREGIDO: createCipher → createCipheriv)
userSchema.methods.addCreditCard = function (cardNumber, cardholderName, expMonth, expYear) {

    const key = crypto.createHash('sha256')
        .update(process.env.CARD_SECRET || 'secretkey123')
        .digest();

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);

    let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const last4 = cardNumber.slice(-4);

    this.creditCards.push({
        cardholderName,
        last4,
        expMonth,
        expYear,
        encryptedCard: iv.toString('hex') + ':' + encrypted
    });
};

module.exports = mongoose.model('User', userSchema);
