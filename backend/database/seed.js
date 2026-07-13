const bcrypt = require("bcryptjs");

async function seed(connection) {
  console.log("\n🌱 Ejecutando seed de datos de prueba...");

  const hash = (pass) => bcrypt.hashSync(pass, 10);

  // ── Paciente de prueba ───────────────────────────────────────
  await connection.query(`
    INSERT IGNORE INTO pacientes
      (nombre, cedula, correo, telefono, edad, sexo, eps, sangre)
    VALUES
      ('María García', '1098765432', 'maria@gmail.com', '3151234567', 30, 'Femenino', 'Sura', 'A+')
  `);

  const [[{ id: pacienteId }]] = await connection.query(
    "SELECT id FROM pacientes WHERE cedula = '1098765432'"
  );

  // ── Usuarios ─────────────────────────────────────────────────
  await connection.query(
    `INSERT IGNORE INTO usuarios
      (nombre, correo, contrasena, rol, especialidad, paciente_id)
    VALUES
      (?, ?, ?, 'admin',         NULL,               NULL),
      (?, ?, ?, 'medico',        'Medicina General', NULL),
      (?, ?, ?, 'recepcionista', NULL,               NULL),
      (?, ?, ?, 'paciente',      NULL,               ?)`,
    [
      "Admin DONDA",       "admin@donda.com",    hash("donda2025"),
      "Dr. Alejandro Pérez","a.perez@donda.com", hash("donda2025"),
      "Ana Recepción",     "recepcion@donda.com",hash("recep2025"),
      "María García",      "maria@gmail.com",    hash("paciente2025"), pacienteId,
    ]
  );

  // ── Citas de hoy ─────────────────────────────────────────────
  const [[{ id: medicoId }]] = await connection.query(
    "SELECT id FROM usuarios WHERE correo = 'a.perez@donda.com'"
  );

  await connection.query(
    `INSERT IGNORE INTO citas
      (paciente_id, medico_id, fecha_hora, tipo, consultorio, estado)
    VALUES
      (?, ?, CONCAT(CURDATE(), ' 09:00:00'), 'Consulta general', 'Consultorio 1', 'Pendiente'),
      (?, ?, CONCAT(CURDATE(), ' 11:00:00'), 'Control',          'Consultorio 1', 'Confirmada')`,
    [
      pacienteId, medicoId,
      pacienteId, medicoId,
    ]
  );

  console.log("✅ Seed completado exitosamente\n");
  console.log("─────────────────────────────────────────");
  console.log("  CREDENCIALES DE PRUEBA");
  console.log("─────────────────────────────────────────");
  console.log("  admin@donda.com       /  donda2025");
  console.log("  a.perez@donda.com     /  donda2025");
  console.log("  recepcion@donda.com   /  recep2025");
  console.log("  maria@gmail.com       /  paciente2025");
  console.log("─────────────────────────────────────────\n");
}

module.exports = { seed };
