import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";

export default function AutorizacionesScreen({ route }) {
  const { token, usuario } = route.params;
  const esPaciente = usuario?.rol === "paciente";
  const [autorizaciones, setAutorizaciones] = useState([]);

  useEffect(() => {
    cargarAutorizaciones();
  }, []);

  const cargarAutorizaciones = async () => {
    try {
      const respuesta = await fetch(
        "http://192.168.1.79:3000/api/autorizaciones",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const datos = await respuesta.json();
      setAutorizaciones(datos);
    } catch (error) {
      console.log("Error cargando autorizaciones:", error);
    }
  };

  const pendientes = autorizaciones.filter(
    (a) => a.estado === "Pendiente"
  ).length;

  const badgeEstilo = (estado) => {
    if (estado === "Aprobada") return estilos.badgeVerde;
    if (estado === "Rechazada") return estilos.badgeRojo;
    if (estado === "En revisión") return estilos.badgeAzul;
    return estilos.badgeAmbar;
  };

  const iniciales = (nombre) =>
    nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.topbar}>
        <Text style={estilos.titulo}>Autorizaciones</Text>
        <Text style={estilos.subtitulo}>
          {pendientes} pendientes · {autorizaciones.length} total
        </Text>
      </View>

      <ScrollView style={estilos.contenido}>
        {autorizaciones.length === 0 && (
          <Text style={estilos.vacio}>No hay autorizaciones</Text>
        )}

        {autorizaciones.map((item) => (
          <View key={item.id} style={estilos.card}>
            {!esPaciente && (
              <View style={estilos.avatar}>
                <Text style={estilos.avatarTexto}>
                  {iniciales(item.paciente_nombre)}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              {!esPaciente && (
                <Text style={estilos.nombre}>{item.paciente_nombre}</Text>
              )}
              <Text style={estilos.procedimiento}>{item.procedimiento}</Text>
              {!esPaciente && item.medico_nombre ? (
                <Text style={estilos.info}>Dr. {item.medico_nombre}</Text>
              ) : null}
              {esPaciente && item.eps ? (
                <Text style={estilos.info}>{item.eps}</Text>
              ) : null}
            </View>
            <View style={[estilos.badge, badgeEstilo(item.estado)]}>
              <Text style={estilos.badgeTexto}>{item.estado}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6F8" },
  topbar: {
    backgroundColor: "#0F6E56",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titulo: { fontSize: 22, fontWeight: "700", color: "#fff" },
  subtitulo: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  contenido: { padding: 20 },
  vacio: { fontSize: 14, color: "#6C757D", textAlign: "center", marginTop: 30 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E1F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: "#085041", fontWeight: "700", fontSize: 13 },
  nombre: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  procedimiento: { fontSize: 13, color: "#1A1A2E", marginTop: 2 },
  info: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeVerde: { backgroundColor: "#E1F5EE" },
  badgeAmbar: { backgroundColor: "#FAEEDA" },
  badgeRojo: { backgroundColor: "#FDECEA" },
  badgeAzul: { backgroundColor: "#E8F0FE" },
  badgeTexto: { fontSize: 11, fontWeight: "600", color: "#085041" },
});
