# TV Hub — AGENTS.md

## Propósito

TV Hub V4 es la versión final completa para docente de un proyecto universitario sobre Node.js, Express, TypeScript, MVC, MongoDB, Mongoose, Docker, JWT, sesiones y testing.

V1 proporciona autenticación; V2, canales; V3, Favorites; y V4 incorpora Live TV, reproducción e importación de playlists locales.

La rama local tv-hub-v4-base es una variante Student Starter derivada de la versión final V4. En esa variante, solo el flujo MVC de Watch contiene TODOs intencionalmente incompletos para Práctica Integradora 1.

Antes de modificar código, lee este archivo y la documentación relevante de docs, inspecciona la implementación existente, conserva los flujos de V1 a V4 y mantén el código pequeño, explícito y apto para explicar en clase.

## Arquitectura obligatoria

    View (src/public)
        ↓ HTTP / fetch
    Routes
        ↓
    Middleware cuando sea necesario
        ↓
    Controllers
        ↓
    Mongoose Models
        ↓
    MongoDB

La View usa HTML, CSS y JavaScript vanilla. El navegador nunca se comunica con MongoDB directamente.

No agregar Service, Repository, DTO, Dependency Injection, Clean Architecture, Hexagonal Architecture, frameworks frontend, paginación compleja, colecciones separadas de Country/Category ni abstracciones innecesarias.

## Responsabilidades

- Routes: endpoints y middleware.
- Controllers: request, validación, consultas directas de Mongoose y respuesta.
- Models: schema, validaciones, índices y timestamps.
- Middleware: autenticación, autorización y errores.

Prefiere operaciones directas y visibles como Channel.find(), Channel.findOne() y Favorite.findOneAndDelete().

## Alcance V4 final

- Home agrupa canales activos por país, muestra un máximo de cinco y permite filtrar por categoría.
- Favorites permite búsqueda por nombre y orden por nombre o fecha en que se agregó el favorito.
- Country muestra todos los canales de un país, con búsqueda y orden simples en cliente.
- Watch obtiene un canal mediante GET /api/channels/:id y usa Shaka Player para HLS/DASH.
- El player tiene solamente estados Loading, Playing y Error con Retry.
- El parser M3U y scripts de importación se ejecutan solo en backend.
- npm run import:channels recibe archivo y país e importa o actualiza una playlist.
- npm run import:all-channels limpia Channels y Favorites e importa todas las playlists de docs.

No implementar proxy de streaming, EPG, historial, recomendaciones, WebSockets, panel administrativo, subida M3U en navegador, controles propios de player ni intentos de evadir CORS, geobloqueos o headers requeridos por servidores remotos.

## Modelo Channel

Los campos principales son name, logoUrl, streamUrl, country, categories, isActive y timestamps. Los metadatos opcionales de playlist son tvgId, streamType, httpReferrer y httpUserAgent.

No hacer consultas a APIs externas para inferir el país. El país proviene explícitamente del comando de importación o del nombre conocido de una playlist local en la importación masiva.

## Validación

Antes de terminar ejecutar npm run build, npm test, docker compose config y docker compose up -d. Verificar también /health, /ready, una importación M3U y los flujos visuales principales.

En la variante tv-hub-v4-base, build y las pruebas que importan app pueden fallar intencionalmente hasta que se completen los TODOs 1 a 4. La versión final completa no tiene esos TODOs.
