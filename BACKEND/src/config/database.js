const mongoose = require('mongoose');
const conectarDB = async() =>{
  try{
    //lee la URI del proceso aqui cargada por dotenv en server.js
    const URI = process.env.MONGO_URI;

    const conn = await mongoose.connect(URI);
    console.log('Mongo DB concectado> ${conn.connection.host}')
  }
  catch(error){
    console.error('Error en la conexion de la DB: ${error.mesaage}')
    process.exit(1)
  }
};

module.exports = conectarDB;
