import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

export default function App() {
  const [rolActivo, setRolActivo] = useState("Paciente");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      {/* CABECERA VERDE */}
      <View style={estilos.cabecera}>
        <View style={estilos.logo}>
          <Text style={estilos.logoTexto}>+</Text>
        </View>
        <Text style={estilos.titulo}>Centro Médico DONDA</Text>
        <Text style={estilos.subtitulo}>Sistema de gestión en salud</Text>
      </View>

      {/* TARJETA BLANCA */}
      <View style={estilos.tarjeta}>
        {/* SELECTOR DE ROL */}
        <View style={estilos.roles}>
          {["Paciente", "Médico", "Admin"].map((rol) => (
            <TouchableOpacity
              key={rol}
              style={[estilos.rol, rolActivo === rol && estilos.rolActivo]}
              onPress={() => setRolActivo(rol)}
            >
              <Text
                style={[
                  estilos.rolTexto,
                  rolActivo === rol && estilos.rolTextoActivo,
                ]}
              >
                {rol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CAMPO CORREO */}
        <Text style={estilos.etiqueta}>CORREO ELECTRÓNICO</Text>
        <TextInput
          style={estilos.input}
          placeholder="tucorreo@ejemplo.com"
          placeholderTextColor="#999"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* CAMPO CONTRASEÑA */}
        <Text style={estilos.etiqueta}>CONTRASEÑA</Text>
        <TextInput
          style={estilos.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />

        {/* BOTÓN INGRESAR */}
        <TouchableOpacity style={estilos.boton}>
          <Text style={estilos.botonTexto}>Ingresar al sistema</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  cabecera: {
    backgroundColor: "#0F6E56",
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: "center",
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoTexto: {
    fontSize: 28,
    color: "#fff",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  subtitulo: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  roles: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  rol: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
    borderRadius: 10,
    alignItems: "center",
  },
  rolActivo: {
    borderColor: "#0F6E56",
    backgroundColor: "#E1F5EE",
  },
  rolTexto: {
    fontSize: 12,
    color: "#6C757D",
  },
  rolTextoActivo: {
    color: "#085041",
    fontWeight: "600",
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C757D",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#F4F6F8",
    color: "#1A1A2E",
  },
  boton: {
    backgroundColor: "#0F6E56",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
