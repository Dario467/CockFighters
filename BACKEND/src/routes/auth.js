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

// obtener equipo del usuario
router.get('/team/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        return res.json({
            gallos: user.gallos || []
        });
    } catch (error) {
        console.error("ERROR EN GET TEAM:", error);
        return res.status(500).json({ message: "Error al obtener equipo." });
    }
});

// obtener datos públicos del usuario (incluye 'fondos')
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).select('-password -creditCards');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        return res.json(user);
    } catch (error) {
        console.error('ERROR EN GET USER:', error);
        return res.status(500).json({ message: 'Error al obtener usuario' });
    }
});

// guardar/seleccionar fondo preferido del usuario
router.post('/user/:userId/fondo', async (req, res) => {
    const { userId } = req.params;
    const { fondo } = req.body;

    if (!fondo) return res.status(400).json({ message: 'Fondo requerido' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        // permitir seleccionar 'default' o un fondo que el usuario haya comprado
        if (fondo !== 'default' && !user.fondos.includes(fondo)) {
            return res.status(400).json({ message: 'Fondo no disponible para este usuario' });
        }

        user.selectedFondo = fondo;
        await user.save();

        return res.json({ message: 'Fondo seleccionado', selectedFondo: user.selectedFondo });
    } catch (error) {
        console.error('ERROR EN POST USER FONDO:', error);
        return res.status(500).json({ message: 'Error al guardar fondo' });
    }
});

// guardar equipo del usuario
router.post('/team/:userId', async (req, res) => {
    const { userId } = req.params;
    const { gallos } = req.body;

    try {
        if (!Array.isArray(gallos)) {
            return res.status(400).json({ message: "gallos debe ser un array." });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { gallos: gallos },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        return res.json({
            message: "Equipo guardado correctamente.",
            gallos: user.gallos
        });
    } catch (error) {
        console.error("ERROR EN POST TEAM:", error);
        return res.status(500).json({ message: "Error al guardar equipo." });
    }
});

module.exports = router;
