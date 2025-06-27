const express = require("express");
const router = express.Router();
const areaController = require("../controllers/area.controller");

router.get("/", areaController.obtenerAreas);

router.post("/crearArea", areaController.crearArea);

module.exports = router;
