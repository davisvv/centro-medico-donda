const express = require("express");
const router = express.Router();
const {
  obtenerPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
} = require("../controllers/pacientesControllers");
const verificarToken = require("../middlewares/verificarToken");
const verificarRol   = require("../middlewares/verificarRol");

const soloPersonal   = verificarRol(["admin", "recepcionista", "medico"]);
const soloAdminRecep = verificarRol(["admin", "recepcionista"]);

router.get("/",    verificarToken, soloPersonal,   obtenerPacientes);
router.get("/:id", verificarToken, soloPersonal,   obtenerPaciente);
router.post("/",   verificarToken, soloAdminRecep, crearPaciente);
router.put("/:id", verificarToken, soloAdminRecep, actualizarPaciente);

module.exports = router;
