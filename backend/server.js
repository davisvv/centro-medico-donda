// server.js — Punto de entrada del servidor
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Inicializar Express
const app = express();

// ── MIDDLEWARES GLOBALES ──
app.use(cors()); // Permite que el frontend se comunique con el backend
app.use(express.json()); // Permite recibir datos en formato JSON

// ── RUTA DE PRUEBA ──
app.get("/", (req, res) => {
  res.json({
    mensaje: "✅ Servidor Centro Médico DONDA funcionando",
    version: "1.0.0",
  });
});

// ── INICIAR SERVIDOR ──
const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PUERTO}`);
});
