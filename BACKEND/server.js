const express = require('express');
const path = require('path');
const conectarDB = require('./db');
const Gallo = require('./models/Gallos');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = 3000;

conectarDB();

app.use(express.json());

app.use(express.static(path.join(__dirname, '../FRONTEND')));
app.use('/Assets', express.static(path.join(__dirname, '../Assets')));

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

app.get('/api/gallos', async (req, res) => {
  try {
    const gallos = await Gallo.find();
    res.json(gallos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener gallos" });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/views/menuP.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
