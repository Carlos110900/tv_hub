# Session 11 — Import local M3U playlists

This optional activity imports teacher-provided M3U files into the existing `channels` collection. It does not download a playlist, test streams, or play video.

## Command

Build the project and start MongoDB first. Then provide a local file path and the country name to save on its channels:

```bash
npm run build
npm run import:m3u -- docs/argentina_playlist.m3u Argentina
```

Examples for later files:

```bash
npm run import:m3u -- docs/mexico_playlist.m3u Mexico
npm run import:m3u -- docs/canada_playlist.m3u Canada
npm run import:m3u -- docs/usa_playlist.m3u "United States"
```

Importing a country again replaces only the channels already stored with that same `country` value. Channels from other countries remain in MongoDB.

## What the parser reads

```text
#EXTINF ... tvg-logo="..." group-title="News;General",Channel name
https://server.example/stream.m3u8
```

| M3U value | Channel field |
| --- | --- |
| Channel name after the final comma | `name` |
| `tvg-logo` | `logoUrl` |
| Next `http://` or `https://` line | `streamUrl` |
| Command argument | `country` |
| `group-title`, split by `;` | `categories` |

The parser ignores comments and options such as `#EXTVLCOPT`. V2 stores stream URLs but does not use them for playback.
