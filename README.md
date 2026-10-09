# GlitchDOS

A DOS games launcher that runs entirely in your browser, designed to work on any device, including iPad and phones. Install your own games as `.zip` bundles, launch them with [js-dos](https://js-dos.com), and keep your games, configuration and save files stored locally on your device.

**Live demo:** https://imangas.github.io/glitch-dos-ipad/

> GlitchDOS does not include or distribute any games. You are responsible for providing games you legally own or that are freely distributable.

## Features

- **Runs in the browser.** No server, no accounts, no installation. Everything is static files.
- **Local storage with OPFS.** Games, per-game configuration and save files live in the browser's Origin Private File System, so nothing leaves your device.
- **Per-game configuration.** Edit the display name, wallpaper, DOSBox config (`dosbox.conf`), save file paths and emulator options from the in-app setup screen.
- **Reset to defaults.** Restore any game's configuration to the defaults shipped with the repository.
- **Save game support.** Export the in-game save file from the emulator to OPFS and have it injected back into the bundle on the next launch.
- **Easy installation.** Pick a `.zip` bundle and, if the game is unknown, give it a key and it gets registered with a copy of the generic configuration.
- **Responsive UI.** Sidebar and detail panels adapt to desktop, tablet and phone layouts, with touch-friendly controls.
- **Installable and offline-ready.** A service worker caches the app shell and its dependencies, so it works as a PWA without a connection.

## How it works

1. **Install a game.** Click `[+] INSTALL NEW GAME` and select a `.zip` file. It is written to OPFS as `<key>.zip`.
2. **Configuration lookup.** The `<key>` is used to look up the game in `window.gamesData`. On first run, the defaults from `js/games-config.js` are copied to OPFS as `games-config.json`; on later runs, the OPFS copy is the one that is loaded, so your edits persist.
3. **Launch.** The bundle is opened in memory with [JSZip](https://stuk.github.io/jszip/), the configured `dosbox.conf` is injected into it, any previous save file is added, and the result is handed to js-dos.
4. **Save.** The `SAVE GAME` button reads the save file from the running emulator and stores it under `savegames/<opfsSaveFilePath>/` in OPFS.

### Game configuration format

Each entry in `js/games-config.js` looks like this:

```js
"sc2000": {
  "name": "SimCity 2000",
  "description": "City building simulator.",
  "wallscroll": "./assets/simcity.png",
  "company": "Maxis",
  "dosSaveFilePath": ".",
  "dosSaveFileName": "GAME.SC2",
  "opfsSaveFilePath": "simcity2k",
  "dosboxConfig": "[autoexec]\nmount c .\nc:\nSC2000.EXE",
  "jsDos": {
    "mouseCapture": false
  }
}
```

| Field                | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `name`               | Display name shown in the library.                                |
| `description`        | Short text shown in the detail panel.                             |
| `wallscroll`         | Path or URL of the cover image.                                   |
| `company`            | Publisher or developer, shown on the game card.                   |
| `dosSaveFilePath`    | Folder inside the DOS filesystem where the game writes its saves. |
| `dosSaveFileName`    | Name of the save file inside the DOS filesystem.                  |
| `opfsSaveFilePath`   | Folder name under `savegames/` in OPFS where the save is stored.  |
| `dosboxConfig`       | Contents of the `dosbox.conf` injected into the bundle at launch. |
| `jsDos.mouseCapture` | Whether js-dos should capture the mouse pointer.                  |

The `generic` entry is the fallback used for games without a specific entry and as the template for newly registered ones.

## Browser support

GlitchDOS needs a modern browser with support for the Origin Private File System, including writable file handles. Recent versions of Chromium-based browsers, Firefox and Safari (including iPadOS) are the target. Offline use additionally requires service worker support.

## Development

There is no build step: the site is plain HTML and ES modules served as static files.

```bash
git clone https://github.com/imangas/glitch-dos-ipad.git
cd glitch-dos-ipad
npm install
```

Serve the folder with any static server. A service worker requires `localhost` or HTTPS:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

### Scripts

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `npm run lint`     | Run ESLint over the project.          |
| `npm run lint:fix` | Run ESLint and apply automatic fixes. |
| `npm run format`   | Format the project with Prettier.     |

### Project structure

```
.
├── index.html            App shell and layout
├── sw.js                 Service worker (offline cache)
├── manifest.json         PWA manifest
├── js/
│   ├── main.js           Application logic
│   └── games-config.js   Default game configuration
├── assets/               Images and icons
└── .github/workflows/    CI and release automation
```

### Commits and releases

This project follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, ...). Releases are automated with [release-please](https://github.com/googleapis/release-please): merging its release pull request bumps the version, updates `CHANGELOG.md` and creates a GitHub release. The version string in `js/main.js` and the cache name in `sw.js` are kept in sync with `package.json` through `x-release-please-version` markers.

### Updating the offline cache

If you add files that must be available offline, list them in `ASSETS_TO_CACHE` in `sw.js`. The cache name includes the app version, so every release invalidates the previous cache.

## Credits

GlitchDOS would not exist without the work of the people behind these projects:

- **[DOSBox](https://www.dosbox.com/)** — the DOS emulator that made it possible to keep classic DOS games alive. Thanks to the DOSBox team and all of its contributors.
- **[js-dos](https://js-dos.com)** — created by Alexander Guryanov ([caiiiycuk](https://github.com/caiiiycuk)), which brings DOSBox to the browser through WebAssembly. GlitchDOS uses js-dos v8 to run every game. Source code: https://github.com/caiiiycuk/js-dos
- **[JSZip](https://stuk.github.io/jszip/)** — used to open game bundles and inject configuration and save files before launch.
- **[Tailwind CSS](https://tailwindcss.com/)**, **[Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)** and **[Material Symbols](https://fonts.google.com/icons)** — styling, typography and icons.

DOS and every game that runs on it belong to their respective authors and publishers.

## License

GlitchDOS is free software, released under the [GNU General Public License v2.0 or later](LICENSE) (GPL-2.0-or-later).

DOSBox, js-dos and the other dependencies listed in the credits are distributed under their own licenses; please refer to their repositories for the terms that apply to them.
