# Estado del proyecto — TV Hub

Última actualización: 21 de septiembre de 2026.

Este documento permite retomar el trabajo aunque cambie la sesión de Codex o se cierre la terminal.

## Estado actual

- La rama local actual es `tv-hub-v2-b-ui-alt`.
- Esta rama es el starter de TV Hub V3 para Session 12, con ejercicios guiados pequeños sobre Favorites.
- La publicación remota de la rama debe verificarse con `git status --branch`.
- Los servidores locales están detenidos por solicitud del docente.

## Ramas relevantes

| Rama | Estado | Commit principal | Contenido |
| --- | --- | --- | --- |
| `master` | Sin modificar | `dd1ea15` | Base V2 instructora con autenticación, seed, API y tarjetas; sin M3U. |
| `tv-hub-v2-channels` | Sin modificar | `bd11cc7` | Solución local de Session 11 para Channels. |
| `tv-hub-v2-b-ui-alt` | Actual | `update: v3 base tvhub` | Starter V3: UI alternativa azul, categorías, importación M3U y TODOs de Favorites. |

## Material de clase vigente

- `docs/requerimientos-v1.md` conserva la referencia histórica de autenticación.
- `docs/session-10-student-checkpoints.md` contiene checkpoints pequeños y vigentes para explicar Channels.
- `docs/session-11-m3u-import.md` explica la importación local opcional de playlists M3U.
- `docs/session-12-student-checkpoints.md` contiene los ejercicios guiados de Favorites para este starter.

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

## Validación de la versión de referencia

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

## V3, Student Starter, Discover & Favorites

Cada `Favorite` relaciona un usuario autenticado con un canal. El índice único `{ userId, channelId }` evita duplicados. La UI conserva estrellas, fila personal y categorías separadas por coma y espacio. Los TODOs de Session 12 cubren rutas, persistencia, eliminación y renderizado sin retirar la estructura MVC.

Endpoints protegidos:

```text
GET    /api/favorites
POST   /api/favorites/:channelId
DELETE /api/favorites/:channelId
```

La reproducción de streams sigue fuera de alcance.

## Estado de validación del starter

La versión de referencia aprobó compilación y 14 pruebas. Este starter deja intencionalmente incompletos los TODOs 1, 2 y 3. Por ello, `npm run build` falla hasta completar los métodos de Express y Mongoose. Las cuatro suites que importan `app.ts` fallan por la ruta POST incompleta; la prueba aislada del parser M3U conserva 2 pruebas exitosas. Los TODOs 4, 5 y 6 se manifiestan en el navegador cuando se completa el backend.
