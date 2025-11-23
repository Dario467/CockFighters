const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

//crear app
const app = express();

// Servir archivos estáticos del FRONTEND
app.use(express.static(path.join(__dirname, '../FRONTEND')));
app.use('/Assets', express.static(path.join(__dirname, '../Assets')));

//importaciones y conexiones
const conectarDB = require('./src/config/database');
conectarDB();

// Modelos
const Gallo = require('./models/Gallos');

// Rutas
const authRoutes = require('./src/routes/auth');

//define el puerto
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Conectar Auth
app.use('/api/auth', authRoutes);

// integración de stripe
let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
    console.log("Stripe habilitado.");
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    app.post('/create-checkout-session', async (req, res) => {
        const { priceId } = req.body;

        if (!priceId) {
            return res.status(400).json({ error: 'Falta priceId en el body' });
        }

        try {
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: 'http://localhost:3000/success.html',
                cancel_url: 'http://localhost:3000/cancel.html',
            });

            res.json({ id: session.id });
        } catch (error) {
            console.error('Error creando sesión de Stripe:', error);
            res.status(500).json({ error: 'No se pudo crear la sesión de checkout' });
        }
    });
} else {
    console.log("Stripe DESHABILITADO (no hay STRIPE_SECRET_KEY)");
}

//API a gallos
app.get('/api/gallos', async (req, res) => {
    try {
        const gallos = await Gallo.find();
        res.json(gallos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener gallos" });
    }
});

//login por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/login.html'));
});

//inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
