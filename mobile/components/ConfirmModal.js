import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type,
}) {
  const esDestructivo = type === "danger";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={estilos.fondo}>
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>{title}</Text>
          {message ? <Text style={estilos.mensaje}>{message}</Text> : null}

          <View style={estilos.botones}>
            <TouchableOpacity style={estilos.botonCancelar} onPress={onCancel}>
              <Text style={estilos.botonCancelarTexto}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                estilos.botonConfirmar,
                esDestructivo ? estilos.botonPeligro : estilos.botonVerde,
              ]}
              onPress={onConfirm}
            >
              <Text style={estilos.botonConfirmarTexto}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  tarjeta: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
  },
  titulo: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
    textAlign: "center",
  },
  mensaje: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  botones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  botonCancelar: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
    alignItems: "center",
  },
  botonCancelarTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6C757D",
  },
  botonConfirmar: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  botonVerde: {
    backgroundColor: "#0F6E56",
  },
  botonPeligro: {
    backgroundColor: "#C0392B",
  },
  botonConfirmarTexto: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
