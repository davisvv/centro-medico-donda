# Bitácora de Desarrollo — Centro Médico DONDA

Registro cronológico de todos los cambios, decisiones y contratiempos del proyecto.

---

## Fase 1 — Fundación web (HTML + CSS + JS)

### Commits iniciales
- **Primer commit** (`c42e65c`): login, dashboard y citas en HTML plano.
- Se agregaron pantallas de pacientes (`da0f374`) y perfil dentro del rol médico (`b3b6008`).
- Funcionalidad de botones en pacientes y perfil (`f0e3435`, `509dbbf`).
- Se implementó routing por rol desde el login usando correo electrónico (`f75a5fc`).
- Se agregó pantalla de autorizaciones (`00fd48c`).

### Contratiempos — Navegación inconsistente
- La barra de navegación inferior no era consistente entre pantallas: cada `.html` tenía sus propios estilos y links desincronizados.
- **Fix aplicado** (`ac0bdc2` → `ea56704`): se unificó la navegación y los estilos en todos los archivos HTML.
- El botón de login no redirigía al dashboard. **Fix** (`ac0bdc2`).

---

## Fase 2 — Backend Node.js + Express + MySQL

### Estructura del servidor
- **`88a683f`**: estructura base con Express, carpetas `src/config`, `src/routes`, `src/controllers`.
- **`709de64`**: conexión a MySQL con `mysql2` y datos de seed.
- **Contratiempo** (`f77d0dc`): variable `DB_NAME` mal configurada en `.env` — fix inmediato.

### Endpoints REST
- Auth: login con JWT y bcrypt (`e1673fd`).
- Pacientes: CRUD completo (`309c0a6`).
- Citas: controlador con confirmación/cancelación (`9df22ba`).
- Autorizaciones: controlador y rutas (`e800d47`).

### Conexión frontend web → backend
- Login y dashboard conectados a la API (`b4f3d78`).
- Pantallas de pacientes, citas y autorizaciones conectadas (`16abe34`, `127d8f5`, `da40c3d`).

---

## Fase 3 — App móvil React Native + Expo

### Inicialización
- **`441c3e3`**: app Expo inicializada.
- **`72ec274`**: LoginScreen básico.
- **`578c4b5`**: React Navigation instalado, pantallas Login y Dashboard separadas como Stack.

### Contratiempo — ReferenceError: Property 'r' doesn't exist
- Al recargar la app en Expo Go apareció este error crítico.
- Causa: carácter `r` suelto al final de `mobile/App.js` introducido accidentalmente.
- **Fix**: eliminado el carácter. App volvió a funcionar.

### Navegación y pantallas
- **`bb2a632`**: PerfilScreen con logout, acceso a Autorizaciones desde Dashboard.
- Navegación: Stack (Login → Main → Autorizaciones) + Bottom Tabs (Dashboard, Citas, Pacientes, Perfil).

### Contratiempo — Iconos de la barra de navegación se veían mal
- Los íconos nativos de `@react-navigation/bottom-tabs` no tenían consistencia visual.
- **Fix** (`66d3bd7`): se reemplazaron por Ionicons de `@expo/vector-icons`. Se definió un mapa `TAB_ICONS` en `App.js` para asignar el ícono correcto a cada tab según su nombre y estado `focused`.
- El ícono de la tarjeta "Autorizaciones" en Dashboard también se unificó con `shield-checkmark-outline` de Ionicons.
- Se eliminó el emoji de la mano saludando del saludo del Dashboard para mantener un tono profesional.

### Saludo dinámico
- **`7b2b01b`**: función `saludo()` que retorna "Buenos días", "Buenas tardes" o "Buenas noches" según la hora del sistema.

---

## Fase 4 — Persistencia de sesión

### AsyncStorage
- **`3b4d124`**: implementada persistencia de sesión. Al abrir la app, se lee el token y datos del usuario desde AsyncStorage. Si existe sesión válida, salta directo al Dashboard. Splash screen evita el parpadeo de UI durante la verificación.

### Contratiempo — AsyncStorage "Native module is null"
- Error crítico al instalar `@react-native-async-storage/async-storage` con `npm install`.
- Causa: `npm` instaló la v3.1.1, incompatible con Expo Go SDK 54.
- **Fix** (`26ceb30`): instalado con `npx expo install @react-native-async-storage/async-storage` → v2.2.0, compatible.

### Cambio de IP del backend
- **`47ab068`**: la IP local del servidor cambió de `192.168.253.2` a `192.168.1.79`. Actualizada en todos los `fetch()` de la app móvil.

---

## Fase 5 — Funcionalidad de Citas y ConfirmModal

### CitasScreen
- **`6a27a6d`**: lógica completa de confirmar/cancelar citas. Estado `procesando` por cita (objeto keyed by `cita.id`) para mostrar spinner individual. Recarga desde servidor después de cada PUT.

### Contratiempo — Alert.alert nativo se veía genérico
- El diálogo de confirmación para cancelar cita usaba `Alert.alert()` nativo, con estética inconsistente según el SO.
- **Fix** (`f345edd`): se creó el componente `mobile/components/ConfirmModal.js`. Props: `visible`, `title`, `message`, `onConfirm`, `onCancel`, `confirmText`, `cancelText`, `type`. `type="danger"` → botón rojo `#C0392B`. Modal con `animationType="fade"` y fondo semitransparente.

---

## Fase 6 — Control de acceso por rol (RBAC)

### Backend
- **`7d4ad53`**: middlewares `verificarToken.js` y `verificarRol.js`. Rutas protegidas con cadena `verificarToken → verificarRol(rolesPermitidos)`.
  - `pacientes`: GET → personal (admin/recepcionista/medico), POST/PUT → solo admin/recepcionista.
  - `citas`: GET/hoy → todos los roles, POST → admin/recepcionista, PUT → admin/recepcionista/medico.
  - `autorizaciones`: GET → todos, POST/PUT → admin/médico.

### Filtrado por rol en los controladores (SQL)
- `citasControllers`: `obtenerCitasHoy` filtra por rol en el WHERE de SQL. Médico ve solo sus citas (`AND c.medico_id = ?`), paciente ve solo las suyas (`AND c.paciente_id = ?`).
- `autorizacionesControllers`: paciente ve solo sus autorizaciones, sin campo `observaciones`.
- `actualizarEstado` en citas: si el rol es médico, verifica que `cita.medico_id === req.usuario.id` antes de permitir el cambio.

### Contratiempo — Paciente veía el listado completo de pacientes
- Al hacer login como paciente y llamar a `GET /api/pacientes`, respondía con todos los registros.
- Causa: el servidor no había sido reiniciado después de agregar los middlewares. El proceso viejo en memoria no tenía los cambios.
- **Fix**: reiniciar `node server.js`. Los middlewares ya estaban correctos.

### FK paciente_id en usuarios
- **`e89f07a`**: columna `paciente_id` agregada a la tabla `usuarios` como FK hacia `pacientes.id`. Permite que el JWT incluya `paciente_id` para usuarios con rol `paciente`, evitando subconsultas por correo.

### Contratiempo — Autorizaciones devolvía [] para paciente
- Al hacer `GET /api/autorizaciones` con token de paciente, respondía array vacío.
- Causa: el token fue generado antes de que `authController` incluyera `paciente_id` en el payload JWT.
- **Fix**: cerrar sesión y volver a hacer login para obtener un token nuevo que ya incluye `paciente_id`.

### Frontend móvil
- `PacientesScreen`: muestra pantalla de "Acceso restringido" si `usuario.rol === 'paciente'`.
- `AutorizacionesScreen`: paciente ve solo procedimiento + EPS + badge, sin avatar, sin nombre de médico, sin nombre de otro paciente.

---

## Fase 7 — Limpieza y pulido

### Eliminación del selector de roles del login
- **`9467674`**: se eliminó completamente el selector visual de rol en `login.html` y `LoginScreen.js` (HTML, CSS `.roles/.rol/.rol.activo`, JS `seleccionarRol()`). El rol ahora viene exclusivamente de la base de datos, nunca lo elige el usuario.

### Historial de Git — eliminación de líneas Co-Authored-By
- Todos los commits originales incluían la línea `Co-Authored-By: Claude Sonnet` en el mensaje.
- Se reescribió el historial con `git filter-branch --msg-filter` usando Perl para eliminar esas líneas de todos los commits.
- Se hizo `git push --force` para sobrescribir el historial remoto.
- **Contratiempo**: GitHub tardó en actualizar la caché de la vista de contribuidores — se veía el atributo de Claude en la UI de GitHub aunque ya no estaba en los commits. Solución: esperar a que GitHub invalide su caché.

---

## Fase 8 — README y GitHub Pages

### README profesional
- **`f8d512e`**: creado `README.md` en la raíz con descripción no técnica, stack con versiones exactas, tabla de 4 roles, funcionalidades, árbol de arquitectura, instrucciones de instalación y nota académica SENA.

### Seguridad verificada
- Confirmado que `backend/.env` nunca aparece en el historial de Git (`git log --all --full-history -- backend/.env` retorna vacío).
- `.gitignore` tiene la regla `.env` que cubre todos los subdirectorios.

### GitHub Pages
- **`0ba646f`**: `login.html` renombrado a `index.html` para que GitHub Pages lo sirva como página principal. Referencia en `perfil.html` (botón cerrar sesión) actualizada de `'login.html'` → `'index.html'`.
- **`2272178`**: commit con comentario `<!-- deploy -->` al final de `index.html` para forzar un nuevo deployment de GitHub Pages desde cero.

---

## Contratiempo mayor — MySQL/XAMPP roto (Aria recovery failed)

### Síntomas
- MySQL no arrancaba. Error en log: `Aria recovery failed. Please run aria_chk -r on all Aria tables`.
- Segundo error: `Could not open mysql.plugin table. Some plugins may be not loaded`.
- Tercer error: `Failed to initialize plugins → Aborting`.

### Diagnóstico
- Archivo `db.MAI` (índice Aria de la tabla `mysql.db`) con tamaño de **5,296 KB** cuando el normal es ~8 KB. Índice bloqueado y corrupto.
- No había archivos `.TMD` (sin operaciones a medias).
- Primer intento de arranque (23:04): fallo total.
- Segundo intento tras borrar `aria_log` (23:18): MySQL auto-reparó `plugin` y `servers` con zerofill, creó socket — pero colapsó al leer `mysql.db` corrupto.

### Reparación
1. **Respaldo completo** en `C:\xampp_backup_2026-07-04\`: carpetas `centro_medico_donda`, `centro_clinico_do_da`, archivos `ibdata1`, `ib_logfile0`, `ib_logfile1`. Verificado con comparación de tamaños y conteo de archivos.
2. **`aria_chk -r`** sobre `C:\xampp\mysql\data\mysql\db`: reconstruyó índices 1 y 2, encontró 3 registros. `db.MAI` bajó de 5,296 KB → 24 KB.
3. MySQL arrancó sin errores en el siguiente intento. Log confirmado limpio en arranque del 12 de julio.

---

## Fase 9 — PacientesScreen: formulario crear paciente

### Funcionalidad agregada
- **FAB** (`+`) en esquina inferior derecha, visible solo para roles `admin` y `recepcionista`. Invisible para `medico` y `paciente` (control por array `PUEDE_CREAR`).
- **Modal bottom sheet** con `animationType="slide"`, `KeyboardAvoidingView` y `ScrollView` interno.
- **Campos**: nombre, cédula, correo, teléfono, edad, EPS (TextInput), sexo (pills Masculino/Femenino), tipo de sangre (8 pills: O+, O-, A+, A-, B+, B-, AB+, AB-).
- **Validación**: nombre, cédula y correo obligatorios. Error del servidor mostrado en caja roja dentro del modal sin cerrarlo.
- **POST** a `http://192.168.1.79:3000/api/pacientes` con `Authorization: Bearer token`. Éxito → cierra modal y recarga lista. Fallo → muestra `datos.error`.
- Estado `guardando` bloquea el botón y muestra `ActivityIndicator` para evitar doble envío.
- El buscador en tiempo real existente no fue modificado.

### Verificado
- FAB no aparece para rol `medico`. ✓
- Formulario funciona correctamente para `recepcionista`. ✓

---

*Última actualización: julio 2026*
