const express = require('express');
const router = express.Router();
const Gallo = require('../models/Gallos');

router.get('/gallos', async (req, res) => {
  try {
    const gallos = await Gallo.find();
    res.json(gallos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener gallos' });
  }
});

module.exports = router;
