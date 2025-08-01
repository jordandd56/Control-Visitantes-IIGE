const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuario.controller");

// Ruta para login
router.post("/login", usuarioController.login);

// Ruta para agregar nuevo usuario
router.post("/agregar", usuarioController.agregarUsuario);

// Ruta para obtener todos los usuarios
router.get("/obtenerUsuarios", usuarioController.obtenerUsuarios);

// Ruta para buscar usuarios por nombre completo
router.get("/buscar", usuarioController.obtenerUsuariosPorNombre);

// NUEVA: Ruta para cambiar solo la contraseña de un usuario
router.put("/actualizarContrasena/:id", usuarioController.actualizarContrasena);

module.exports = router;
