import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ErrorMessage from "../components/ErrorMessage";

const TIPOS_SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const PUEDE_CREAR  = ["admin", "recepcionista"];

const CAMPOS_TEXTO = [
  { key: "nombre",   label: "NOMBRE COMPLETO *", placeholder: "Ej: Ana López",        keyboard: "default",       capitalize: "words" },
  { key: "cedula",   label: "CÉDULA *",           placeholder: "Ej: 1234567890",       keyboard: "numeric",       capitalize: "none"  },
  { key: "correo",   label: "CORREO *",            placeholder: "correo@ejemplo.com",   keyboard: "email-address", capitalize: "none"  },
  { key: "telefono", label: "TELÉFONO",            placeholder: "Ej: 3001234567",       keyboard: "phone-pad",     capitalize: "none"  },
  { key: "edad",     label: "EDAD",                placeholder: "Ej: 32",              keyboard: "numeric",       capitalize: "none"  },
  { key: "eps",      label: "EPS",                 placeholder: "Ej: Sura, Compensar", keyboard: "default",       capitalize: "words" },
];

const FORM_VACIO = { nombre: "", cedula: "", correo: "", telefono: "", edad: "", sexo: "", eps: "", sangre: "" };

export default function PacientesScreen({ route }) {
  const { token, usuario } = route.params;
  const [pacientes, setPacientes]       = useState([]);
  const [busqueda, setBusqueda]         = useState("");
  const [cargando, setCargando]         = useState(usuario?.rol !== "paciente");
  const [error, setError]               = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando]       = useState(false);
  const [errorCrear, setErrorCrear]     = useState("");
  const [form, setForm]                 = useState(FORM_VACIO);

  useEffect(() => {
    if (usuario?.rol !== "paciente") cargarPacientes();
  }, []);

  const cargarPacientes = async (silencioso = false) => {
    if (!silencioso) { setCargando(true); setError(""); }
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch("http://192.168.1.79:3000/api/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const datos = await respuesta.json();
      setPacientes(datos);
    } catch (e) {
      clearTimeout(timeoutId);
      if (!silencioso) {
        setError(
          e.name === "AbortError"
            ? "El servidor no responde. Verifica tu conexión."
            : "No se pudo cargar la lista de pacientes. Verifica tu conexión."
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

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const abrirModal = () => {
    setForm(FORM_VACIO);
    setErrorCrear("");
    setModalVisible(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalVisible(false);
  };

  const crearPaciente = async () => {
    if (!form.nombre.trim() || !form.cedula.trim() || !form.correo.trim()) {
      setErrorCrear("Nombre, cédula y correo son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorCrear("");
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 10000);
    try {
      const respuesta = await fetch("http://192.168.1.79:3000/api/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        setErrorCrear(datos.error || "Error al crear el paciente.");
        return;
      }
      setModalVisible(false);
      mostrarExito("Paciente registrado exitosamente");
      await cargarPacientes(true);
    } catch (e) {
      clearTimeout(timeoutId);
      setErrorCrear(
        e.name === "AbortError"
          ? "El servidor no responde. Verifica tu conexión."
          : "Error de conexión con el servidor."
      );
    } finally {
      setGuardando(false);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const iniciales = (nombre) =>
    nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (usuario?.rol === "paciente") {
    return (
      <View style={estilos.contenedor}>
        <StatusBar barStyle="light-content" />
        <View style={estilos.topbar}>
          <Text style={estilos.titulo}>Pacientes</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 32, marginBottom: 16 }}>🔒</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A2E", marginBottom: 8 }}>Acceso restringido</Text>
          <Text style={{ fontSize: 14, color: "#6C757D", textAlign: "center" }}>No tienes permiso para ver el listado de pacientes.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={estilos.topbar}>
        <Text style={estilos.titulo}>Pacientes</Text>
        <Text style={estilos.subtitulo}>
          {cargando ? "Cargando..." : error ? "Sin datos" : `${pacientes.length} registrados`}
        </Text>
      </View>

      {/* Banner de éxito tras crear paciente */}
      {!!mensajeExito && (
        <View style={estilos.exitoBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#085041" />
          <Text style={estilos.exitoTexto}>{mensajeExito}</Text>
        </View>
      )}

      <View style={estilos.contenido}>
        {/* Buscador siempre visible */}
        <View style={estilos.buscadorContenedor}>
          <TextInput
            style={estilos.buscador}
            placeholder="Buscar paciente..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={setBusqueda}
            editable={!cargando && !error}
          />
        </View>

        {cargando ? (
          <View style={estilos.centrado}>
            <ActivityIndicator size="large" color="#0F6E56" />
          </View>
        ) : error ? (
          <ErrorMessage mensaje={error} onReintentar={cargarPacientes} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {pacientesFiltrados.length === 0 ? (
              <View style={estilos.vacio}>
                <Ionicons name="people-outline" size={40} color="#CED4DA" />
                <Text style={estilos.vacioTexto}>
                  {busqueda
                    ? "No se encontraron pacientes con ese nombre"
                    : "Aún no hay pacientes registrados"}
                </Text>
              </View>
            ) : (
              pacientesFiltrados.map((paciente) => (
                <View key={paciente.id} style={estilos.card}>
                  <View style={estilos.avatar}>
                    <Text style={estilos.avatarTexto}>{iniciales(paciente.nombre)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.nombre}>{paciente.nombre}</Text>
                    <Text style={estilos.info}>{paciente.correo}</Text>
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
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* FAB — solo admin y recepcionista */}
      {PUEDE_CREAR.includes(usuario?.rol) && (
        <TouchableOpacity style={estilos.fab} onPress={abrirModal} activeOpacity={0.85}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* ── MODAL CREAR PACIENTE ── */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={cerrarModal}>
        <View style={estilos.modalFondo}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: "100%" }}>
            <View style={estilos.modalContenido}>

              <View style={estilos.modalHeader}>
                <Text style={estilos.modalTitulo}>Nuevo paciente</Text>
                <TouchableOpacity onPress={cerrarModal} disabled={guardando} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={22} color="#6C757D" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {!!errorCrear && (
                  <View style={estilos.errorCaja}>
                    <Ionicons name="alert-circle-outline" size={16} color="#C0392B" />
                    <Text style={estilos.errorTexto}>{errorCrear}</Text>
                  </View>
                )}

                {CAMPOS_TEXTO.map(({ key, label, placeholder, keyboard, capitalize }) => (
                  <View key={key} style={estilos.campo}>
                    <Text style={estilos.campoLabel}>{label}</Text>
                    <TextInput
                      style={estilos.campoInput}
                      placeholder={placeholder}
                      placeholderTextColor="#999"
                      value={form[key]}
                      onChangeText={(v) => setField(key, v)}
                      keyboardType={keyboard}
                      autoCapitalize={capitalize}
                    />
                  </View>
                ))}

                <View style={estilos.campo}>
                  <Text style={estilos.campoLabel}>SEXO</Text>
                  <View style={estilos.pillFila}>
                    {["Masculino", "Femenino"].map((opcion) => (
                      <TouchableOpacity
                        key={opcion}
                        style={[estilos.pill, form.sexo === opcion && estilos.pillActivo]}
                        onPress={() => setField("sexo", opcion)}
                      >
                        <Text style={[estilos.pillTexto, form.sexo === opcion && estilos.pillTextoActivo]}>
                          {opcion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={estilos.campo}>
                  <Text style={estilos.campoLabel}>TIPO DE SANGRE</Text>
                  <View style={estilos.pillFila}>
                    {TIPOS_SANGRE.map((tipo) => (
                      <TouchableOpacity
                        key={tipo}
                        style={[estilos.pill, form.sangre === tipo && estilos.pillActivo]}
                        onPress={() => setField("sangre", tipo)}
                      >
                        <Text style={[estilos.pillTexto, form.sangre === tipo && estilos.pillTextoActivo]}>
                          {tipo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[estilos.btnGuardar, guardando && { opacity: 0.7 }]}
                  onPress={crearPaciente}
                  disabled={guardando}
                  activeOpacity={0.85}
                >
                  {guardando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={estilos.btnGuardarTexto}>Guardar paciente</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={{ height: 32 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
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
  contenido: { flex: 1, padding: 20 },
  centrado:  { flex: 1, alignItems: "center", justifyContent: "center" },
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
  vacio:      { alignItems: "center", marginTop: 40, gap: 12 },
  vacioTexto: { fontSize: 14, color: "#6C757D", textAlign: "center" },
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
  nombre:      { fontSize: 14, fontWeight: "600", color: "#1A1A2E" },
  info:        { fontSize: 12, color: "#6C757D", marginTop: 2 },
  badge: { backgroundColor: "#E1F5EE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeTexto: { fontSize: 11, fontWeight: "600", color: "#085041" },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F6E56",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#0F6E56",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalFondo: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContenido: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "92%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitulo: { fontSize: 17, fontWeight: "700", color: "#1A1A2E" },
  errorCaja: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDEDEC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorTexto: { fontSize: 13, color: "#C0392B", flex: 1 },
  campo:      { marginBottom: 16 },
  campoLabel: { fontSize: 11, fontWeight: "700", color: "#6C757D", letterSpacing: 0.5, marginBottom: 6 },
  campoInput: {
    borderWidth: 1.5,
    borderColor: "#DEE2E6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#1A1A2E",
    backgroundColor: "#F4F6F8",
  },
  pillFila:        { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1.5, borderColor: "#DEE2E6", backgroundColor: "#F4F6F8" },
  pillActivo:      { backgroundColor: "#0F6E56", borderColor: "#0F6E56" },
  pillTexto:       { fontSize: 13, color: "#6C757D", fontWeight: "500" },
  pillTextoActivo: { color: "#fff", fontWeight: "600" },
  btnGuardar: {
    backgroundColor: "#0F6E56",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnGuardarTexto: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
