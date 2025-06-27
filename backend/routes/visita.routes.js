const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/visita.controller");

router.post("/crearVisita", usuarioController.crearVisita);

router.get("/obtenerVisitasDelDia", usuarioController.obtenerVisitasDelDia);

module.exports = router;
