const db = require("../config/database");

const obtenerMedicos = (req, res) => {
  db.query(
    "SELECT id, nombre, especialidad FROM usuarios WHERE rol = 'medico' AND activo = 1 ORDER BY nombre ASC",
    (error, resultados) => {
      if (error) return res.status(500).json({ error: "Error al obtener médicos" });
      res.json(resultados);
    }
  );
};

module.exports = { obtenerMedicos };
