const db = require("../config/database");

// ── OBTENER TODAS LAS CITAS ──
const obtenerCitas = (req, res) => {
  const sql = `
    SELECT c.*,
      p.nombre AS paciente_nombre,
      p.cedula AS paciente_cedula,
      u.nombre AS medico_nombre
    FROM citas c
    JOIN pacientes p ON c.paciente_id = p.id
    JOIN usuarios  u ON c.medico_id   = u.id
    ORDER BY c.fecha_hora ASC
  `;
  db.query(sql, (error, resultados) => {
    if (error) return res.status(500).json({ error: "Error al obtener citas" });
    res.json(resultados);
  });
};

// ── OBTENER CITAS DE HOY (filtradas por rol) ──
const obtenerCitasHoy = (req, res) => {
  const { rol, id: usuarioId } = req.usuario;

  let sql;
  let params = [];

  if (rol === "medico") {
    sql = `
      SELECT c.*,
        p.nombre AS paciente_nombre,
        p.cedula AS paciente_cedula,
        u.nombre AS medico_nombre
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios  u ON c.medico_id   = u.id
      WHERE DATE(c.fecha_hora) = CURDATE()
        AND c.medico_id = ?
      ORDER BY c.fecha_hora ASC
    `;
    params = [usuarioId];
  } else if (rol === "paciente") {
    sql = `
      SELECT c.*,
        p.nombre AS paciente_nombre,
        p.cedula AS paciente_cedula,
        u.nombre AS medico_nombre
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios  u ON c.medico_id   = u.id
      WHERE DATE(c.fecha_hora) = CURDATE()
        AND p.correo = (SELECT correo FROM usuarios WHERE id = ?)
      ORDER BY c.fecha_hora ASC
    `;
    params = [usuarioId];
  } else {
    sql = `
      SELECT c.*,
        p.nombre AS paciente_nombre,
        p.cedula AS paciente_cedula,
        u.nombre AS medico_nombre
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios  u ON c.medico_id   = u.id
      WHERE DATE(c.fecha_hora) = CURDATE()
      ORDER BY c.fecha_hora ASC
    `;
  }

  db.query(sql, params, (error, resultados) => {
    if (error) return res.status(500).json({ error: "Error al obtener citas de hoy" });
    res.json(resultados);
  });
};

// ── CREAR CITA ──
const crearCita = (req, res) => {
  const { paciente_id, medico_id, fecha_hora, tipo, consultorio } = req.body;

  if (!paciente_id || !medico_id || !fecha_hora) {
    return res.status(400).json({ error: "Paciente, médico y fecha son obligatorios" });
  }

  const sql = `INSERT INTO citas
    (paciente_id, medico_id, fecha_hora, tipo, consultorio, estado)
    VALUES (?, ?, ?, ?, ?, 'Pendiente')`;

  db.query(sql, [paciente_id, medico_id, fecha_hora, tipo, consultorio], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al crear cita" });
    res.status(201).json({ mensaje: "Cita creada exitosamente", id: resultado.insertId });
  });
};

// ── ACTUALIZAR ESTADO DE CITA ──
const actualizarEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const { rol, id: usuarioId } = req.usuario;

  const estadosValidos = ["Confirmada", "Pendiente", "Cancelada"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  if (rol === "medico") {
    db.query("SELECT medico_id FROM citas WHERE id = ?", [id], (error, resultados) => {
      if (error) return res.status(500).json({ error: "Error al verificar cita" });
      if (resultados.length === 0) return res.status(404).json({ error: "Cita no encontrada" });
      if (resultados[0].medico_id !== usuarioId) {
        return res.status(403).json({ error: "No tienes permiso para modificar citas de otro médico" });
      }
      ejecutarActualizacion(id, estado, res);
    });
  } else {
    ejecutarActualizacion(id, estado, res);
  }
};

const ejecutarActualizacion = (id, estado, res) => {
  db.query("UPDATE citas SET estado = ? WHERE id = ?", [estado, id], (error, resultado) => {
    if (error) return res.status(500).json({ error: "Error al actualizar estado" });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Cita no encontrada" });
    res.json({ mensaje: `Cita ${estado.toLowerCase()} exitosamente` });
  });
};

module.exports = { obtenerCitas, obtenerCitasHoy, crearCita, actualizarEstado };
