const express = require('express');
const path = require('path');
const conectarDB = require('./db');
const Gallo = require('./models/Gallos');

const app = express();
const PORT = 3000;

conectarDB();

app.use(express.json());


app.use(express.static(path.join(__dirname, '../FRONTEND'))); 


app.use('/Assets', express.static(path.join(__dirname, '../Assets')));


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