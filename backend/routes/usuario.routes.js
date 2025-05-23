const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuario.controller");

// Ruta para login
router.post("/login", usuarioController.login);

module.exports = router;
