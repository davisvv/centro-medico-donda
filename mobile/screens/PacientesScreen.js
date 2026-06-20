import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";

export default function PacientesScreen({ route }) {
  const { token } = route.params;
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      const respuesta = await fetch("http://192.168.1.79:3000/api/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const datos = await respuesta.json();
      setPacientes(datos);
    } catch (error) {
      console.log("Error cargando pacientes:", error);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
        <Text style={estilos.titulo}>Pacientes</Text>
        <Text style={estilos.subtitulo}>{pacientes.length} registrados</Text>
      </View>

      <View style={estilos.contenido}>
        <View style={estilos.buscadorContenedor}>
          <TextInput
            style={estilos.buscador}
            placeholder="Buscar paciente..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {pacientesFiltrados.length === 0 && (
            <Text style={estilos.vacio}>No se encontraron pacientes</Text>
          )}

          {pacientesFiltrados.map((paciente) => (
            <View key={paciente.id} style={estilos.card}>
              <View style={estilos.avatar}>
                <Text style={estilos.avatarTexto}>{iniciales(paciente.nombre)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombre}>{paciente.nombre}</Text>
                <Text style={estilos.info}>
                  {paciente.correo}
                </Text>
                {paciente.telefono ? (
                  <Text style={estilos.info}>{paciente.telefono}</Text>
                ) : null}
              </View>
              {paciente.tipo ? (
                <View style={estilos.badge}>
                  <Text style={estilos.badgeTexto}>{paciente.tipo}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>
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
  contenido: { flex: 1, padding: 20 },
  buscadorContenedor: { marginBottom: 16 },
  buscador: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1A1A2E",
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
  },
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
  info: { fontSize: 12, color: "#6C757D", marginTop: 2 },
  badge: {
    backgroundColor: "#E1F5EE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeTexto: { fontSize: 11, fontWeight: "600", color: "#085041" },
});
