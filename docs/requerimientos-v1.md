# TV Hub — Requerimientos V1 (referencia histórica)

> Este documento describe la base de autenticación implementada en V1. La versión vigente del proyecto es V2; por ello, los canales simples, sus datos locales, `GET /api/channels`, búsqueda, filtros, ordenamiento simple y tarjetas de frontend sí están permitidos. Para el alcance actual, prevalece `AGENTS.md`.

## MVC + Authentication + Authorization

## 1. Objetivo
Construir la **Versión 1 de TV Hub**.

V1 establece la base arquitectónica y de seguridad antes de introducir canales IPTV.

Debe demostrar:
- MVC;
- MongoDB;
- Mongoose;
- Docker;
- registro;
- login;
- Access Token;
- Refresh Token;
- persistencia de sesiones;
- rotación de Refresh Tokens;
- logout;
- autorización por roles;
- frontend mínimo funcional.

Flujo esperado:

```text
registrarse
↓
autenticarse
↓
mantener una sesión
↓
refrescar credenciales
↓
acceder a una página protegida
↓
cerrar sesión
```

Todavía NO debe consumir canales.

## 2. Contexto futuro
TV Hub evolucionará posteriormente para:
- obtener playlists M3U;
- procesarlas;
- almacenar canales;
- buscar;
- filtrar;
- ordenar;
- paginar;
- reproducir streams;
- gestionar favoritos.

Nada de eso debe implementarse en V1.

## 3. Arquitectura

```text
Browser
   ↓
Route
   ↓
Controller
   ↓
Mongoose Model
   ↓
MongoDB
```

View:
```text
HTML + CSS + JavaScript vanilla
```

## 4. Estructura esperada

```text
tv-hub/
├── AGENTS.md
├── README.md
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── .env.example
├── .gitignore
├── docs/
│   └── requerimientos-v1.md
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   ├── authenticate.middleware.ts
│   │   ├── authorize.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── session.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── health.routes.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── cookies.ts
│   ├── types/
│   │   └── express.d.ts
│   └── public/
│       ├── login.html
│       ├── register.html
│       ├── index.html
│       ├── css/
│       │   └── styles.css
│       └── js/
│           ├── auth.js
│           └── home.js
└── tests/
    ├── auth.test.ts
    └── health.test.ts
```

## 5. MongoDB y Docker
- MongoDB debe ejecutarse con Docker Compose.
- Base lógica: `tvhub`.
- Usar volumen persistente.
- Incluir healthcheck.
- Puerto local convencional: `27017`.
- Conectar Mongoose mediante `MONGO_URI`.
- `/ready` debe reflejar si MongoDB está conectado.

Colecciones de V1:

```text
tvhub
├── users
└── sessions
```

## 6. User Model

Documento aproximado:

```ts
User {
  _id
  email
  passwordHash
  role
  createdAt
  updatedAt
}
```

Reglas:
- email requerido;
- lowercase;
- único;
- índice único;
- password nunca se persiste directamente;
- `passwordHash` nunca se devuelve.

Roles:

```text
USER
ADMIN
```

El registro público crea `USER`.
No permitir auto-registro como `ADMIN`.

## 7. Session Model

```ts
Session {
  _id
  userId
  refreshTokenHash
  expiresAt
  revokedAt?
  userAgent?
  createdAt
  updatedAt
}
```

Debe permitir múltiples sesiones por usuario.

## 8. Tokens

### Access Token
- JWT.
- TTL recomendado: 15 minutos.
- Configurable.
- Payload mínimo:

```json
{
  "sub": "USER_ID",
  "role": "USER"
}
```

### Refresh Token
- TTL recomendado: 7 días.
- Debe vincularse a una Session.
- MongoDB almacena solo el hash.
- Debe soportar rotación y revocación.

## 9. Cookies
Usar cookies HttpOnly:

```text
accessToken
refreshToken
```

Desarrollo:
```text
httpOnly: true
sameSite: lax
secure: false
```

Producción:
```text
secure: true
```

No devolver los tokens en JSON si ya se usan cookies.

## 10. Registro

```http
POST /api/auth/register
```

Body:

```json
{
  "email": "student@example.com",
  "password": "StrongPassword123!"
}
```

Validar:
- email válido;
- password mínimo razonable;
- no duplicado.

Tras registrar, iniciar sesión automáticamente.

## 11. Login

```http
POST /api/auth/login
```

Flujo:

```text
request
↓
buscar User
↓
comparar password
↓
crear Access Token
↓
crear Refresh Token
↓
hash Refresh Token
↓
crear Session
↓
enviar cookies
↓
response
```

Respuesta sugerida:

```json
{
  "user": {
    "id": "...",
    "email": "student@example.com",
    "role": "USER"
  }
}
```

## 12. Usuario actual

```http
GET /api/users/me
```

Protegida.

Respuesta:

```json
{
  "id": "...",
  "email": "...",
  "role": "USER"
}
```

Nunca devolver:
- passwordHash;
- refreshToken;
- refreshTokenHash.

## 13. Authentication Middleware
Crear `authenticate`.

Debe:
- leer Access Token;
- validar firma;
- validar expiración;
- extraer `sub` y `role`;
- agregar identidad al Request.

Si falla:

```http
401 Unauthorized
```

## 14. Authorization Middleware
Crear `authorize(...)`.

Ejemplo:

```ts
authorize("ADMIN")
```

Si el usuario está autenticado pero no autorizado:

```http
403 Forbidden
```

Diferencia obligatoria:

```text
401 = no autenticado
403 = autenticado pero sin permiso
```

## 15. Endpoint administrativo de demostración

```http
GET /api/admin/demo
```

Debe requerir:
```text
authenticate
+
ADMIN
```

Respuesta:

```json
{
  "message": "Admin access granted"
}
```

## 16. Refresh

```http
POST /api/auth/refresh
```

Flujo:

```text
Refresh Token cookie
↓
validar JWT
↓
buscar Session
↓
comparar contra refreshTokenHash
↓
comprobar expiración/revocación
↓
crear nuevo Access Token
↓
crear nuevo Refresh Token
↓
actualizar Session
↓
actualizar cookies
```

## 17. Refresh Token Rotation

```text
Token A
↓
refresh válido
↓
Token B
```

Actualizar `refreshTokenHash`.

Token A no debe volver a ser válido.

## 18. Logout

```http
POST /api/auth/logout
```

Debe:
- identificar la Session;
- revocarla o eliminarla;
- borrar cookies.

El refresh token anterior no debe poder reutilizarse.

## 19. Logout global

```http
POST /api/auth/logout-all
```

Debe revocar todas las sesiones activas del usuario autenticado.

## 20. Health

```http
GET /health
```

Respuesta:

```json
{
  "status": "ok"
}
```

## 21. Readiness

```http
GET /ready
```

Con Mongo conectado:

```json
{
  "status": "ready",
  "database": "connected"
}
```

Sin Mongo:

```json
{
  "status": "not_ready",
  "database": "disconnected"
}
```

Usar código HTTP apropiado.

## 22. Frontend

### `/register`
Formulario:
- Email
- Password
- Create Account

### `/login`
Formulario:
- Email
- Password
- Sign In

### `/`
Home autenticado.

Mostrar:
- nombre TV HUB;
- email;
- role;
- botón Logout.

Placeholders:

```text
TV HUB

Welcome, student@example.com

Search
[ Search channels... ] ← disabled

Categories
[ Coming in V2 ]

Channels
[ Channels coming soon ]

Favorites
[ Coming in V2 ]
```

## 23. Manejo de errores
Formato consistente:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

Códigos mínimos:
- EMAIL_ALREADY_EXISTS
- INVALID_CREDENTIALS
- UNAUTHORIZED
- FORBIDDEN
- INVALID_REFRESH_TOKEN
- SESSION_EXPIRED
- VALIDATION_ERROR
- INTERNAL_ERROR

## 24. Seguridad mínima
Aplicar:
- bcryptjs;
- HttpOnly cookies;
- secretos en env;
- validación de entrada;
- expiración JWT;
- refresh rotation;
- session revocation;
- roles;
- no exposición de hashes.

Puede usarse `helmet`.

## 25. Variables de entorno
Crear `.env.example`:

```env
PORT=3000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/tvhub

JWT_ACCESS_SECRET=replace-with-a-long-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-secret

ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
```

No versionar `.env`.

## 26. API esperada

```http
GET  /health
GET  /ready

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/logout-all

GET  /api/users/me
GET  /api/admin/demo
```

## 27. Tests mínimos
Usar Jest + Supertest.

Cubrir:
- `GET /health` → 200;
- registro exitoso;
- email duplicado;
- login válido;
- login inválido → 401;
- ruta protegida sin token → 401;
- `/me` autenticado → 200;
- USER sobre ruta ADMIN → 403;
- refresh válido;
- logout revoca sesión.

## 28. Ejecución local esperada

```bash
git clone ...
cd tv-hub
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Debe funcionar en macOS, Windows y Linux. Evitar scripts dependientes exclusivamente de Bash.

## 29. Fuera de alcance de V1
NO implementar:
- Channel Model;
- Channel Controller;
- Channel Repository;
- playlists IPTV;
- PlaylistSource;
- parser M3U;
- M3U8;
- HLS;
- reproducción de video;
- categorías;
- búsqueda;
- filtros;
- ordenamiento;
- paginación;
- favoritos;
- FavoriteList;
- providers externos;
- OAuth/OIDC integrado;
- Auth0;
- Clerk;
- Firebase;
- Supabase;
- Cognito;
- MFA;
- recuperación de contraseña;
- email verification.

## 30. Acceptance Criteria
V1 está terminada cuando:
- Mongo corre en Docker;
- Mongoose conecta;
- `/health` funciona;
- `/ready` refleja Mongo;
- register funciona;
- password se almacena hasheado;
- login funciona;
- Access Token funciona;
- Refresh Token funciona;
- Session persiste;
- refresh token se almacena hasheado;
- rotation funciona;
- logout revoca sesión;
- logout-all funciona;
- USER y ADMIN existen;
- 401 y 403 se usan correctamente;
- `/api/users/me` funciona;
- Login/Register frontend funcionan;
- Home protegido funciona;
- Home contiene placeholders V2;
- Channels no está implementado;
- tests pasan;
- TypeScript compila;
- README está actualizado.

## 31. Validación final obligatoria

```bash
npm install
npm run build
npm test
docker compose config
docker compose up -d
```

Luego comprobar:

```http
GET /health
GET /ready
```

Y realizar manualmente:

```text
Register
→ Home/Login
→ /me
→ Refresh
→ Logout
```

Corregir cualquier problema antes de declarar V1 terminada.

## 32. Entrega de Codex
Al terminar, resumir:
1. estructura creada;
2. decisiones arquitectónicas;
3. Models;
4. endpoints;
5. estrategia Access/Refresh Token;
6. funcionamiento de Session;
7. tests ejecutados;
8. comandos para iniciar;
9. trade-offs relevantes.

No implementar funcionalidades de V2.
