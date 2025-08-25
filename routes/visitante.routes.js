const express = require("express");

const router = express.Router();

const visitanteController = require("../controllers/visitante.controller");

router.post("/agregarVisitante", visitanteController.agregarVisitante);

router.get("/buscarVisitante", visitanteController.buscarVisitante);

module.exports = router;
