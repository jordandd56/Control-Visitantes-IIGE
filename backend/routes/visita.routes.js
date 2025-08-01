// routes/visita.routes.js
const express = require("express");
const router = express.Router();
const visitaCtrl = require("../controllers/visita.controller");

router.post("/crearVisita", visitaCtrl.crearVisita);
router.get("/obtenerVisitasDelDia", visitaCtrl.obtenerVisitasDelDia);

/* NUEVAS */
router.put("/:id/estado", visitaCtrl.actualizarEstadoVisita); // check‑in / check‑out
router.get("/visitas/activas", visitaCtrl.obtenerVisitasActivas); // las que siguen dentro

router.get("/reporte-por-cedula", visitaCtrl.obtenerReportePorCedula);

router.get("/reporte-por-fecha", visitaCtrl.reportePorFecha);

router.get("/reporte-por-rango", visitaCtrl.reportePorRango);

module.exports = router;
