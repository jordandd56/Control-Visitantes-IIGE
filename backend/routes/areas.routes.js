const express = require("express");
const router = express.Router();
const areaController = require("../controllers/area.controller");

router.get("/", areaController.obtenerAreas);

module.exports = router;
