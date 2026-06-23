const express = require("express");
const router = express.Router();
const {
  obtenerCitas,
  obtenerCitasHoy,
  crearCita,
  actualizarEstado,
} = require("../controllers/citasControllers");
const verificarToken = require("../middlewares/verificarToken");
const verificarRol   = require("../middlewares/verificarRol");

const soloAdminRecep        = verificarRol(["admin", "recepcionista"]);
const adminRecepMedPaciente = verificarRol(["admin", "recepcionista", "medico", "paciente"]);
const adminRecepMedico      = verificarRol(["admin", "recepcionista", "medico"]);

router.get("/",    verificarToken, adminRecepMedico,      obtenerCitas);
router.get("/hoy", verificarToken, adminRecepMedPaciente, obtenerCitasHoy);
router.post("/",   verificarToken, soloAdminRecep,        crearCita);
router.put("/:id", verificarToken, adminRecepMedico,      actualizarEstado);

module.exports = router;
