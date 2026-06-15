// src/routes/autorizacionesRoutes.js
const express = require("express");
const router = express.Router();
const {
  obtenerAutorizaciones,
  crearAutorizacion,
  actualizarEstado,
} = require("../controllers/autorizacionesControllers");

// GET  /api/autorizaciones      → todas las autorizaciones
// POST /api/autorizaciones      → crear autorización
// PUT  /api/autorizaciones/:id  → actualizar estado

router.get("/", obtenerAutorizaciones);
router.post("/", crearAutorizacion);
router.put("/:id", actualizarEstado);

module.exports = router;
