const express = require("express");
const router  = express.Router();
const { obtenerMedicos } = require("../controllers/usuariosControllers");
const verificarToken = require("../middlewares/verificarToken");
const verificarRol   = require("../middlewares/verificarRol");

router.get("/medicos", verificarToken, verificarRol(["admin", "recepcionista"]), obtenerMedicos);

module.exports = router;
