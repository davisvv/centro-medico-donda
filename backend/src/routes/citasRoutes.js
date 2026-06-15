// src/routes/citasRoutes.js
const express = require("express");
const router = express.Router();
const {
  obtenerCitas,
  obtenerCitasHoy,
  crearCita,
  actualizarEstado,
} = require("../controllers/citasControllers");

// GET  /api/citas       → todas las citas
// GET  /api/citas/hoy   → citas de hoy
// POST /api/citas       → crear cita
// PUT  /api/citas/:id   → actualizar estado

router.get("/", obtenerCitas);
router.get("/hoy", obtenerCitasHoy);
router.post("/", crearCita);
router.put("/:id", actualizarEstado);

module.exports = router;
