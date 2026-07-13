import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const iniciarSesion = async () => {
    if (!correo || !contrasena) {
      alert("Por favor ingresa tu correo y contraseña");
      return;
    }

    try {
      const respuesta = await fetch(
        "https://centro-medico-donda-production.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contrasena }),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.error);
        return;
      }

      await AsyncStorage.setItem("token", datos.token);
      await AsyncStorage.setItem("usuario", JSON.stringify(datos.usuario));

      navigation.navigate("Main", {
        token: datos.token,
        usuario: datos.usuario,
      });
    } catch (error) {
      alert("Error al conectar con el servidor. Verifica tu conexión.");
      console.log(error);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.cabecera}>
        <View style={estilos.logo}>
          <Text style={estilos.logoTexto}>+</Text>
        </View>
        <Text style={estilos.titulo}>Centro Médico DONDA</Text>
        <Text style={estilos.subtitulo}>Sistema de gestión en salud</Text>
      </View>

      <View style={estilos.tarjeta}>
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

        <Text style={estilos.etiqueta}>CONTRASEÑA</Text>
        <TextInput
          style={estilos.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />

        <TouchableOpacity style={estilos.boton} onPress={iniciarSesion}>
          <Text style={estilos.botonTexto}>Ingresar al sistema</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F4F6F8" },
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
  logoTexto: { fontSize: 28, color: "#fff" },
  titulo: { fontSize: 20, fontWeight: "600", color: "#fff" },
  subtitulo: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  tarjeta: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingTop: 32,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C757D",
    marginBottom: 6,
    marginTop: 16,
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
    marginTop: 28,
  },
  botonTexto: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
