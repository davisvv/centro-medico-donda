import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import ConfirmModal from "../components/ConfirmModal";

export default function CitasScreen({ route }) {
  const { token } = route.params;
  const [citas, setCitas] = useState([]);
  const [procesando, setProcesando] = useState({});
  const [modalCancelar, setModalCancelar] = useState({ visible: false, citaId: null });

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      const respuesta = await fetch("http://192.168.1.79:3000/api/citas/hoy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const datos = await respuesta.json();
      setCitas(datos);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la lista de citas. Verifica tu conexión.");
    }
  };

  const actualizarEstado = async (id, estado) => {
    setProcesando((prev) => ({ ...prev, [id]: estado }));
    try {
      const respuesta = await fetch(
        `http://192.168.1.79:3000/api/citas/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado }),
        }
      );

      if (!respuesta.ok) {
        const datos = await respuesta.json();
        Alert.alert("Error", datos.error || "No se pudo actualizar la cita.");
        return;
      }

      await cargarCitas();
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor. Verifica tu conexión.");
    } finally {
      setProcesando((prev) => {
        const nuevo = { ...prev };
        delete nuevo[id];
        return nuevo;
      });
    }
  };

  const confirmarCancelacion = (id) => {
    setModalCancelar({ visible: true, citaId: id });
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

      <ScrollView style={estilos.contenido} showsVerticalScrollIndicator={false}>
        {citas.length === 0 && (
          <Text style={estilos.vacio}>No hay citas para hoy</Text>
        )}

        {citas.map((cita) => {
          const enProceso = !!procesando[cita.id];
          const accionActual = procesando[cita.id];

          return (
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

              {cita.estado === "Pendiente" && (
                <View style={estilos.acciones}>
                  <TouchableOpacity
                    style={[
                      estilos.botonConfirmar,
                      enProceso && estilos.botonDeshabilitado,
                    ]}
                    onPress={() => actualizarEstado(cita.id, "Confirmada")}
                    disabled={enProceso}
                  >
                    <Text style={estilos.botonTexto}>
                      {accionActual === "Confirmada" ? "Confirmando..." : "Confirmar"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      estilos.botonCancelar,
                      enProceso && estilos.botonCancelarDeshabilitado,
                    ]}
                    onPress={() => confirmarCancelacion(cita.id)}
                    disabled={enProceso}
                  >
                    <Text style={estilos.botonCancelarTexto}>
                      {accionActual === "Cancelada" ? "Cancelando..." : "Cancelar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {cita.estado === "Confirmada" && (
                <View style={estilos.acciones}>
                  <TouchableOpacity
                    style={[
                      estilos.botonCancelar,
                      enProceso && estilos.botonCancelarDeshabilitado,
                    ]}
                    onPress={() => confirmarCancelacion(cita.id)}
                    disabled={enProceso}
                  >
                    <Text style={estilos.botonCancelarTexto}>
                      {accionActual === "Cancelada" ? "Cancelando..." : "Cancelar cita"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <ConfirmModal
        visible={modalCancelar.visible}
        title="Cancelar cita"
        message="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="Volver"
        type="danger"
        onCancel={() => setModalCancelar({ visible: false, citaId: null })}
        onConfirm={() => {
          const id = modalCancelar.citaId;
          setModalCancelar({ visible: false, citaId: null });
          actualizarEstado(id, "Cancelada");
        }}
      />
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
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  botonDeshabilitado: {
    backgroundColor: "#A8D5C2",
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
  },
  botonCancelarDeshabilitado: {
    borderColor: "#F0F0F0",
  },
  botonTexto: { color: "#fff", fontSize: 13, fontWeight: "600" },
  botonCancelarTexto: { color: "#6C757D", fontSize: 13, fontWeight: "600" },
});
