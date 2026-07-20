# Scarlet Curtain Theatre

Scarlet Curtain Theatre is a browser-based pocket repertory for NDS-inspired theatrical animation. It presents scripted miniature productions with a shared proscenium shell, pixel-textured scenery, live lighting, character performance, sound, and music.

Current programme:

- `Carmen` - Bizet's opera in a three-act miniature production.
- `The Red and the Black` - a three-chapter rock narrative inspired by Stendhal.

## Run locally

Requirements: Node.js 18 or newer.

```powershell
npm install
npm run build
npm run serve -- 8770
```

Open [http://127.0.0.1:8770/theatre-lobby/](http://127.0.0.1:8770/theatre-lobby/).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile all TypeScript sources. |
| `npm run typecheck` | Check all TypeScript sources without emitting files. |
| `npm run serve -- 8770` | Start the static development server. |
| `npm run build:carmen` | Compile the Carmen production layer. |
| `npm run build:redblack` | Compile The Red and the Black production layer. |

## Project layout

```text
shared/                       Shared engine, actors, lighting and theatre shell
programme/
  carmen/                     Carmen-specific scenery and production assets
  the-red-and-the-black/      Rock production scenery and production assets
theatre-lobby/                Programme selection and playback controls
productions.json              Manifest registry for all productions
```

The permanent theatre shell - proscenium, curtains, footlights, boxes, and orchestra pit - belongs to `shared/src/theatre-shell.ts`. Each production owns only its scenery, direction, narrative, audio, and visual theme.

## Add a production

1. Create `programme/<production-id>/` with an `index.html`, `manifest.json`, and production files.
2. Add the manifest path to `productions.json`.
3. Expose its available language options through the manifest.
4. Add its TypeScript project to `scripts/run-typescript.mjs` if it has TypeScript sources.

## License

Released under the [MIT License](LICENSE).
