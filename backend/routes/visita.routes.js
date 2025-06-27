const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/visita.controller");

router.post("/crearVisita", usuarioController.crearVisita);

module.exports = router;
