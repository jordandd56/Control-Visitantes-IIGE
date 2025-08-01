const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const sequelize = require("./models"); // <-- asegúrate que exporte sequelize directamente

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use("/api/usuarios", require("./routes/usuario.routes"));
app.use("/api/visitantes", require("./routes/visitante.routes"));
app.use("/api/roles", require("./routes/rol.routes"));
app.use("/api/areas", require("./routes/areas.routes"));
app.use("/api/visitas", require("./routes/visita.routes"));

// 🔍 Log de variables para Azure (no pongas contraseña)
console.log("Conectando a DB:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Conexión y servidor con logs de error
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conectado a la base de datos PostgreSQL.");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err.message);
    console.error(err.stack);
    process.exit(1); // Para que Azure registre el error de inicio
  });
