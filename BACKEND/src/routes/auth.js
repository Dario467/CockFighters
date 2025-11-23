const express = require('express');
const router = express.Router();
const User = require('../models/user');


// Token simple (placeholder)
const generateToken = (id) => id;

//registro
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Faltan datos." });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Este correo ya está registrado." });
        }

        //  asegura que se ejecute el pre('save')
        const user = new User({ username, email, password });
        await user.save();

        return res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("ERROR EN REGISTER:", error);
        return res.status(500).json({ message: "Error del servidor al registrarte." });
    }
});

//login
router.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;

    try {

        if (!emailOrUsername || !password) {
            return res.status(400).json({ message: "Llena todos los campos." });
        }

        const user = await User.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado." });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta." });
        }

        return res.json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("ERROR EN LOGIN:", error);
        return res.status(500).json({ message: "Error del servidor al iniciar sesión." });
    }
});

module.exports = router;
