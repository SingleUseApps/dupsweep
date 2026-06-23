# DupSweep 🧹

Find and safely remove duplicate **files**, duplicate **folders**, and visually similar **photos** — on macOS **and** Windows. Built with Tauri (Rust backend + React frontend); everything runs on-device.

DupSweep is a clean rebuild of [FileLister-Tauri](https://github.com/luisdanielsilva/FileLister-Tauri): the proven Rust engines carried over, with a fresh, decomposed frontend (state in hooks behind a single context store; thin presentational components).

## Features
- **Files** — duplicate detection by name+size, verified with SHA-256; media/hidden/symlink filters; 5-signal confidence scoring; byte-verified deletion to the system Trash; batch "Clean All".
- **Folders** — duplicate-folder clustering (union-find on content hashes); in-place merge, safe "copy to new folder" merge, Review One-by-One, Merge All.
- **Photos** — visual similarity via perceptual hashing (dHash + pHash) with optional EXIF corroboration; configurable best-copy keeper; export keepers.
- **Safety & history** — in-app Undo (⌘Z / Ctrl+Z), JSON+HTML+PDF operation logs, an Operation History viewer, ↑/↓ navigation + Space preview, include/exclude + size filters, and the trial/licensing system.

## Architecture
```
src-tauri/src/   models · scan · photos · ops · logger · license · lib (commands)   ← Rust engines
src/
  api.js                 invoke() wrappers + events + pickers
  lib/                   pure, unit-tested helpers (paths, scanFilter, sections)
  store/                 AppProvider (all state + actions) + useLicense / useFilters
  components/            thin presentational + container components consuming useApp()
```

## Develop
Requires [Node.js](https://nodejs.org) and the [Rust toolchain](https://rustup.rs).
```bash
npm install
npm run tauri dev                                  # run the app
npm test                                           # frontend tests (Vitest)
cargo test --manifest-path src-tauri/Cargo.toml    # engine tests
npm run tauri build                                # build a local installer
```

## Releases
Push a version tag (`git tag v1.0.0 && git push --tags`) — the workflow runs the tests, builds the universal-macOS + Windows installers, and publishes a GitHub Release with stable download links (`DupSweep-macos.dmg`, `DupSweep-windows-setup.exe`). Installers are unsigned for now (Gatekeeper/SmartScreen will warn on first launch).

---
*By Luís Silva.*
