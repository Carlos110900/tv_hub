# TV Hub — AGENTS.md

Educational readability is more important than enterprise-style abstraction.
Backend code should be understandable by students with basic knowledge of Express, TypeScript, Mongoose and async/await.

Avoid introducing additional architectural layers unless the course explicitly reaches that topic.

## Propósito

TV Hub es un proyecto universitario de Backend para enseñar Node.js, Express, TypeScript, MVC, MongoDB, Mongoose, Docker, autenticación, autorización, JWT, refresh tokens, persistencia de sesiones, APIs REST y testing.

La versión actual es **V2 — Canales simples sobre la base de autenticación de V1**. V1 sigue siendo parte del proyecto: registro, login, JWT, cookies HttpOnly, sesiones persistentes, refresh, logout y autorización deben conservarse funcionando.

Antes de modificar código:

1. Lee este `AGENTS.md`.
2. Lee `docs/requerimientos-v1.md` como referencia histórica de la base de autenticación.
3. Inspecciona el repositorio.
4. Respeta estrictamente el alcance de V2.
5. No implementes funcionalidades de V3.

## Filosofía educativa

Prioriza claridad, legibilidad, separación de responsabilidades, facilidad para explicar el código en clase y buenas prácticas reales sin sobrearquitectura.

Prefiere código explícito y didáctico sobre abstracciones innecesarias.

## Stack obligatorio

Usar Node.js, Express, TypeScript, MongoDB, Mongoose, Docker / Docker Compose, JWT, bcryptjs, cookies HttpOnly, Jest y Supertest.

Puede usarse Zod u otra librería ligera de validación si simplifica el código. No utilizar NestJS, Prisma, TypeORM, Sequelize, Next.js, React, Angular o Vue salvo instrucción posterior explícita.

## TypeScript

Usar TypeScript estricto y evitar `any` siempre que sea razonablemente posible.

## Arquitectura

V2 debe mantener MVC de forma clara:

```text
View (src/public)
    ↓
Routes
    ↓
Middleware cuando sea necesario
    ↓
Controllers
    ↓
Mongoose Models
    ↓
MongoDB
```

La View corresponde al frontend simple servido por Express: HTML, CSS y JavaScript vanilla.

No convertir V2 en Layered Architecture. No agregar `Service`, `Repository`, DTO, Dependency Injection, Clean Architecture ni Hexagonal Architecture.

## Responsabilidades

### Routes

- Definir endpoints.
- Aplicar middleware.
- Delegar al Controller.
- No contener lógica de negocio.

### Controllers

- Leer request.
- Validar datos.
- Coordinar operaciones.
- Usar Mongoose Models directamente.
- Construir response.

### Models

- Definir Schema, tipos, restricciones, índices, timestamps y validaciones de persistencia.

### Middleware

- Autenticación, autorización y manejo de errores.

## Alcance permitido de V2

V2 incorpora una funcionalidad simple y visual de canales:

- `Channel` Model con `name`, `logoUrl`, `streamUrl`, `country`, `categories` e `isActive`;
- datos locales de ejemplo y `npm run seed:channels`;
- `GET /api/channels`;
- parámetros opcionales simples: `search`, `category`, `country` y `sort`;
- tarjetas de canales en `src/public` con logo, nombre, país y categorías;
- búsqueda simple desde el frontend;
- tests pequeños y educativos para canales.

No crear colecciones separadas para categorías o países. No usar aggregation pipelines ni paginación.

## Autenticación y autorización de V1

- Nunca guardar contraseñas en texto plano; usar `bcryptjs` y persistir solo `passwordHash`.
- Access Token de corta duración y Refresh Token revocable y rotativo.
- Nunca almacenar el refresh token original en MongoDB; persistir solamente `refreshTokenHash`.
- Usar cookies HttpOnly; nunca `localStorage` para refresh tokens.
- Roles iniciales: `USER` y `ADMIN`.
- Mantener clara la diferencia entre authentication y authorization.
- Nunca devolver hashes, tokens, secretos ni stack traces por API.

## MongoDB y Docker

- MongoDB debe ejecutarse en Docker Compose, con volumen persistente y healthcheck.
- Configurar la conexión mediante `MONGO_URI`; no hardcodear credenciales.
- Mantener `GET /health` para Express y `GET /ready` para la conexión a MongoDB.

## Fuera de alcance de V2

NO implementar todavía:

- favoritos o `FavoriteList`;
- playlists de usuario;
- reproductor de streaming o integración HLS;
- gestión avanzada, descarga o parsing de M3U;
- panel administrativo;
- analytics;
- WebSockets;
- OAuth externo;
- paginación compleja;
- `Service`, `Repository`, DTO, Clean Architecture o Hexagonal Architecture;
- funcionalidades de V3.

## Testing

Usar Jest + Supertest. Mantener los tests de V1 y cubrir de forma simple health, register, login, refresh, logout, acceso autenticado, autorización por rol, `GET /api/channels` y búsqueda de canales.

Los tests deben ser claros y educativos.

## README

Mantener README con Requirements, Installation, Environment variables, Docker, Run application, Run tests, API endpoints, Architecture, seed de canales y referencia a los materiales de clase vigentes.

## Regla de simplicidad

Si existen varias soluciones válidas, preferir la que sea segura, explícita, pequeña, fácil de explicar, fácil de depurar y adecuada para estudiantes.

## Definition of Done

Antes de terminar:

```bash
npm install
npm run build
npm test
docker compose config
docker compose up -d
```

La aplicación debe iniciar correctamente y `GET /health` y `GET /ready` deben responder como se espera. Nunca declarar la tarea terminada sin validar estos puntos.
