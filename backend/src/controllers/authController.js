// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// ── LOGIN ──
const login = (req, res) => {
  const { correo, contrasena } = req.body;

  // Verificar que llegaron los datos
  if (!correo || !contrasena) {
    return res.status(400).json({
      error: "Correo y contraseña son obligatorios",
    });
  }

  // Buscar el usuario en la base de datos
  const sql = "SELECT * FROM usuarios WHERE correo = ? AND activo = true";
  db.query(sql, [correo], (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // Si no existe el usuario
    if (resultados.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = resultados[0];

    // Verificar la contraseña
    const contrasenaValida = bcrypt.compareSync(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    // Responder con el token y datos del usuario
    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  });
};

module.exports = { login };
    