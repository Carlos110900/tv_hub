# Session 10 — TV Hub V2 checkpoints

The instructor version is complete. For a classroom exercise, replace only the indicated working line with the suggested blank. Students should never need to design the whole feature from zero.

## MVC map

```text
MongoDB → src/models/channel.model.ts → src/controllers/channel.controller.ts
→ src/routes/channel.routes.ts → GET /api/channels → src/public/js/home.js
→ channel cards in src/public/index.html
```

## Checkpoint 1 — Retrieve channels

- File: `src/controllers/channel.controller.ts`
- Replace: `const channels = await Channel.find(filter).sort(sort);`
- Exercise: complete `const channels = await Channel.____(filter).sort(sort);`
- Expected result: `GET /api/channels` returns active channels as JSON.
- Difficulty: 5 minutes.
- Hint: Mongoose uses a method named `find` to retrieve many documents.

## Checkpoint 2 — Display the name

- File: `src/public/js/home.js`
- Exercise: complete the line that assigns `channel.name` to the card heading.
- Expected result: every card shows a channel name.
- Difficulty: 5 minutes.
- Hint: `element.textContent = channel.name` displays text safely.

## Checkpoint 3 — Display the logo

- File: `src/public/js/home.js`
- Exercise: complete the line that assigns `channel.logoUrl` to the image source.
- Expected result: every card shows its logo image.
- Difficulty: 5 minutes.
- Hint: image elements use the `src` property.

## Checkpoint 4 — Display categories

- File: `src/public/js/home.js`
- Exercise: complete the line that turns `channel.categories` into visible text.
- Expected result: category badges appear on every channel card.
- Difficulty: 10 minutes.
- Hint: arrays can be joined with `channel.categories.join(', ')`.

## Checkpoint 5 — Add search

- File: `src/public/js/home.js`
- Exercise: complete the URL query part in `loadChannels` so it sends the text from `#channel-search` as `search`.
- Expected result: searching `cine` asks the backend for matching channels and redraws the cards.
- Difficulty: 10–15 minutes.
- Hint: `new URLSearchParams({ search })` creates `?search=...`.
