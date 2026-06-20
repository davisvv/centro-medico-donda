import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PerfilScreen({ navigation, usuario }) {
  const cerrarSesion = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const iniciales = (nombre) =>
    nombre
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (!usuario) {
    return (
      <View style={estilos.contenedor}>
        <StatusBar barStyle="light-content" />
        <View style={estilos.topbar} />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.topbar}>
        <Text style={estilos.topbarTitulo}>Perfil</Text>
      </View>

      <View style={estilos.contenido}>
        <View style={estilos.avatarContenedor}>
          <View style={estilos.avatar}>
            <Text style={estilos.avatarTexto}>{iniciales(usuario.nombre)}</Text>
          </View>
          <Text style={estilos.nombre}>{usuario.nombre}</Text>
          <View style={estilos.badge}>
            <Text style={estilos.badgeTexto}>{usuario.rol}</Text>
          </View>
        </View>

        <View style={estilos.tarjeta}>
          <View style={estilos.fila}>
            <Text style={estilos.etiqueta}>CORREO</Text>
            <Text style={estilos.valor}>{usuario.correo}</Text>
          </View>
          <View style={estilos.divisor} />
          <View style={estilos.fila}>
            <Text style={estilos.etiqueta}>ROL</Text>
            <Text style={estilos.valor}>{usuario.rol}</Text>
          </View>
          {usuario.especialidad ? (
            <>
              <View style={estilos.divisor} />
              <View style={estilos.fila}>
                <Text style={estilos.etiqueta}>ESPECIALIDAD</Text>
                <Text style={estilos.valor}>{usuario.especialidad}</Text>
              </View>
            </>
          ) : null}
        </View>

        <TouchableOpacity style={estilos.botonSalir} onPress={cerrarSesion}>
          <Text style={estilos.botonSalirTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
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
  topbarTitulo: { fontSize: 22, fontWeight: "700", color: "#fff" },
  contenido: { flex: 1, padding: 20 },
  avatarContenedor: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E1F5EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarTexto: { fontSize: 28, fontWeight: "700", color: "#085041" },
  nombre: { fontSize: 20, fontWeight: "700", color: "#1A1A2E", marginBottom: 8 },
  badge: {
    backgroundColor: "#E1F5EE",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 99,
  },
  badgeTexto: { fontSize: 12, fontWeight: "600", color: "#085041" },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  fila: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divisor: { height: 1, backgroundColor: "#F4F6F8" },
  etiqueta: { fontSize: 11, fontWeight: "600", color: "#6C757D" },
  valor: { fontSize: 14, color: "#1A1A2E", fontWeight: "500" },
  botonSalir: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
  },
  botonSalirTexto: { color: "#C0392B", fontSize: 15, fontWeight: "600" },
});
