const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

function getCipherKey() {
    const key = process.env.CIPHER_KEY;
    if (!key || key.length !== 64) {
        throw new Error('La variable CIPHER_KEY debe estar en el .env y tener 64 caracteres hexadecimales.');
    }
    return Buffer.from(key, 'hex');
}

function encryptAESGCM(text) {
    const iv = crypto.randomBytes(12); // GCM recomendado 12 bytes
    const key = getCipherKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Almacenamos todo junto para validar integridad en el descifrado
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decryptAESGCM(encryptedData) {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) throw new Error('Formato de datos cifrados inválido o corrupto.');
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getCipherKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    
    // Auth Tag garantiza que los datos no han sido alterados (Integridad)
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

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

    creditCards: [cardSchema],

    // lista de gallos que posee el usuario (strings) protegida con cifrado
    gallos: {
        type: [String],
        default: [],
        set: function(gallosArray) {
            if (!gallosArray) return [];
            return gallosArray.map(g => {
                if (g && g.includes(':') && g.split(':').length === 3) return g; // Ya cifrado
                return encryptAESGCM(g);
            });
        },
        get: function(gallosArray) {
            if (!gallosArray) return [];
            return gallosArray.map(g => {
                try {
                    return decryptAESGCM(g);
                } catch(e) {
                    return g; // Fallback para datos legacy en texto plano
                }
            });
        }
    },

    // lista de fondos (strings)
    fondos: {
        type: [String],
        default: []
    },

    //puntuación global de usuario
    score: {
        type: Number,
        default: 0
    },

    // fondo seleccionado por el usuario (string)
    selectedFondo: {
        type: String,
        default: 'default'
    }

}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

// encriptación contraseña
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// validar contraseña
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// agregar tarjeta (con cifrado AES-256-GCM e integridad)
userSchema.methods.addCreditCard = function(cardNumber, cardholderName, expMonth, expYear) {
    const encryptedCard = encryptAESGCM(cardNumber);
    const last4 = cardNumber.slice(-4);

    this.creditCards.push({
        cardholderName,
        last4,
        expMonth,
        expYear,
        encryptedCard: encryptedCard
    });
};

// descifrar tarjeta (valida autenticación)
userSchema.methods.decryptCreditCard = function(cardId) {
    const card = this.creditCards.id(cardId);
    if (!card) throw new Error('Tarjeta no encontrada');
    return decryptAESGCM(card.encryptedCard);
};

module.exports = mongoose.model('User', userSchema);
