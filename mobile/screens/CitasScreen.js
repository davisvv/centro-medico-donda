import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

export default function CitasScreen({ route }) {
  const { token } = route.params;
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const respuesta = await fetch("http://192.168.253.2:3000/api/citas/hoy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const datos = await respuesta.json();
      setCitas(datos);
    } catch (error) {
      console.log("Error cargando citas:", error);
    }
  };

  const actualizarEstado = async (id, estado) => {
    try {
      const respuesta = await fetch(
        `http://192.168.253.2:3000/api/citas/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado }),
        }
      );
      if (respuesta.ok) {
        setCitas((prev) =>
          prev.map((c) => (c.id === id ? { ...c, estado } : c))
        );
      }
    } catch (error) {
      console.log("Error actualizando cita:", error);
    }
  };

  const iniciales = (nombre) =>
    nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const confirmadas = citas.filter((c) => c.estado === "Confirmada").length;

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.topbar}>
        <Text style={estilos.titulo}>Citas de hoy</Text>
        <Text style={estilos.subtitulo}>
          {confirmadas} confirmadas · {citas.length} total
        </Text>
      </View>

      <ScrollView style={estilos.contenido}>
        {citas.length === 0 && (
          <Text style={estilos.vacio}>No hay citas para hoy</Text>
        )}

        {citas.map((cita) => (
          <View key={cita.id} style={estilos.card}>
            <View style={estilos.cardHeader}>
              <View style={estilos.avatar}>
                <Text style={estilos.avatarTexto}>
                  {iniciales(cita.paciente_nombre)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombre}>{cita.paciente_nombre}</Text>
                <Text style={estilos.info}>
                  {cita.tipo} · {cita.consultorio}
                </Text>
              </View>
              <View
                style={[
                  estilos.badge,
                  cita.estado === "Confirmada"
                    ? estilos.badgeVerde
                    : cita.estado === "Cancelada"
                    ? estilos.badgeRojo
                    : estilos.badgeAmbar,
                ]}
              >
                <Text style={estilos.badgeTexto}>{cita.estado}</Text>
              </View>
            </View>

            {cita.estado !== "Cancelada" && (
              <View style={estilos.acciones}>
                {cita.estado !== "Confirmada" && (
                  <TouchableOpacity
                    style={estilos.botonConfirmar}
                    onPress={() => actualizarEstado(cita.id, "Confirmada")}
                  >
                    <Text style={estilos.botonTexto}>Confirmar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={estilos.botonCancelar}
                  onPress={() => actualizarEstado(cita.id, "Cancelada")}
                >
                  <Text style={estilos.botonCancelarTexto}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
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
  },
  cardHeader: {
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
  info: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeVerde: { backgroundColor: "#E1F5EE" },
  badgeAmbar: { backgroundColor: "#FAEEDA" },
  badgeRojo: { backgroundColor: "#FDECEA" },
  badgeTexto: { fontSize: 11, fontWeight: "600", color: "#085041" },
  acciones: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F4F6F8",
  },
  botonConfirmar: {
    flex: 1,
    backgroundColor: "#0F6E56",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
  },
  botonTexto: { color: "#fff", fontSize: 13, fontWeight: "600" },
  botonCancelarTexto: { color: "#6C757D", fontSize: 13, fontWeight: "600" },
});
