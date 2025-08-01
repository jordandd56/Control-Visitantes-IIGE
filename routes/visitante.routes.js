const express = require("express");

const router = express.Router();

const visitanteController = require("../controllers/visitante.controller");

// Ruta para agregar un visitante

router.post("/agregarVisitante", visitanteController.agregarVisitante);

router.get("/buscarVisitante", visitanteController.buscarVisitante);

module.exports = router;
