const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuario.controller");

// Ruta para login
router.post("/login", usuarioController.login);

router.post("/agregar", usuarioController.agregarUsuario);

router.get("/obtenerUsuarios", usuarioController.obtenerUsuarios);

router.get("/buscar", usuarioController.obtenerUsuariosPorNombre);

module.exports = router;
