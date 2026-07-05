# Centro Médico DONDA

Sistema de gestión en salud con acceso web y móvil. Permite a médicos, recepcionistas y pacientes administrar citas, autorizaciones médicas y expedientes desde cualquier dispositivo, con control de acceso por rol en cada operación.

---

## ¿Qué hace este sistema?

Centro Médico DONDA centraliza la operación de un centro médico en una sola plataforma:

- El **recepcionista** agenda citas y registra pacientes desde la interfaz web.
- El **médico** consulta su agenda del día, actualiza estados y aprueba autorizaciones desde el celular o el computador.
- El **paciente** ve únicamente sus propias citas y autorizaciones, sin acceso a datos de terceros.
- El **administrador** tiene visibilidad completa y puede gestionar todos los registros.

Cada acción está protegida: el sistema valida identidad y permisos en el servidor antes de entregar o modificar cualquier dato.

---

## Stack tecnológico

### Backend
| Tecnología | Versión | Rol |
|---|---|---|
| Node.js + Express | 5.2.x | Servidor REST API |
| MySQL + mysql2 | 3.x | Base de datos relacional |
| JSON Web Tokens (JWT) | 9.x | Autenticación stateless |
| bcryptjs | 3.x | Hash seguro de contraseñas |
| dotenv | 17.x | Configuración de entorno |
| CORS | 2.8.x | Comunicación cross-origin |

### Frontend web
| Tecnología | Rol |
|---|---|
| HTML5 + CSS3 | Interfaz de usuario |
| JavaScript (Vanilla) | Lógica de cliente |
| Bootstrap Icons | Iconografía |
| Fetch API | Comunicación con el backend |

### App móvil
| Tecnología | Versión | Rol |
|---|---|---|
| React Native | 0.81.5 | Framework móvil |
| Expo SDK | 54 | Plataforma de desarrollo |
| React Navigation v7 | — | Navegación (Stack + Bottom Tabs) |
| AsyncStorage | 2.2.0 | Persistencia de sesión local |
| Expo Vector Icons (Ionicons) | — | Iconografía nativa |

---

## Roles del sistema

El acceso a cada pantalla y endpoint está determinado por el rol del usuario, que se asigna en la base de datos y viaja firmado dentro del token JWT.

| Rol | Descripción | Acceso |
|---|---|---|
| `admin` | Administrador del centro | Lectura y escritura total |
| `recepcionista` | Personal de recepción | Pacientes, citas, autorizaciones (lectura) |
| `medico` | Médico tratante | Sus citas del día, autorizaciones de sus pacientes |
| `paciente` | Paciente registrado | Solo sus propias citas y autorizaciones |

---

## Funcionalidades principales

**Autenticación**
- Login con correo y contraseña
- Tokens JWT firmados con expiración configurable
- Sesión persistente en la app móvil (AsyncStorage)
- El rol nunca lo elige el usuario — siempre viene de la base de datos

**Gestión de citas**
- Listado de citas del día filtrado por rol (médico ve solo las suyas, paciente solo las propias)
- Confirmación y cancelación con modal de confirmación personalizado
- Actualización de estado en tiempo real contra el servidor

**Gestión de pacientes**
- Registro y consulta de expedientes
- Acceso restringido: pacientes no pueden ver el listado general

**Autorizaciones médicas**
- Numeración automática (`AUT-AÑO-####`)
- Estados: Pendiente / En revisión / Aprobada / Rechazada
- Vista simplificada para el paciente (sin observaciones clínicas ni datos de terceros)

**Seguridad por capas**
- Middleware `verificarToken` → valida JWT en cada ruta protegida
- Middleware `verificarRol` → verifica permisos antes de ejecutar el controlador
- Filtrado en SQL → cada query incluye `WHERE` según el rol (no filtrado en memoria)

---

## Arquitectura del proyecto

```
centro-medico-donda/
├── backend/                   # API REST (Node.js + Express)
│   ├── server.js              # Punto de entrada
│   └── src/
│       ├── config/            # Conexión a MySQL
│       ├── controllers/       # Lógica de negocio
│       ├── middlewares/       # verificarToken, verificarRol
│       ├── models/            # (futuro: ORM)
│       └── routes/            # authRoutes, pacientes, citas, autorizaciones
│
├── mobile/                    # App móvil (React Native + Expo)
│   ├── App.js                 # Navegación principal (Stack + Tabs)
│   ├── components/
│   │   └── ConfirmModal.js    # Modal reutilizable
│   └── screens/
│       ├── LoginScreen.js
│       ├── DashboardScreen.js
│       ├── CitasScreen.js
│       ├── PacientesScreen.js
│       ├── AutorizacionesScreen.js
│       └── PerfilScreen.js
│
├── login.html                 # Frontend web — inicio de sesión
├── dashboard.html             # Frontend web — panel principal
├── citas.html                 # Frontend web — gestión de citas
├── pacientes.html             # Frontend web — expedientes
├── autorizaciones.html        # Frontend web — autorizaciones médicas
└── perfil.html                # Frontend web — perfil de usuario
```

---

## Instalación y ejecución

### Requisitos previos
- Node.js v18 o superior
- MySQL 8.x (o compatible)
- Expo Go instalado en el dispositivo móvil (iOS o Android)

### 1. Base de datos

Crear la base de datos en MySQL y ejecutar el script de tablas (usuarios, pacientes, citas, autorizaciones). Asegúrate de que la columna `rol` en `usuarios` tenga el ENUM: `admin`, `recepcionista`, `medico`, `paciente`.

### 2. Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` con:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=centro_medico_donda
JWT_SECRET=una_clave_secreta_larga
PORT=3000
```

Iniciar el servidor:

```bash
node server.js
# → Servidor corriendo en http://localhost:3000
```

### 3. Frontend web

Abrir directamente los archivos `.html` en el navegador, o servirlos con cualquier servidor estático (Live Server de VS Code, por ejemplo).

La URL del backend configurada en los scripts es `http://localhost:3000`.

### 4. App móvil

```bash
cd mobile
npm install
npx expo start
```

Escanear el código QR con Expo Go desde el dispositivo. La app debe estar en la misma red Wi-Fi que el servidor.

> **Nota:** la IP del backend en `LoginScreen.js` debe coincidir con la IP local de la máquina que ejecuta el servidor (por ejemplo `192.168.1.79:3000`).

---

## Endpoints principales de la API

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/auth/login` | Público |
| GET | `/api/pacientes` | admin, recepcionista, medico |
| POST | `/api/pacientes` | admin, recepcionista |
| GET | `/api/citas/hoy` | Todos los roles |
| PUT | `/api/citas/:id` | admin, recepcionista, medico |
| GET | `/api/autorizaciones` | Todos los roles |
| POST | `/api/autorizaciones` | admin, medico |
| PUT | `/api/autorizaciones/:id` | admin, medico |

---

## Nota académica

Este proyecto fue desarrollado como trabajo de formación en **SENA** (Servicio Nacional de Aprendizaje), aplicando estándares profesionales de la industria: arquitectura en capas, autenticación con JWT, control de acceso por rol, persistencia de sesión y diseño de interfaz coherente entre plataformas web y móvil.

---

*Desarrollado con Node.js, React Native y MySQL — 2025*
