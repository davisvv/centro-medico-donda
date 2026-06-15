// src/controllers/autorizacionesControllers.js
const db = require("../config/database");

// ── OBTENER TODAS LAS AUTORIZACIONES ──
const obtenerAutorizaciones = (req, res) => {
  const sql = `
    SELECT a.*,
      p.nombre AS paciente_nombre,
      p.cedula AS paciente_cedula,
      u.nombre AS medico_nombre
    FROM autorizaciones a
    JOIN pacientes p ON a.paciente_id = p.id
    JOIN usuarios  u ON a.medico_id   = u.id
    ORDER BY a.creado_en DESC
  `;
  db.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: "Error al obtener autorizaciones" });
    }
    res.json(resultados);
  });
};

// ── CREAR AUTORIZACIÓN ──
const crearAutorizacion = (req, res) => {
  const { paciente_id, medico_id, tipo, procedimiento, eps, observaciones } =
    req.body;

  if (!paciente_id || !medico_id || !tipo || !procedimiento) {
    return res
      .status(400)
      .json({
        error: "Paciente, médico, tipo y procedimiento son obligatorios",
      });
  }

  // Generar número de autorización automático
  const numero = `AUT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const sql = `INSERT INTO autorizaciones 
    (paciente_id, medico_id, numero, tipo, procedimiento, eps, observaciones, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')`;

  db.query(
    sql,
    [paciente_id, medico_id, numero, tipo, procedimiento, eps, observaciones],
    (error, resultado) => {
      if (error) {
        return res.status(500).json({ error: "Error al crear autorización" });
      }
      res.status(201).json({
        mensaje: "Autorización creada exitosamente",
        id: resultado.insertId,
        numero,
      });
    },
  );
};

// ── ACTUALIZAR ESTADO ──
const actualizarEstado = (req, res) => {
  const { id } = req.params;
  const { estado, observaciones } = req.body;

  const estadosValidos = ["Pendiente", "En revisión", "Aprobada", "Rechazada"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  const sql =
    "UPDATE autorizaciones SET estado = ?, observaciones = ? WHERE id = ?";
  db.query(sql, [estado, observaciones, id], (error, resultado) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Error al actualizar autorización" });
    }
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Autorización no encontrada" });
    }
    res.json({ mensaje: `Autorización ${estado.toLowerCase()} exitosamente` });
  });
};

module.exports = { obtenerAutorizaciones, crearAutorizacion, actualizarEstado };
