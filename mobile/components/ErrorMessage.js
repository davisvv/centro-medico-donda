import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ErrorMessage({ mensaje, onReintentar }) {
  return (
    <View style={estilos.contenedor}>
      <Ionicons name="alert-circle-outline" size={36} color="#A32D2D" />
      <Text style={estilos.texto}>{mensaje}</Text>
      {onReintentar && (
        <TouchableOpacity style={estilos.boton} onPress={onReintentar} activeOpacity={0.8}>
          <Text style={estilos.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: "#FCEBEB",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  texto: {
    fontSize: 14,
    color: "#A32D2D",
    textAlign: "center",
    lineHeight: 20,
  },
  boton: {
    backgroundColor: "#A32D2D",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginTop: 4,
  },
  botonTexto: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
