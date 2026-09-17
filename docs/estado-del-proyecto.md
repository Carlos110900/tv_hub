# Estado del proyecto — TV Hub

Última actualización: 17 de septiembre de 2026.

Este documento permite retomar el trabajo aunque cambie la sesión de Codex o se cierre la terminal.

## Estado actual

- Los servidores de Express y MongoDB están detenidos.
- `master` conserva la versión completa e instructora de TV Hub V2, sin importación ni parsing M3U.
- La rama publicada para estudiantes es `origin/tv-hub-v2-channels`.
- La rama local actual es `tv-hub-v2-channels` y tiene cambios todavía sin publicar, incluida la solución completa de los TODOs de sesión 11.

## Ramas relevantes

| Rama | Estado | Commit principal | Contenido |
| --- | --- | --- | --- |
| `master` | Local | `dd1ea15` | V2 instructora: autenticación V1, canales, seed, API, búsqueda y tarjetas; sin M3U. |
| `tv-hub-v2-channels` | Remota y local | `517ce38` en `origin` | Starter de sesión 11 con TODOs pequeños para canales. |
| `tv-hub-v2-channels` | Solo local, pendiente de push | `e65c4c1` | Versión completa de los TODOs, con comentarios `TODO X implementado`; también hay documentación local pendiente. |
| `tv-hub-v2-b` | Local | `f4d8e76` | Variante avanzada: canales más importador M3U local. |
| `tv-hub-v2-b-ui-alt` | Local | `fbb6139` | Variante avanzada con importador M3U y UI alternativa azul. |

## Starter de sesión 11

La rama remota `tv-hub-v2-channels` sirve para clase. Conserva la arquitectura MVC y pide completar piezas pequeñas:

1. recuperar canales con Mongoose;
2. mostrar nombre;
3. mostrar logo;
4. convertir categorías a texto;
5. conectar búsqueda.

También incluye dos misiones opcionales: país y ordenamiento por nombre.

La solución completa está en el commit local `e65c4c1`; no se ha publicado por decisión del docente.

## Datos de canales

El repositorio contiene 20 canales didácticos en `src/data/channels.sample.ts`. Cada estudiante debe iniciar MongoDB y cargar sus propios datos:

```bash
docker compose up -d
npm run build
npm run seed:channels
npm run dev
```

El comando `npm run seed:channels` reemplaza la colección `channels` por esos 20 ejemplos locales.

Los 176 canales de Argentina importados anteriormente no están en Git ni se comparten con los alumnos. Existen solamente en el volumen local de MongoDB y provienen de un archivo M3U local ignorado por Git.

## Variante avanzada M3U

La importación M3U queda fuera de `master` y de `tv-hub-v2-channels`. Solo existe en las ramas de referencia `tv-hub-v2-b` y `tv-hub-v2-b-ui-alt`.

En una de esas ramas, el uso es:

```bash
npm run build
npm run import:m3u -- docs/argentina_playlist.m3u Argentina
```

No fusionar esas ramas con `master` ni con la rama de estudiantes si se desea conservar el alcance didáctico simple de V2.

## Validación de la versión completa local

El commit local `e65c4c1` fue validado con:

```text
npm run build          ✓
npm test               ✓ 3 suites, 9 tests
docker compose config  ✓
GET /health            ✓
GET /ready             ✓
GET /api/channels      ✓
```

## Próximos pasos

- Para impartir la sesión: usar `origin/tv-hub-v2-channels` y no publicar `e65c4c1` todavía.
- Para mostrar la solución: ejecutar la rama local actual y sembrar los 20 canales didácticos si se desea una base limpia.
- Para publicar la solución en el futuro: revisar y ejecutar `git push origin tv-hub-v2-channels` desde la rama local actual.
