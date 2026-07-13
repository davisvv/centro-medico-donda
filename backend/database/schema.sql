-- ============================================================
--  Centro Médico DONDA — Database Schema
--  Orden de creación: pacientes → usuarios → citas → autorizaciones
--  Ejecutar con: node database/migrate.js
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. PACIENTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacientes (
  id        INT          NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(150) NOT NULL,
  cedula    VARCHAR(20)  NOT NULL,
  correo    VARCHAR(150) NULL,
  telefono  VARCHAR(20)  NULL,
  edad      INT          NULL,
  sexo      ENUM('Masculino','Femenino') NULL,
  eps       VARCHAR(100) NULL,
  sangre    VARCHAR(5)   NULL,
  tipo      VARCHAR(50)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_paciente_cedula (cedula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. USUARIOS ───────────────────────────────────────────────
-- paciente_id vincula al usuario con rol 'paciente' a su registro en pacientes
CREATE TABLE IF NOT EXISTS usuarios (
  id           INT          NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(150) NOT NULL,
  correo       VARCHAR(150) NOT NULL,
  contrasena   VARCHAR(255) NOT NULL,
  rol          ENUM('admin','recepcionista','medico','paciente') NOT NULL,
  especialidad VARCHAR(100) NULL,
  paciente_id  INT          NULL,
  activo       TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuario_correo (correo),
  CONSTRAINT fk_usuario_paciente
    FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. CITAS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
  id          INT          NOT NULL AUTO_INCREMENT,
  paciente_id INT          NOT NULL,
  medico_id   INT          NOT NULL,
  fecha_hora  DATETIME     NOT NULL,
  tipo        VARCHAR(100) NULL,
  consultorio VARCHAR(50)  NULL,
  estado      ENUM('Pendiente','Confirmada','Cancelada') NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (id),
  CONSTRAINT fk_cita_paciente
    FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cita_medico
    FOREIGN KEY (medico_id) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. AUTORIZACIONES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS autorizaciones (
  id            INT          NOT NULL AUTO_INCREMENT,
  paciente_id   INT          NOT NULL,
  medico_id     INT          NOT NULL,
  numero        VARCHAR(30)  NOT NULL,
  tipo          VARCHAR(100) NOT NULL,
  procedimiento VARCHAR(200) NOT NULL,
  eps           VARCHAR(100) NULL,
  observaciones TEXT         NULL,
  estado        ENUM('Pendiente','En revisión','Aprobada','Rechazada') NOT NULL DEFAULT 'Pendiente',
  creado_en     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_numero (numero),
  CONSTRAINT fk_aut_paciente
    FOREIGN KEY (paciente_id) REFERENCES pacientes (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_aut_medico
    FOREIGN KEY (medico_id) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
