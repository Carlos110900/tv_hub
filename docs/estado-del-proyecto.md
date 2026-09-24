# Estado del proyecto — TV Hub

Última actualización: 24 de septiembre de 2026.

## Estado actual

- La rama local actual es tv-hub-v2-b-ui-alt.
- TV Hub V4, Instructor Edition, es la versión final completa de referencia.
- La rama local activa tv-hub-v4-base es una variante Student Starter creada a partir de esa versión para Práctica Integradora 1.
- La aplicación está detenida por solicitud del docente.
- MongoDB usa un volumen Docker persistente: al bajar contenedores, los canales importados permanecen hasta que se limpie la colección.

## V4 final y variante estudiante

La versión final V4 conserva la base MVC y los flujos completos de V1, V2 y V3:

- registro, login, refresh, logout, logout all, cookies HttpOnly y sesiones;
- Channels y filtros simples;
- Favorites autenticados;
- Home organizado por países, máximo cinco tarjetas por país y filtro por categoría;
- Favorites y Country con búsqueda y orden;
- estructura Watch, Shaka Player y estados de player;
- parser M3U y scripts locales de importación.

La variante estudiante deja incompletos únicamente ocho puntos de Watch: route, consulta Mongoose, not found, JSON, fetch, datos visuales, carga de Shaka y estados. La UI conserva la variante visual azul de TV Hub en Home, Favorites, Country, Watch, Login y Register.

## Datos de canales

Las playlists locales están en docs: argentina_playlist.m3u, canada_playlist.m3u, japon_playlist.m3u, mexico_playlist.m3u y usa_playlist.m3u.

Carga completa de referencia:

    docker compose up -d
    npm run build
    npm run import:all-channels
    npm run dev

El comando import:all-channels elimina los documentos de favorites y channels e importa todas las playlists. Mantiene users y sessions. La última carga importó 2,064 canales y dejó Favorites vacío.

Para una playlist individual:

    npm run import:channels -- docs/japon_playlist.m3u Japan

Ese comando actualiza en vez de duplicar, usando país más tvgId o, si falta, país más streamUrl.

## API relevante

- GET /api/channels
- GET /api/channels/:id
- GET /api/favorites
- POST /api/favorites/:channelId
- DELETE /api/favorites/:channelId

## Validación más reciente

- La versión final V4 aprobó npm run build y npm test con 5 suites y 16 pruebas.
- En la variante estudiante, build y las pruebas que importan app fallan intencionalmente hasta completar TODO 1 a TODO 4.
- docker compose config: correcto.
- /health y /ready: correctos.
- import:all-channels: correcto con 2,064 canales.

## Limitaciones conocidas

El reproductor intenta cargar streams externos directamente. CORS, geobloqueo, URLs expiradas, disponibilidad del servidor o headers como referrer/user-agent pueden impedir la reproducción. V4 muestra Error y permite Retry; no incluye proxy ni mecanismos para evadir dichas restricciones.
