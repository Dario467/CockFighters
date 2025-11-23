const express = require('express');
const router = express.Router();
const User = require('../models/user');

const generateToken = (id) => {
    return id;
};

//registro
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: 'Ya existe un usuario con este mail.' });

        const user = await User.create({ username, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Datos no válidos pa' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error del server al registrarte.' });
    }
});

//login
router.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (user && await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Credenciales inválidas.' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Error del servidor al iniciar sesión.' });
    }
});

//editar usuario
router.put('/edit/:id', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'Usuario no encontrado.' });

        user.username = username || user.username;
        user.email = email || user.email;

        if (password) user.password = password;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            message: 'Usuario actualizado.'
        });

    } catch (error) {
        res.status(500).json({ message: 'Error del servidor al actualizar usuario.' });
    }
});


//eliminar usuario
router.delete('/delete/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'Usuario no encontrado.' });

        await User.deleteOne({ _id: req.params.id });

        res.json({ message: 'Usuario eliminado exitosamente.' });

    } catch (error) {
        res.status(500).json({ message: 'Error del servidor al eliminar.' });
    }
});

//agregar tarjetas
router.post('/addCard/:id', async (req, res) => {
    const { cardNumber, cardholderName, expMonth, expYear } = req.body;

    if (!cardNumber || !cardholderName || !expMonth || !expYear) {
        return res.status(400).json({ message: "Faltan datos de tarjeta." });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'Usuario no encontrado.' });

        user.addCreditCard(cardNumber, cardholderName, expMonth, expYear);

        await user.save();

        res.json({ message: "Tarjeta agregada exitosamente." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error del servidor al agregar tarjeta." });
    }
});


//tarjetas del usuario
router.get('/cards/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado." });

        const cards = user.creditCards.map(card => ({
            _id: card._id,
            cardholderName: card.cardholderName,
            last4: card.last4,
            expMonth: card.expMonth,
            expYear: card.expYear
        }));

        res.json(cards);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener tarjetas." });
    }
});


//obtener una tarehta (opcional)
router.get('/card/:userId/:cardId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado." });

        const card = user.creditCards.id(req.params.cardId);

        if (!card)
            return res.status(404).json({ message: "Tarjeta no encontrada." });

        res.json({
            _id: card._id,
            cardholderName: card.cardholderName,
            last4: card.last4,
            expMonth: card.expMonth,
            expYear: card.expYear
        });

    } catch (error) {
        res.status(500).json({ message: "Error al obtener tarjeta." });
    }
});


//elimina tarjeta
router.delete('/deleteCard/:userId/:cardId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado." });

        const card = user.creditCards.id(req.params.cardId);

        if (!card)
            return res.status(404).json({ message: "Tarjeta no encontrada." });

        // Eliminar
        card.remove();
        await user.save();

        res.json({ message: "Tarjeta eliminada exitosamente." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar tarjeta." });
    }
});

module.exports = router;
