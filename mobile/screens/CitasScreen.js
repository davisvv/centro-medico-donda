import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfirmModal from "../components/ConfirmModal";
import ErrorMessage from "../components/ErrorMessage";

const API        = "https://centro-medico-donda-production.up.railway.app";
const PUEDE_CREAR = ["admin", "recepcionista"];
const FORM_VACIO  = {
  paciente_id: null, paciente_nombre: "",
  medico_id:   null, medico_nombre:   "",
  fecha_hora: "", tipo: "", consultorio: "",
};

export default function CitasScreen({ route }) {
  const { token, usuario } = route.params;

  // ── Estado principal ─────────────────────────────────────────
  const [citas, setCitas]                 = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [error, setError]                 = useState("");
  const [procesando, setProcesando]       = useState({});
  const [errorAccion, setErrorAccion]     = useState("");
  const [mensajeExito, setMensajeExito]   = useState("");
  const [modalCancelar, setModalCancelar] = useState({ visible: false, citaId: null });

  // ── Estado del formulario de nueva cita ──────────────────────
  const [modalCrear, setModalCrear]         = useState(false);
  const [selectorAbierto, setSelectorAbierto] = useState(null); // "paciente" | "medico"
  const [listaPacientes, setListaPacientes] = useState([]);
  const [listaMedicos, setListaMedicos]     = useState([]);
  const [cargandoListas, setCargandoListas] = useState(false);
  const [form, setForm]                     = useState(FORM_VACIO);
  const [guardando, setGuardando]           = useState(false);
  const [errorModal, setErrorModal]         = useState("");

  useEffect(() => { cargarCitas(); }, []);

  // ── Carga de citas ───────────────────────────────────────────
  const cargarCitas = async (silencioso = false) => {
    if (!silencioso) { setCargando(true); setError(""); }
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch(`${API}/api/citas/hoy`, {
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

  // ── Banners de feedback ──────────────────────────────────────
  const mostrarExito = (texto) => {
    setMensajeExito(texto);
    setTimeout(() => setMensajeExito(""), 2000);
  };
  const mostrarErrorAccion = (msg) => {
    setErrorAccion(msg);
    setTimeout(() => setErrorAccion(""), 3000);
  };

  // ── Actualizar estado de cita existente ──────────────────────
  const actualizarEstado = async (id, estado) => {
    setProcesando((prev) => ({ ...prev, [id]: estado }));
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch(`${API}/api/citas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      setProcesando((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const confirmarCancelacion = (id) => setModalCancelar({ visible: true, citaId: id });

  // ── Abrir modal de nueva cita ────────────────────────────────
  const abrirModal = async () => {
    setForm(FORM_VACIO);
    setErrorModal("");
    setModalCrear(true);
    setCargandoListas(true);
    try {
      const [respPac, respMed] = await Promise.all([
        fetch(`${API}/api/pacientes`,        { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/usuarios/medicos`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [pacs, meds] = await Promise.all([respPac.json(), respMed.json()]);
      setListaPacientes(Array.isArray(pacs) ? pacs : []);
      setListaMedicos(Array.isArray(meds) ? meds : []);
    } catch (e) {
      setErrorModal("No se pudieron cargar pacientes o médicos. Verifica tu conexión.");
    } finally {
      setCargandoListas(false);
    }
  };

  const cerrarModal = () => { if (!guardando) setModalCrear(false); };
  const setField    = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // ── Crear nueva cita ─────────────────────────────────────────
  const crearCita = async () => {
    if (!form.paciente_id || !form.medico_id || !form.fecha_hora.trim()) {
      setErrorModal("Paciente, médico y fecha/hora son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorModal("");
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch(`${API}/api/citas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paciente_id:  form.paciente_id,
          medico_id:    form.medico_id,
          fecha_hora:   form.fecha_hora.trim(),
          tipo:         form.tipo.trim(),
          consultorio:  form.consultorio.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setErrorModal(datos.error || "No se pudo crear la cita.");
        return;
      }
      setModalCrear(false);
      mostrarExito("Cita creada exitosamente");
      await cargarCitas(true);
    } catch (e) {
      clearTimeout(timeoutId);
      setErrorModal(
        e.name === "AbortError"
          ? "El servidor no responde. Verifica tu conexión."
          : "Error de conexión con el servidor."
      );
    } finally {
      setGuardando(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const iniciales      = (n) => n.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const confirmadas    = citas.filter((c) => c.estado === "Confirmada").length;
  const subtituloTopbar = cargando ? "Cargando..."
    : error ? "Sin datos"
    : `${confirmadas} confirmadas · ${citas.length} total`;

  // ── Selector de paciente / médico (modal anidado) ────────────
  const esSelectorPaciente = selectorAbierto === "paciente";
  const listaSelector      = esSelectorPaciente ? listaPacientes : listaMedicos;

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.topbar}>
        <Text style={estilos.titulo}>Citas de hoy</Text>
        <Text style={estilos.subtitulo}>{subtituloTopbar}</Text>
      </View>

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
              const enProceso    = !!procesando[cita.id];
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
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* FAB — solo admin y recepcionista */}
      {PUEDE_CREAR.includes(usuario?.rol) && (
        <TouchableOpacity style={estilos.fab} onPress={abrirModal} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── MODAL CANCELAR (existente) ── */}
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

      {/* ── MODAL CREAR CITA ── */}
      <Modal visible={modalCrear} animationType="slide" transparent onRequestClose={cerrarModal}>
        <View style={estilos.modalFondo}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: "100%" }}>
            <View style={estilos.modalContenido}>
              <View style={estilos.modalHeader}>
                <Text style={estilos.modalTitulo}>Nueva cita</Text>
                <TouchableOpacity onPress={cerrarModal} disabled={guardando} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color="#6C757D" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {!!errorModal && (
                  <View style={estilos.errorCaja}>
                    <Ionicons name="alert-circle-outline" size={16} color="#C0392B" />
                    <Text style={estilos.errorTexto}>{errorModal}</Text>
                  </View>
                )}

                {cargandoListas ? (
                  <ActivityIndicator size="large" color="#0F6E56" style={{ marginVertical: 32 }} />
                ) : (
                  <>
                    {/* Selector de paciente */}
                    <View style={estilos.campo}>
                      <Text style={estilos.campoLabel}>PACIENTE *</Text>
                      <TouchableOpacity
                        style={estilos.selectorBtn}
                        onPress={() => setSelectorAbierto("paciente")}
                      >
                        <Text style={form.paciente_nombre ? estilos.selectorBtnTexto : estilos.selectorBtnPlaceholder}>
                          {form.paciente_nombre || "Seleccionar paciente..."}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#6C757D" />
                      </TouchableOpacity>
                    </View>

                    {/* Selector de médico */}
                    <View style={estilos.campo}>
                      <Text style={estilos.campoLabel}>MÉDICO *</Text>
                      <TouchableOpacity
                        style={estilos.selectorBtn}
                        onPress={() => setSelectorAbierto("medico")}
                      >
                        <Text style={form.medico_nombre ? estilos.selectorBtnTexto : estilos.selectorBtnPlaceholder}>
                          {form.medico_nombre || "Seleccionar médico..."}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#6C757D" />
                      </TouchableOpacity>
                    </View>

                    {/* Fecha y hora */}
                    <View style={estilos.campo}>
                      <Text style={estilos.campoLabel}>FECHA Y HORA * (YYYY-MM-DD HH:MM)</Text>
                      <TextInput
                        style={estilos.campoInput}
                        placeholder="Ej: 2026-07-14 09:00"
                        placeholderTextColor="#999"
                        value={form.fecha_hora}
                        onChangeText={(v) => setField("fecha_hora", v)}
                        keyboardType="default"
                        autoCapitalize="none"
                      />
                    </View>

                    {/* Tipo de consulta */}
                    <View style={estilos.campo}>
                      <Text style={estilos.campoLabel}>TIPO DE CONSULTA</Text>
                      <TextInput
                        style={estilos.campoInput}
                        placeholder="Ej: Consulta general, Control"
                        placeholderTextColor="#999"
                        value={form.tipo}
                        onChangeText={(v) => setField("tipo", v)}
                        autoCapitalize="sentences"
                      />
                    </View>

                    {/* Consultorio */}
                    <View style={estilos.campo}>
                      <Text style={estilos.campoLabel}>CONSULTORIO</Text>
                      <TextInput
                        style={estilos.campoInput}
                        placeholder="Ej: Consultorio 1"
                        placeholderTextColor="#999"
                        value={form.consultorio}
                        onChangeText={(v) => setField("consultorio", v)}
                        autoCapitalize="sentences"
                      />
                    </View>

                    <TouchableOpacity
                      style={[estilos.btnGuardar, guardando && { opacity: 0.7 }]}
                      onPress={crearCita}
                      disabled={guardando}
                      activeOpacity={0.85}
                    >
                      {guardando ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={estilos.btnGuardarTexto}>Guardar cita</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={{ height: 32 }} />
                  </>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── SELECTOR ANIDADO (paciente / médico) ── */}
      <Modal visible={!!selectorAbierto} animationType="slide" transparent onRequestClose={() => setSelectorAbierto(null)}>
        <View style={estilos.modalFondo}>
          <View style={estilos.modalContenido}>
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>
                {esSelectorPaciente ? "Seleccionar paciente" : "Seleccionar médico"}
              </Text>
              <TouchableOpacity onPress={() => setSelectorAbierto(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color="#6C757D" />
              </TouchableOpacity>
            </View>

            {listaSelector.length === 0 ? (
              <View style={{ alignItems: "center", padding: 32 }}>
                <Text style={{ color: "#6C757D", fontSize: 14 }}>No hay registros disponibles</Text>
              </View>
            ) : (
              <FlatList
                data={listaSelector}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 420 }}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#F4F6F8" }} />}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={estilos.selectorItem}
                    onPress={() => {
                      if (esSelectorPaciente) {
                        setField("paciente_id",     item.id);
                        setField("paciente_nombre", item.nombre);
                      } else {
                        setField("medico_id",     item.id);
                        setField("medico_nombre", item.nombre);
                      }
                      setSelectorAbierto(null);
                    }}
                  >
                    <Text style={estilos.selectorItemNombre}>{item.nombre}</Text>
                    {item.especialidad
                      ? <Text style={estilos.selectorItemSub}>{item.especialidad}</Text>
                      : null}
                    {item.cedula
                      ? <Text style={estilos.selectorItemSub}>CC {item.cedula}</Text>
                      : null}
                  </TouchableOpacity>
                )}
              />
            )}
            <View style={{ height: 20 }} />
          </View>
        </View>
      </Modal>
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

  exitoBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E1F5EE", borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16,
    marginHorizontal: 20, marginTop: 12,
  },
  exitoTexto: { fontSize: 13, color: "#085041", fontWeight: "500" },
  errorAccionBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FCEBEB", borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16,
    marginHorizontal: 20, marginTop: 12,
  },
  errorAccionTexto: { fontSize: 13, color: "#A32D2D", fontWeight: "500", flex: 1 },

  vacio:      { alignItems: "center", marginTop: 40, gap: 12 },
  vacioTexto: { fontSize: 14, color: "#6C757D", textAlign: "center" },

  card:       { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#E1F5EE", alignItems: "center", justifyContent: "center",
  },
  avatarTexto: { color: "#085041", fontWeight: "700", fontSize: 13 },
  nombre:      { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  info:        { fontSize: 12, color: "#6C757D", marginTop: 2 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeVerde:  { backgroundColor: "#E1F5EE" },
  badgeAmbar:  { backgroundColor: "#FAEEDA" },
  badgeRojo:   { backgroundColor: "#FDECEA" },
  badgeTexto:  { fontSize: 11, fontWeight: "600", color: "#085041" },
  acciones: {
    flexDirection: "row", gap: 8, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F4F6F8",
  },
  botonConfirmar:            { flex: 1, backgroundColor: "#0F6E56", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  botonDeshabilitado:        { backgroundColor: "#A8D5C2" },
  botonCancelar:             { flex: 1, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1.5, borderColor: "#DEE2E6" },
  botonCancelarDeshabilitado: { borderColor: "#F0F0F0" },
  botonTexto:                { color: "#fff", fontSize: 13, fontWeight: "600" },
  botonCancelarTexto:        { color: "#6C757D", fontSize: 13, fontWeight: "600" },

  fab: {
    position: "absolute", bottom: 28, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#0F6E56", alignItems: "center", justifyContent: "center",
    elevation: 6,
    shadowColor: "#0F6E56", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
  },

  // Modal compartido
  modalFondo:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContenido: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "92%" },
  modalHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitulo:    { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  errorCaja: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FDEDEC", borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorTexto:  { fontSize: 13, color: "#C0392B", flex: 1 },
  campo:       { marginBottom: 16 },
  campoLabel:  { fontSize: 11, fontWeight: "700", color: "#6C757D", letterSpacing: 0.5, marginBottom: 6 },
  campoInput: {
    borderWidth: 1.5, borderColor: "#DEE2E6", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: "#1A1A2E", backgroundColor: "#F4F6F8",
  },

  // Selector de paciente/médico
  selectorBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1.5, borderColor: "#DEE2E6", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, backgroundColor: "#F4F6F8",
  },
  selectorBtnTexto:       { fontSize: 14, color: "#1A1A2E", flex: 1 },
  selectorBtnPlaceholder: { fontSize: 14, color: "#999", flex: 1 },
  selectorItem:           { paddingVertical: 14, paddingHorizontal: 4 },
  selectorItemNombre:     { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  selectorItemSub:        { fontSize: 12, color: "#6C757D", marginTop: 2 },

  btnGuardar: {
    backgroundColor: "#0F6E56", borderRadius: 12,
    paddingVertical: 14, alignItems: "center", justifyContent: "center", marginTop: 8,
  },
  btnGuardarTexto: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
