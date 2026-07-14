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

## 12/07/2026 — Loading states, manejo de errores y EAS Build

### Fase 10 — UX profesional: estados de carga y errores en toda la app móvil

**Nuevo componente:** `mobile/components/ErrorMessage.js`
- Componente reutilizable para errores de red en todas las pantallas.
- Fondo rojo suave `#FCEBEB`, ícono `alert-circle-outline`, texto `#A32D2D`.
- Botón "Reintentar" que vuelve a llamar la función de carga correspondiente.

**DashboardScreen.js**
- Añadido estado `cargando` (spinner inicial) y `error`.
- Topbar muestra "Cargando..." dinámicamente durante la carga.
- Estado vacío mejorado: ícono `calendar-outline` gris + "Sin citas programadas para hoy".
- Timeout de 10 segundos via `AbortController` en el fetch.

**CitasScreen.js**
- Eliminado `Alert.alert()` completamente — reemplazado por banners inline.
- Añadido `cargando`, `error`, `errorAccion` (auto-desaparece 3s), `mensajeExito` (auto-desaparece 2s).
- Recargas post-acción son **silenciosas** (`silencioso = true`): no muestran spinner, solo refrescan la lista.
- Banner verde de éxito aparece al confirmar o cancelar una cita antes del refresh.
- Estado vacío mejorado: ícono `calendar-outline` + texto descriptivo.
- Timeout de 10s en fetch de carga y en PUT de actualización.

**AutorizacionesScreen.js**
- Añadido `cargando` y `error`. Reemplazado `console.log` por `setError`.
- Estado vacío diferenciado por rol: "No tienes autorizaciones registradas" (paciente) vs "No hay autorizaciones registradas" (personal).
- Ícono `document-text-outline` en estado vacío.

**PacientesScreen.js**
- `cargando` inicia en `false` si el rol es `paciente` (no hace fetch innecesario).
- `useEffect` no llama la API si `rol === 'paciente'` — fix de bug previo.
- Buscador se deshabilita durante carga/error.
- Estado vacío diferenciado: busqueda activa vs lista vacía real.
- Banner verde de éxito tras crear paciente, con recarga silenciosa.
- Timeout de 10s en `cargarPacientes` y en el POST de `crearPaciente`.

**Commit:** `7cff66a` — 5 archivos, 763 inserciones.

---

### Fase 11 — EAS Build: generación de APK para Android

**Configuración inicial**
- EAS CLI ya estaba instalado (v20.5.1). Se ejecutó `eas init` → vinculó el proyecto a la cuenta `dondavv`, generó `projectId` y `owner` en `app.json`.
- Creado `eas.json` con perfiles `preview` y `production`, ambos con `buildType: "apk"`.
- `app.json` actualizado: `name` → "Centro Médico DONDA", `slug` → "centro-medico-donda", `android.package` → "com.donda.centromedico".

**Contratiempo 1 — Gradle build failed (newArchEnabled)**
- Primer build (`01115e71`) falló con `EAS_BUILD_UNKNOWN_GRADLE_ERROR`.
- Causa sospechada: `newArchEnabled: true` + librerías nativas incompatibles con nueva arquitectura en el entorno cloud.
- Fix aplicado: `newArchEnabled: false` en `app.json` + `appVersionSource: "local"` en `eas.json`.

**Contratiempo 2 — expo doctor bloqueó el build (versiones incompatibles)**
- Segundo build (`197be2ca`) también falló con el mismo error de Gradle.
- Logs reales descargados desde Google Storage via API de EAS.
- Causa real: `expo doctor` detectó versiones fuera del rango de Expo SDK 54 antes de llegar a Gradle:
  - `react-native-screens` instalado `4.0.0`, requerido `~4.16.0`
  - `react-native-safe-area-context` instalado `5.8.0`, requerido `~5.6.0`
- Fix: `npx expo install react-native-safe-area-context react-native-screens` → instaló `5.6.2` y `4.16.0`.
- Verificado con `npx expo install --check` → "Dependencies are up to date".

**Tercer build exitoso** (`49d8290e`): APK generado correctamente.
- Descargable desde Expo: `https://expo.dev/artifacts/eas/4AcK--_FF0nbCvviB-r9Abtjl7Vru0nloaxDOBuuW8k.apk`

**Commit:** `9025e77` — `app.json`, `eas.json`, `package.json`, `package-lock.json`.

---

## 13/07/2026 — Backend: Railway, migración de base de datos y seed

### Fase 12 — Preparación para despliegue en Railway

**Conexión a base de datos — createPool**
- `backend/src/config/database.js` migrado de `mysql.createConnection` a `mysql.createPool`.
- `connectionLimit: 10`, `waitForConnections: true`, `queueLimit: 0`.
- Puerto configurable via `DB_PORT` (necesario en Railway, que no usa el puerto 3306 estándar).
- El pool verifica la conexión al arrancar (`getConnection` + `release`) sin mantenerla abierta permanentemente.

**Scripts npm**
- `backend/package.json` ahora incluye:
  - `"start": "node server.js"` — punto de entrada para Railway.
  - `"migrate": "node database/migrate.js"` — solo schema.
  - `"migrate:seed": "node database/migrate.js --seed"` — schema + datos de prueba.

**`.railwayignore`**
- Excluye `node_modules/`, `.env`, `*.log`, `.DS_Store`, `Thumbs.db` del deploy.

### Fase 13 — Sistema de migración versionado

**`backend/database/schema.sql`**
- 4 tablas en orden de dependencia: `pacientes → usuarios → citas → autorizaciones`.
- `CREATE TABLE IF NOT EXISTS` en todas → idempotente, puede re-ejecutarse sin errores.
- `SET FOREIGN_KEY_CHECKS = 0/1` al inicio y al final para evitar errores de orden.
- `utf8mb4` / `InnoDB` en todas las tablas.
- FKs: `usuarios.paciente_id → pacientes (SET NULL)`, `citas/autorizaciones → pacientes y usuarios (CASCADE)`.
- Campo `activo TINYINT(1) DEFAULT 1` en `usuarios` (usado en authController con `WHERE activo = true`).

**`backend/database/migrate.js`**
- Carga `.env` correctamente desde subcarpeta (`path.join(__dirname, "../.env")`).
- Lee y ejecuta `schema.sql` con `multipleStatements: true`.
- Si recibe `--seed`, llama `seed(connection)`.
- Usa `createConnection` (no pool) para la migración puntual, cierra al terminar.

**`backend/database/seed.js`**
- **Contratiempo**: versión anterior incluía dos usuarios inventados que no existían en la BD local:
  - Dra. Sofía Herrera (`pediatra@donda.com`) — nunca fue dato de prueba real.
  - Laura Martínez López (`laura.p@donda.com`) — nunca fue dato de prueba real.
- **Fix**: seed reescrito con exactamente los 4 usuarios validados localmente:
  - `admin@donda.com` / `donda2025` → Admin DONDA
  - `a.perez@donda.com` / `donda2025` → Dr. Alejandro Pérez (Medicina General)
  - `recepcion@donda.com` / `recep2025` → Ana Recepción
  - `maria@gmail.com` / `paciente2025` → María García (vinculada a su registro en `pacientes`)
- 1 paciente en tabla `pacientes`: María García (cédula `1098765432`, EPS Sura, sangre A+).
- 2 citas de hoy creadas entre María García y el Dr. Pérez (Pendiente y Confirmada).
- Contraseñas hasheadas en tiempo de ejecución con `bcryptjs.hashSync`.
- `INSERT IGNORE` en todas las inserciones → idempotente.
- README.md actualizado con las credenciales correctas.

**Commit:** `95778df` — 7 archivos: schema.sql, migrate.js, seed.js, database.js, package.json, .railwayignore, README.md.

---

---

## 13/07/2026 — Despliegue en producción: Railway + URL de producción en app móvil

### Fase 14 — Migración ejecutada contra Railway MySQL

- Conexión pública TCP de Railway: `trolley.proxy.rlwy.net:51803`.
- Comando ejecutado desde la PC local con variables de entorno sobreescritas temporalmente:
  `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=railway`.
- Resultado: 4 tablas creadas, 4 usuarios insertados, 1 paciente y 2 citas de prueba.
- Railway CLI (v5.26.1) instalado globalmente via npm (`@railway/cli`).

### Fase 15 — App móvil apunta a producción

- Reemplazadas **7 referencias** a `http://192.168.1.79:3000` por `https://centro-medico-donda-production.up.railway.app` en 5 archivos:
  - `mobile/screens/LoginScreen.js` — endpoint de login
  - `mobile/screens/DashboardScreen.js` — citas del día en dashboard
  - `mobile/screens/CitasScreen.js` — carga de citas + PUT de actualización de estado
  - `mobile/screens/AutorizacionesScreen.js` — listado de autorizaciones
  - `mobile/screens/PacientesScreen.js` — GET listado + POST crear paciente
- Protocolo actualizado de `http` a `https` en todas las URLs.
- Verificado: 0 referencias a la IP local quedan en `mobile/`.

### Fase 16 — GitHub Actions: build de APK sin quota de EAS

**Contexto**: se agotó el plan gratuito de EAS Build. Solución: compilar el APK directamente en un runner de GitHub Actions usando `expo prebuild` + Gradle, sin pasar por los servidores de Expo.

**`.github/workflows/build-android.yml`** (`8e28410`)
- Se dispara en `workflow_dispatch` (manual) o en push a `main` que toque archivos en `mobile/`.
- Pasos: checkout → Java 17 (Temurin) → Node 20 → `npm ci` → `expo prebuild --platform android --clean --no-install` → decode keystore → `gradlew assembleRelease` → artifact `centro-medico-donda-vN` (30 días de retención).
- APK firmado con keystore almacenado en GitHub Secrets (nunca en el repositorio).

**Keystore y Secrets**
- Generado con `keytool -genkeypair -storetype PKCS12 -alias donda -keyalg RSA -keysize 2048 -validity 10000`.
- Convertido a Base64 con `[Convert]::ToBase64String(...)  | Set-Clipboard` (directo al portapapeles, sin archivo intermedio).
- 4 Secrets configurados en GitHub: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
- Archivo `.keystore` eliminado del disco tras copiar al portapapeles.

**Contratiempo — `base64: invalid input` en GitHub Actions** (`f96aeb1`)
- Causa: el primer keystore se exportó con `Out-File`, que agrega un salto de línea al final del Base64. El comando `echo "..." | base64 --decode` en Linux rechaza el input con newline.
- Fix en workflow: cambiado `echo` por `printf '%s'`, que no agrega newline y no interpreta el valor como formato.
- Fix en proceso: keystore regenerado desde cero y Secret `ANDROID_KEYSTORE_BASE64` reemplazado usando `Set-Clipboard` (garantiza sin newline).

*Última actualización: 13/07/2026*
