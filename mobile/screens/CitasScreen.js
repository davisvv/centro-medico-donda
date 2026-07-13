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
import ConfirmModal from "../components/ConfirmModal";
import ErrorMessage from "../components/ErrorMessage";

export default function CitasScreen({ route }) {
  const { token } = route.params;
  const [citas, setCitas]               = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState("");
  const [procesando, setProcesando]     = useState({});
  const [errorAccion, setErrorAccion]   = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [modalCancelar, setModalCancelar] = useState({ visible: false, citaId: null });

  useEffect(() => { cargarCitas(); }, []);

  const cargarCitas = async (silencioso = false) => {
    if (!silencioso) { setCargando(true); setError(""); }
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch("https://centro-medico-donda-production.up.railway.app/api/citas/hoy", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const datos = await respuesta.json();
      setCitas(datos);
    } catch (e) {
      clearTimeout(timeoutId);
      if (!silencioso) {
        setError(
          e.name === "AbortError"
            ? "El servidor no responde. Verifica tu conexión."
            : "No se pudo cargar las citas. Verifica tu conexión."
        );
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  };

  const mostrarExito = (texto) => {
    setMensajeExito(texto);
    setTimeout(() => setMensajeExito(""), 2000);
  };

  const mostrarErrorAccion = (msg) => {
    setErrorAccion(msg);
    setTimeout(() => setErrorAccion(""), 3000);
  };

  const actualizarEstado = async (id, estado) => {
    setProcesando((prev) => ({ ...prev, [id]: estado }));
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch(`https://centro-medico-donda-production.up.railway.app/api/citas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!respuesta.ok) {
        const datos = await respuesta.json();
        mostrarErrorAccion(datos.error || "No se pudo actualizar la cita.");
        return;
      }

      mostrarExito(estado === "Confirmada" ? "Cita confirmada exitosamente" : "Cita cancelada");
      await cargarCitas(true);
    } catch (e) {
      clearTimeout(timeoutId);
      mostrarErrorAccion(
        e.name === "AbortError"
          ? "El servidor no responde. Verifica tu conexión."
          : "No se pudo conectar con el servidor."
      );
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
    nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const confirmadas = citas.filter((c) => c.estado === "Confirmada").length;

  const subtituloTopbar = cargando
    ? "Cargando..."
    : error
    ? "Sin datos"
    : `${confirmadas} confirmadas · ${citas.length} total`;

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.topbar}>
        <Text style={estilos.titulo}>Citas de hoy</Text>
        <Text style={estilos.subtitulo}>{subtituloTopbar}</Text>
      </View>

      {/* Banners de acción — visibles sobre el contenido */}
      {!!mensajeExito && (
        <View style={estilos.exitoBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#085041" />
          <Text style={estilos.exitoTexto}>{mensajeExito}</Text>
        </View>
      )}
      {!!errorAccion && (
        <View style={estilos.errorAccionBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#A32D2D" />
          <Text style={estilos.errorAccionTexto}>{errorAccion}</Text>
        </View>
      )}

      {cargando ? (
        <View style={estilos.centrado}>
          <ActivityIndicator size="large" color="#0F6E56" />
        </View>
      ) : error ? (
        <View style={estilos.contenido}>
          <ErrorMessage mensaje={error} onReintentar={cargarCitas} />
        </View>
      ) : (
        <ScrollView style={estilos.contenido} showsVerticalScrollIndicator={false}>
          {citas.length === 0 ? (
            <View style={estilos.vacio}>
              <Ionicons name="calendar-outline" size={40} color="#CED4DA" />
              <Text style={estilos.vacioTexto}>No hay citas programadas para hoy</Text>
            </View>
          ) : (
            citas.map((cita) => {
              const enProceso   = !!procesando[cita.id];
              const accionActual = procesando[cita.id];

              return (
                <View key={cita.id} style={estilos.card}>
                  <View style={estilos.cardHeader}>
                    <View style={estilos.avatar}>
                      <Text style={estilos.avatarTexto}>{iniciales(cita.paciente_nombre)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilos.nombre}>{cita.paciente_nombre}</Text>
                      <Text style={estilos.info}>{cita.tipo} · {cita.consultorio}</Text>
                    </View>
                    <View style={[
                      estilos.badge,
                      cita.estado === "Confirmada" ? estilos.badgeVerde
                      : cita.estado === "Cancelada" ? estilos.badgeRojo
                      : estilos.badgeAmbar,
                    ]}>
                      <Text style={estilos.badgeTexto}>{cita.estado}</Text>
                    </View>
                  </View>

                  {cita.estado === "Pendiente" && (
                    <View style={estilos.acciones}>
                      <TouchableOpacity
                        style={[estilos.botonConfirmar, enProceso && estilos.botonDeshabilitado]}
                        onPress={() => actualizarEstado(cita.id, "Confirmada")}
                        disabled={enProceso}
                      >
                        <Text style={estilos.botonTexto}>
                          {accionActual === "Confirmada" ? "Confirmando..." : "Confirmar"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[estilos.botonCancelar, enProceso && estilos.botonCancelarDeshabilitado]}
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
                        style={[estilos.botonCancelar, enProceso && estilos.botonCancelarDeshabilitado]}
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
            })
          )}
        </ScrollView>
      )}

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
  titulo:    { fontSize: 22, fontWeight: "700", color: "#fff" },
  subtitulo: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 },
  centrado:  { flex: 1, alignItems: "center", justifyContent: "center" },
  contenido: { padding: 20 },

  // Banners
  exitoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E1F5EE",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
  },
  exitoTexto: { fontSize: 13, color: "#085041", fontWeight: "500" },
  errorAccionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FCEBEB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 12,
  },
  errorAccionTexto: { fontSize: 13, color: "#A32D2D", fontWeight: "500", flex: 1 },

  // Empty state
  vacio:      { alignItems: "center", marginTop: 40, gap: 12 },
  vacioTexto: { fontSize: 14, color: "#6C757D", textAlign: "center" },

  // Cards
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  info:   { fontSize: 12, color: "#6C757D", marginTop: 2 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeVerde:  { backgroundColor: "#E1F5EE" },
  badgeAmbar:  { backgroundColor: "#FAEEDA" },
  badgeRojo:   { backgroundColor: "#FDECEA" },
  badgeTexto:  { fontSize: 11, fontWeight: "600", color: "#085041" },
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
  botonDeshabilitado:          { backgroundColor: "#A8D5C2" },
  botonCancelar: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
  },
  botonCancelarDeshabilitado:  { borderColor: "#F0F0F0" },
  botonTexto:        { color: "#fff", fontSize: 13, fontWeight: "600" },
  botonCancelarTexto: { color: "#6C757D", fontSize: 13, fontWeight: "600" },
});
