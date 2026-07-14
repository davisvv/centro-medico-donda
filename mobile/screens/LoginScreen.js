import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo]       = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError]         = useState("");
  const [cargando, setCargando]   = useState(false);

  const iniciarSesion = async () => {
    setError("");

    if (!correo || !contrasena) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setCargando(true);
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
        setError(datos.error || "Credenciales incorrectas.");
        return;
      }

      await AsyncStorage.setItem("token", datos.token);
      await AsyncStorage.setItem("usuario", JSON.stringify(datos.usuario));

      navigation.navigate("Main", {
        token: datos.token,
        usuario: datos.usuario,
      });
    } catch (e) {
      setError("No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setCargando(false);
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
          onChangeText={(v) => { setCorreo(v); setError(""); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={estilos.etiqueta}>CONTRASEÑA</Text>
        <TextInput
          style={estilos.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          value={contrasena}
          onChangeText={(v) => { setContrasena(v); setError(""); }}
          secureTextEntry
        />

        {error ? (
          <View style={estilos.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color="#A32D2D" />
            <Text style={estilos.errorTexto}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[estilos.boton, cargando && estilos.botonDeshabilitado]}
          onPress={iniciarSesion}
          disabled={cargando}
        >
          <Text style={estilos.botonTexto}>
            {cargando ? "Verificando..." : "Ingresar al sistema"}
          </Text>
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
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FCEBEB",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  errorTexto: { flex: 1, fontSize: 13, color: "#A32D2D", lineHeight: 18 },
  boton: {
    backgroundColor: "#0F6E56",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
