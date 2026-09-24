# Session 11 — Import local M3U playlists

Esta actividad importa playlists M3U locales a la colección channels. El navegador no lee archivos M3U: el parser y los scripts viven en el backend.

## Importar una playlist

Construya el proyecto e inicie MongoDB. Después indique el archivo y el país:

    npm run build
    npm run import:channels -- docs/argentina_playlist.m3u Argentina

El script inserta o actualiza cada canal. Usa country más tvgId si existe tvg-id; de lo contrario usa country más streamUrl. Repetir el mismo comando no crea duplicados.

## Importar todas las playlists de docs

    npm run build
    npm run import:all-channels

Este comando reconoce los archivos con sufijo _playlist.m3u en docs, limpia primero favorites y channels, e importa todos los canales. Users y Sessions no se eliminan.

## Qué lee el parser

    #EXTINF:-1 tvg-id="news.ar" tvg-logo="..." group-title="News;General",News Argentina
    #EXTVLCOPT:http-user-agent=Example Browser
    https://server.example/stream.m3u8

- Nombre después de la última coma: name.
- tvg-id: tvgId.
- tvg-logo: logoUrl.
- Siguiente URL HTTP/HTTPS: streamUrl.
- País del comando: country.
- group-title separado por punto y coma: categories.
- URL .m3u8 o .mpd: streamType HLS o DASH.
- http-referrer y http-user-agent: metadatos opcionales.

El parser conserva los metadatos presentes en EXTINF o EXTVLCOPT. No descarga playlists, no prueba streams ni analiza segmentos de video.

Los metadatos referrer y user-agent pueden explicar el origen de un stream, pero el navegador no puede establecerlos libremente. V4 no implementa proxy para saltar esas restricciones.
