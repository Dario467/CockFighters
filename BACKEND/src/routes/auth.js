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

// actualizar puntuación del usuario (set)
router.post('/user/:userId/score', async (req, res) => {
    const { userId } = req.params;
    const { score } = req.body;

    if (score === undefined || score === null) return res.status(400).json({ message: 'score requerido' });
    const parsed = parseInt(score, 10);
    if (isNaN(parsed)) return res.status(400).json({ message: 'score debe ser un entero' });

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        user.score = parsed;
        await user.save();

        const returned = user.toObject();
        delete returned.password;
        delete returned.creditCards;

        return res.json(returned);
    } catch (error) {
        console.error('ERROR EN POST USER SCORE:', error);
        return res.status(500).json({ message: 'Error al guardar puntuación' });
    }
});

// obtener ranking global (top N)
router.get('/ranking', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '10', 10) || 10, 100);
    try {
        const users = await User.find({}).select('username score').sort({ score: -1 }).limit(limit);
        return res.json(users);
    } catch (error) {
        console.error('ERROR EN GET RANKING:', error);
        return res.status(500).json({ message: 'Error al obtener ranking' });
    }
});

// incrementar puntuación del usuario (delta opcional, por defecto 1)
router.post('/user/:userId/score/inc', async (req, res) => {
    const { userId } = req.params;
    let { delta } = req.body;
    if (delta === undefined || delta === null) delta = 1;
    const parsed = parseInt(delta, 10);
    if (isNaN(parsed)) return res.status(400).json({ message: 'delta debe ser un entero' });

    try {
        const user = await User.findByIdAndUpdate(userId, { $inc: { score: parsed } }, { new: true }).select('username score');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        return res.json(user);
    } catch (error) {
        console.error('ERROR EN POST USER SCORE INC:', error);
        return res.status(500).json({ message: 'Error al incrementar puntuación' });
    }
});

module.exports = router;
