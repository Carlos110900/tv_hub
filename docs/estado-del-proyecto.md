# Estado del proyecto — TV Hub

Última actualización: 21 de septiembre de 2026.

Este documento permite retomar el trabajo aunque cambie la sesión de Codex o se cierre la terminal.

## Estado actual

- La rama local actual es `tv-hub-v2-b-ui-alt`.
- Esta rama integra la solución de Session 11 con la UI azul inspirada en Spotify y el importador M3U local.
- No se ha enviado ningún cambio remoto como parte de esta integración.

## Ramas relevantes

| Rama | Estado | Commit principal | Contenido |
| --- | --- | --- | --- |
| `master` | Sin modificar | `dd1ea15` | Base V2 instructora con autenticación, seed, API y tarjetas; sin M3U. |
| `tv-hub-v2-channels` | Sin modificar | `bd11cc7` | Solución local de Session 11 para Channels. |
| `tv-hub-v2-b-ui-alt` | Actual | `502c315` | Merge de Session 11 con UI alternativa azul, categorías e importación M3U local. |

## Session 11 — Channels

La guía `docs/session-11-student-checkpoints.md` conserva los checkpoints didácticos para explicar:

1. recuperar canales con Mongoose;
2. mostrar nombre;
3. mostrar logo;
4. convertir categorías a texto;
5. conectar búsqueda.

También incluye dos misiones opcionales: país y ordenamiento por nombre.

La solución completa está integrada en la rama actual.

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
npm test               ✓ 4 suites, 11 tests
docker compose config  ✓
docker compose up -d   ✓
npm run seed:channels  ✓ (20 canales)
GET /health            ✓
GET /ready             ✓
GET /api/channels      ✓ (búsqueda y filtros)
```

## Próximo alcance

La siguiente evolución propuesta es V3 — Discover & Favorites. No se han implementado favoritos ni reproducción de streams en esta rama.
