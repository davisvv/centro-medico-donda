import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ErrorMessage from "../components/ErrorMessage";

function saludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardScreen({ route, navigation }) {
  const { token, usuario } = route.params;
  const [citasHoy, setCitasHoy]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => { cargarCitas(); }, []);

  const cargarCitas = async () => {
    setCargando(true);
    setError("");
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch("http://192.168.1.79:3000/api/citas/hoy", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const datos = await respuesta.json();
      setCitasHoy(datos);
    } catch (e) {
      clearTimeout(timeoutId);
      setError(
        e.name === "AbortError"
          ? "El servidor no responde. Verifica tu conexión."
          : "No se pudo cargar las citas. Verifica tu conexión."
      );
    } finally {
      setCargando(false);
    }
  };

  const subtituloTopbar = cargando
    ? "Cargando..."
    : error
    ? "Sin datos"
    : `${citasHoy.length} citas para hoy`;

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.topbar}>
        <Text style={estilos.saludo}>{saludo()}, {usuario.nombre}</Text>
        <Text style={estilos.fecha}>{subtituloTopbar}</Text>
      </View>

      {cargando ? (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color="#0F6E56" />
        </View>
      ) : error ? (
        <ScrollView contentContainerStyle={estilos.contenidoError}>
          <ErrorMessage mensaje={error} onReintentar={cargarCitas} />
        </ScrollView>
      ) : (
        <ScrollView style={estilos.contenido}>
          {/* ESTADÍSTICA PRINCIPAL */}
          <View style={estilos.statCard}>
            <Text style={estilos.statNum}>{citasHoy.length}</Text>
            <Text style={estilos.statLabel}>Citas hoy</Text>
          </View>

          {/* ACCESO RÁPIDO */}
          <Text style={estilos.seccionTitulo}>Acceso rápido</Text>
          <TouchableOpacity
            style={estilos.accesoCard}
            onPress={() => navigation.navigate("Autorizaciones", { token, usuario })}
          >
            <View style={estilos.accesoIcono}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#0F6E56" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.accesoTitulo}>Autorizaciones</Text>
              <Text style={estilos.accesoSub}>Revisar solicitudes pendientes</Text>
            </View>
            <Text style={estilos.accesoFlecha}>›</Text>
          </TouchableOpacity>

          {/* LISTA DE CITAS */}
          <Text style={estilos.seccionTitulo}>Citas de hoy</Text>

          {citasHoy.length === 0 ? (
            <View style={estilos.vacio}>
              <Ionicons name="calendar-outline" size={40} color="#CED4DA" />
              <Text style={estilos.vacioTexto}>Sin citas programadas para hoy</Text>
            </View>
          ) : (
            citasHoy.map((cita) => (
              <View key={cita.id} style={estilos.citaCard}>
                <View style={estilos.citaAvatar}>
                  <Text style={estilos.citaAvatarTexto}>
                    {cita.paciente_nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.citaNombre}>{cita.paciente_nombre}</Text>
                  <Text style={estilos.citaInfo}>{cita.tipo} · {cita.consultorio}</Text>
                </View>
                <View style={[estilos.badge, cita.estado === "Confirmada" ? estilos.badgeVerde : estilos.badgeAmbar]}>
                  <Text style={estilos.badgeTexto}>{cita.estado}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  saludo: { fontSize: 18, fontWeight: "600", color: "#fff" },
  fecha:  { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  centrado: { flex: 1, alignItems: "center", justifyContent: "center" },
  contenido:      { padding: 20 },
  contenidoError: { padding: 20 },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  statNum:   { fontSize: 36, fontWeight: "700", color: "#0F6E56" },
  statLabel: { fontSize: 13, color: "#6C757D", marginTop: 4 },
  seccionTitulo: { fontSize: 15, fontWeight: "600", color: "#1A1A2E", marginBottom: 12 },
  vacio:      { alignItems: "center", marginTop: 20, gap: 12 },
  vacioTexto: { fontSize: 14, color: "#6C757D", textAlign: "center" },
  accesoCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accesoIcono: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#E1F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  accesoTitulo: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  accesoSub:    { fontSize: 12, color: "#6C757D", marginTop: 2 },
  accesoFlecha: { fontSize: 22, color: "#6C757D", fontWeight: "300" },
  citaCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  citaAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E1F5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  citaAvatarTexto: { color: "#085041", fontWeight: "700", fontSize: 13 },
  citaNombre: { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  citaInfo:   { fontSize: 12, color: "#6C757D", marginTop: 2 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeVerde:  { backgroundColor: "#E1F5EE" },
  badgeAmbar:  { backgroundColor: "#FAEEDA" },
  badgeTexto:  { fontSize: 11, fontWeight: "600", color: "#085041" },
});
