# TV Hub V2

Proyecto con Node.js, Express, TypeScript, MongoDB y Mongoose. TV Hub V2 conserva la autenticación, JWT, cookies HttpOnly, sesiones persistentes y autorización de V1. Además incorpora un listado visual y simple de canales.

## TV Hub V2

- El registro, login, refresh y logout de V1 siguen funcionando.
- `Channel` es un modelo de Mongoose con datos de ejemplo almacenados en MongoDB.
- `GET /api/channels` devuelve los canales activos; acepta `search`, `category`, `country` y `sort=country` de forma opcional.
- La página Home usa `fetch('/api/channels')` y muestra tarjetas con logo, nombre, país y categorías.
- La búsqueda del Home consulta de nuevo al backend.
- Los ejercicios guiados están en `docs/session-10-student-checkpoints.md`.
- Como actividad opcional posterior, una playlist M3U local se puede importar con `npm run import:m3u`.

## Requirements

- Node.js 20 o superior
- Docker y Docker Compose

## Installation and environment

```bash
npm install
docker compose up -d
npm run build
npm run seed:channels
npm run import:m3u -- docs/argentina_playlist.m3u Argentina
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

Un clon nuevo usa `.env.example` automáticamente en desarrollo, por lo que no requiere crear un `.env` para empezar la clase. Si se necesita personalizar la configuración local, crear el archivo ignorado por Git:

```bash
cp .env.example .env
```

Las variables requeridas están documentadas en `.env.example`: `PORT`, `NODE_ENV`, `MONGO_URI`, secretos JWT y los TTL de ambos tokens. En producción se debe proporcionar un `.env` seguro o variables de entorno equivalentes; los secretos de ejemplo no son válidos para producción.

## Commands

```bash
npm run dev
npm run build
npm start
npm test
npm run test:watch
npm run seed:channels
npm run import:m3u -- docs/argentina_playlist.m3u Argentina
docker compose config
docker compose up -d
```

## Architecture

El flujo es Route → Controller → Mongoose Model → MongoDB. Para canales: `channel.routes.ts` → `channel.controller.ts` → `channel.model.ts` → MongoDB → JSON → `src/public/js/home.js`. Las rutas aplican middleware cuando hace falta; los controladores validan y coordinan; los modelos definen persistencia. El frontend es HTML, CSS y JavaScript vanilla con `fetch` nativo.

## API

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/health`              | Express health check           |
| GET    | `/ready`               | MongoDB readiness check        |
| POST   | `/api/auth/register`   | Creates a USER and signs in    |
| POST   | `/api/auth/login`      | Signs in and creates a session |
| POST   | `/api/auth/refresh`    | Rotates refresh token          |
| POST   | `/api/auth/logout`     | Revokes current session        |
| POST   | `/api/auth/logout-all` | Revokes all user sessions      |
| GET    | `/api/users/me`        | Current authenticated user     |
| GET    | `/api/admin/demo`      | ADMIN-only demonstration       |
| GET    | `/api/channels`        | Active channels from MongoDB   |

Access and refresh tokens are sent as HttpOnly cookies. MongoDB only stores a SHA-256 hash of the refresh token (bcrypt is used for passwords; it truncates long JWT values). Refreshing replaces that hash, so the previous refresh token cannot be reused.

## Seed channel data

Start MongoDB, build the project, then load the local classroom data:

```bash
docker compose up -d
npm run build
npm run seed:channels
```

The seed replaces the current channel collection with 20 local sample records. It does not fetch playlists or depend on an IPTV service. `streamUrl` is only stored as example data; V2 does not play streams.

## Optional local M3U import

For a later classroom activity, teacher-provided local M3U files can be imported without adding an HTTP endpoint or an external playlist provider:

```bash
npm run build
npm run import:m3u -- docs/argentina_playlist.m3u Argentina
```

The importer reads `#EXTINF`, `tvg-logo`, `group-title`, and the following stream URL. It replaces channels for the specified country only, preserving other countries. Details and student-facing examples are in `docs/session-11-m3u-import.md`.
