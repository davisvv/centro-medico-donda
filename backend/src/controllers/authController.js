const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// ── LOGIN ──
const login = (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  const sql = "SELECT * FROM usuarios WHERE correo = ? AND activo = true";
  db.query(sql, [correo], (error, resultados) => {
    if (error) return res.status(500).json({ error: "Error en el servidor" });

    if (resultados.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = resultados[0];

    const contrasenaValida = bcrypt.compareSync(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const payload = {
      id: usuario.id,
      rol: usuario.rol,
      nombre: usuario.nombre,
    };

    if (usuario.rol === "paciente" && usuario.paciente_id) {
      payload.paciente_id = usuario.paciente_id;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        ...(usuario.rol === "paciente" && { paciente_id: usuario.paciente_id }),
      },
    });
  });
};

module.exports = { login };
