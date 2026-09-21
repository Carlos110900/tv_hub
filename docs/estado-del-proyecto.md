# Estado del proyecto — TV Hub

Última actualización: 21 de septiembre de 2026.

Este documento permite retomar el trabajo aunque cambie la sesión de Codex o se cierre la terminal.

## Estado actual

- La rama local actual es `tv-hub-v2-b-ui-alt`.
- Esta rama contiene TV Hub V3: UI azul inspirada en Spotify, canales por categorías, importador M3U local y favoritos por usuario.
- No se ha enviado ningún cambio remoto como parte de esta integración.

## Ramas relevantes

| Rama | Estado | Commit principal | Contenido |
| --- | --- | --- | --- |
| `master` | Sin modificar | `dd1ea15` | Base V2 instructora con autenticación, seed, API y tarjetas; sin M3U. |
| `tv-hub-v2-channels` | Sin modificar | `bd11cc7` | Solución local de Session 11 para Channels. |
| `tv-hub-v2-b-ui-alt` | Actual | `9312dc7` | V3: UI alternativa azul, categorías, importación M3U local y favoritos por usuario. |

## Material de clase vigente

- `docs/requerimientos-v1.md` conserva la referencia histórica de autenticación.
- `docs/session-10-student-checkpoints.md` contiene checkpoints pequeños y vigentes para explicar Channels.
- `docs/session-11-m3u-import.md` explica la importación local opcional de playlists M3U.

## Datos de canales

El repositorio contiene 20 canales didácticos en `src/data/channels.sample.ts`. Cada estudiante debe iniciar MongoDB y cargar sus propios datos:

```bash
docker compose up -d
npm run build
npm run seed:channels
npm run dev
```

El comando `npm run seed:channels` reemplaza la colección `channels` por esos 20 ejemplos locales.

Un docente puede importar archivos M3U locales no versionados por país. Esos datos quedan en MongoDB; no se comparten por Git.

## Importación M3U local

La importación M3U está disponible en la rama actual y permanece fuera de `master` y de `tv-hub-v2-channels`.

En una de esas ramas, el uso es:

```bash
npm run build
npm run import:m3u -- docs/argentina_playlist.m3u Argentina
```

No fusionar esas ramas con `master` ni con la rama de estudiantes si se desea conservar el alcance didáctico simple de V2.

## Validación de la rama integrada

La integración fue validada con:

```text
npm run build          ✓
npm test               ✓ 5 suites, 14 tests
docker compose config  ✓
docker compose up -d   ✓
npm run seed:channels  ✓ (20 canales)
GET /health            ✓
GET /ready             ✓
GET /api/channels      ✓ (búsqueda y filtros)
GET /api/favorites     ✓ (pruebas de autenticación, alta, listado, baja y duplicados)
```

## V3 — Discover & Favorites

Cada `Favorite` relaciona un usuario autenticado con un canal. El índice único `{ userId, channelId }` evita duplicados. La UI marca favoritos con ★, permite quitarlos con ☆ y muestra una fila personal al inicio de Home. Las categorías se muestran separadas por coma y espacio.

Endpoints protegidos:

```text
GET    /api/favorites
POST   /api/favorites/:channelId
DELETE /api/favorites/:channelId
```

La reproducción de streams sigue fuera de alcance.
