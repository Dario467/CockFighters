const express = require('express');
const path = require('path');
const cors = require('cors');
const WebSocket = require("ws");
const http = require("http");
const os = require("os");

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

//crear app
const app = express();

// Servir archivos estáticos del FRONTEND
app.use('/views', express.static(path.join(__dirname, '../FRONTEND/views')));
app.use(express.static(path.join(__dirname, '../FRONTEND')));
app.use('/Assets', express.static(path.join(__dirname, '../Assets')));
app.use('/Game', express.static(path.join(__dirname, '../Game')));

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
        const { priceId, productKey, productName, userId } = req.body;

        if (!priceId || !productKey || !productName || !userId) {
            return res.status(400).json({ error: 'Faltan datos en el body (priceId, productKey, productName, userId)' });
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
                // include session id for client to fetch and verify
                success_url: 'http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'http://localhost:3000/cancel.html',
                metadata: {
                    productKey: productKey,
                    productName: productName,
                    userId: userId
                }
            });

            res.json({ id: session.id });
        } catch (error) {
            console.error('Error creando sesión de Stripe:', error);
            res.status(500).json({ error: 'No se pudo crear la sesión de checkout' });
        }
    });

    // Endpoint para que el cliente consulte el session_id y el servidor verifique y aplique la compra
    app.get('/checkout-session', async (req, res) => {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json({ message: 'sessionId requerido' });

        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (!session) return res.status(404).json({ message: 'Session no encontrada' });

            // verificar que el pago se completó
            if (session.payment_status !== 'paid') {
                return res.status(400).json({ message: 'Pago no completado' });
            }

            // leer metadata
            const productKey = session.metadata && session.metadata.productKey;
            const productName = session.metadata && session.metadata.productName;
            const userId = session.metadata && session.metadata.userId;

            if (!productKey || !userId) {
                return res.status(400).json({ message: 'Falta metadata en la sesión' });
            }

            // actualizar usuario: agregar a fondos y aplicar reglas
            const User = require('./src/models/user');
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

            // reglas:
            // - si compra paquete 'all' (productKey === 'all') y user.fondos no está vacío => rechazar
            // - si user.fondos incluye 'all' => no puede comprar individuales
            // - si ya tiene el productKey => no volver a comprar

            const alreadyHasAll = user.fondos && user.fondos.includes('all');
            const alreadyHasProduct = user.fondos && user.fondos.includes(productKey);

            if (productKey === 'all') {
                if (user.fondos && user.fondos.length > 0) {
                    return res.status(400).json({ message: 'No puedes comprar el paquete porque ya tienes fondos individuales' });
                }

                // guardar sólo 'all' para representar paquete completo
                user.fondos = ['all'];
                await user.save();

                return res.json({ message: 'Paquete todos los fondos agregado', fondos: user.fondos });
            } else {
                if (alreadyHasAll) {
                    return res.status(400).json({ message: 'Ya compraste el paquete, no puedes comprar fondos individuales' });
                }
                if (alreadyHasProduct) {
                    return res.status(400).json({ message: 'Ya compraste este fondo' });
                }

                user.fondos = user.fondos || [];
                user.fondos.push(productKey);
                await user.save();

                return res.json({ message: `Fondo ${productName} agregado`, fondos: user.fondos });
            }

        } catch (error) {
            console.error('ERROR al verificar sesión de checkout:', error);
            return res.status(500).json({ message: 'Error al procesar la sesión' });
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

//servidor Ws para el juego

const server = http.createServer(app);

require('./serverExt')(app,server, WebSocket, os, PORT);
