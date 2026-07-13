/**
 * migrate.js — Inicializa el esquema de la base de datos
 *
 * Uso:
 *   node database/migrate.js           → solo schema
 *   node database/migrate.js --seed    → schema + datos de prueba
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mysql = require("mysql2/promise");
const fs    = require("fs");
const path  = require("path");

const config = {
  host:               process.env.DB_HOST,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  port:               process.env.DB_PORT || 3306,
  multipleStatements: true,
};

async function migrate() {
  console.log("\n🚀 Centro Médico DONDA — Migración de base de datos");
  console.log(`   Host: ${config.host}:${config.port} / DB: ${config.database}\n`);

  const connection = await mysql.createConnection(config);
  console.log("✅ Conexión establecida");

  try {
    // ── Aplicar schema ──────────────────────────────────────────
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema     = fs.readFileSync(schemaPath, "utf8");

    await connection.query(schema);
    console.log("✅ Schema aplicado (tablas creadas o ya existentes)");

    // ── Seed opcional ───────────────────────────────────────────
    if (process.argv.includes("--seed")) {
      const { seed } = require("./seed");
      await seed(connection);
    }

    console.log("✅ Migración completada\n");
  } catch (err) {
    console.error("\n❌ Error durante la migración:");
    console.error(`   ${err.message}\n`);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
