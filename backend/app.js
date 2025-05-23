const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { sequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use("/api/usuarios", require("./routes/usuario.routes"));

// Conexión y servidor
sequelize
  .authenticate()
  .then(() => {
    console.log("Conectado a la base de datos PostgreSQL.");
    return sequelize.sync(); // o .sync({ force: true }) si quieres reiniciar
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Error al conectar a la base de datos:", err));
