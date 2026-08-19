# DupSweep

**Duplicate file, folder & photo cleaner for Mac and Windows.**

Stop guessing which files are safe to delete. DupSweep verifies every match byte-for-byte — every deletion is recoverable. Scans run on your machine; file contents are not uploaded.

**Website:** [www.dupsweep.com](https://www.dupsweep.com/) · [Mac](https://www.dupsweep.com/mac/) · [Windows](https://www.dupsweep.com/windows/) · [Photos](https://www.dupsweep.com/photos/)

**Download**
- [macOS (Universal)](https://github.com/SingleUseApps/dupsweep/releases/latest/download/DupSweep-macos.dmg)
- [Windows](https://github.com/SingleUseApps/dupsweep/releases/latest/download/DupSweep-windows-setup.exe)

Free trial — 15 deletions. **5€** one-time lifetime license (card, MB WAY, Klarna, Amazon Pay, and more). Same license on your Mac and PC.

## Features

- **SHA-256 verified files** — duplicates are confirmed byte-for-byte, not by name or size alone.
- **Duplicate folder clustering** — finds whole duplicated folder structures, with in-place or copy-based merge.
- **Visual photo similarity** — perceptual hashing (dHash + pHash) catches near-duplicates, not just identical copies.
- **Undo, always** — deletions go to the system Trash / Recycle Bin, with in-app Undo and operation history.
- **OneDrive folder** — scan the OneDrive folder on disk like any other path (make online-only files available locally first).

More detail: [FAQ on the site](https://www.dupsweep.com/#faq). Support: [support@dupsweep.com](mailto:support@dupsweep.com).

## Architecture

Built with Tauri (Rust backend + React frontend). DupSweep is a rebuild of [FileLister-Tauri](https://github.com/luisdanielsilva/FileLister-Tauri): the Rust engines carried over, with a decomposed frontend (state in hooks behind a single context store; thin presentational components).

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

[www.dupsweep.com](https://www.dupsweep.com/) · [Single Use Apps](https://singleuseapps.com/)
