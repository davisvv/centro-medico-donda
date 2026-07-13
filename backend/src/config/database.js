const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

pool.getConnection((error, connection) => {
  if (error) {
    console.error("❌ Error conectando a la base de datos:", error);
    return;
  }
  console.log("✅ Pool MySQL conectado correctamente");
  connection.release();
});

module.exports = pool;
