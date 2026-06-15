// src/controllers/pacientesController.js
const db = require("../config/database");

// ── OBTENER TODOS LOS PACIENTES ──
const obtenerPacientes = (req, res) => {
  const sql = "SELECT * FROM pacientes ORDER BY nombre ASC";
  db.query(sql, (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: "Error al obtener pacientes" });
    }
    res.json(resultados);
  });
};

// ── OBTENER UN PACIENTE POR ID ──
const obtenerPaciente = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM pacientes WHERE id = ?";
  db.query(sql, [id], (error, resultados) => {
    if (error) {
      return res.status(500).json({ error: "Error al obtener paciente" });
    }
    if (resultados.length === 0) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }
    res.json(resultados[0]);
  });
};

// ── CREAR PACIENTE ──
const crearPaciente = (req, res) => {
  const { nombre, cedula, correo, telefono, edad, sexo, eps, sangre } =
    req.body;

  if (!nombre || !cedula) {
    return res.status(400).json({ error: "Nombre y cédula son obligatorios" });
  }

  const sql = `INSERT INTO pacientes 
    (nombre, cedula, correo, telefono, edad, sexo, eps, sangre) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [nombre, cedula, correo, telefono, edad, sexo, eps, sangre],
    (error, resultado) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ error: "Ya existe un paciente con esa cédula" });
        }
        return res.status(500).json({ error: "Error al crear paciente" });
      }
      res.status(201).json({
        mensaje: "Paciente creado exitosamente",
        id: resultado.insertId,
      });
    },
  );
};

// ── ACTUALIZAR PACIENTE ──
const actualizarPaciente = (req, res) => {
  const { id } = req.params;
  const { nombre, correo, telefono, edad, sexo, eps, sangre } = req.body;

  const sql = `UPDATE pacientes SET 
    nombre=?, correo=?, telefono=?, edad=?, sexo=?, eps=?, sangre=?
    WHERE id=?`;

  db.query(
    sql,
    [nombre, correo, telefono, edad, sexo, eps, sangre, id],
    (error, resultado) => {
      if (error) {
        return res.status(500).json({ error: "Error al actualizar paciente" });
      }
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "Paciente no encontrado" });
      }
      res.json({ mensaje: "Paciente actualizado exitosamente" });
    },
  );
};

module.exports = {
  obtenerPacientes,
  obtenerPaciente,
  crearPaciente,
  actualizarPaciente,
};
