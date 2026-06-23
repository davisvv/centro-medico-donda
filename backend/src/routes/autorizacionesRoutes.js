const express = require("express");
const router = express.Router();
const {
  obtenerAutorizaciones,
  crearAutorizacion,
  actualizarEstado,
} = require("../controllers/autorizacionesControllers");
const verificarToken = require("../middlewares/verificarToken");
const verificarRol   = require("../middlewares/verificarRol");

const todos         = verificarRol(["admin", "recepcionista", "medico", "paciente"]);
const soloAdminMed  = verificarRol(["admin", "medico"]);

router.get("/",    verificarToken, todos,        obtenerAutorizaciones);
router.post("/",   verificarToken, soloAdminMed, crearAutorizacion);
router.put("/:id", verificarToken, soloAdminMed, actualizarEstado);

module.exports = router;
