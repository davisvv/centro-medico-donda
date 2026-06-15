// src/routes/pacientesRoutes.js
const express = require("express");
const router = express.Router();
const {
  obtenerPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
} = require("../controllers/pacientesControllers");

// GET  /api/pacientes       → todos los pacientes
// GET  /api/pacientes/:id   → un paciente
// POST /api/pacientes       → crear paciente
// PUT  /api/pacientes/:id   → actualizar paciente

router.get("/", obtenerPacientes);
router.get("/:id", obtenerPaciente);
router.post("/", crearPaciente);
router.put("/:id", actualizarPaciente);

module.exports = router;
