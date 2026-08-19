# DupSweep — Roadmap

Do the list **in order**. Tick an item when it ships, then start the next one. Do not start cloud login before step 7.

Compared to **FileLister v1.21.0** (last native Swift macOS app before the Tauri rewrite). DupSweep already has local Files / Folders / Photos, Windows, license, site, and Stripe **test** checkout.

Status in the detail tables below: ✅ Done · 🚧 In progress · 📋 Planned · ⏸ On hold

Update this file when something lands or a plan changes.

```mermaid
timeline
    title Implement in this order
    1 : Ignore flag
    2 : Keep rules
    3 : Photos size filter
    4 : Auto-scan
    5 : Screenshots
    6 : Stripe live
    7 : Sign installers
    8 : OneDrive Files
    9 : OneDrive Folders
    10 : OneDrive Photos
```

---

## Queue

- [ ] **1. Ignore flag** — per file, skip that copy in Clean All without deleting it (FileLister v1.1).
- [ ] **2. Keep rules** — Files mode: keep oldest / newest / largest / manual (Photos already have keeper priority).
- [ ] **3. Photos size filter** — min/max size, same as Files (FileLister v1.19).
- [ ] **4. Auto-scan** — start a search when the user adds a folder (FileLister v1.1).
- [ ] **5. Screenshots** — you provide captures; put them on `/`, `/mac`, `/windows`, `/photos`, Help, and `og-image`.
- [ ] **6. Stripe live** — live keys and webhooks, then one real 5€ purchase. Still test mode today.
- [ ] **7. Sign / notarize installers** — so Gatekeeper and SmartScreen stop warning.
- [ ] **8. OneDrive Files** — Entra + OAuth, folder picker, cloud file duplicates, delete to OneDrive recycle bin. Do **not** advertise login on the site until this works.
- [ ] **9. OneDrive Folders** — cluster + in-place merge + copy to new folder (FileLister v1.13 / v1.17).
- [ ] **10. OneDrive Photos** — Graph thumbnails + pHash (FileLister v1.21). Then Local/Remote bar and multi-account if needed.

PayPal and automated Hub deploys stay **off** this list on purpose.

---

## Already in DupSweep (local)

These match FileLister’s local product, plus Windows. Do not redo.

| Feature | Status | Notes |
|---|---|---|
| Files / Folders / Photos modes | ✅ | Same 3-mode shell |
| SHA-256 file duplicates (name+size, then hash) | ✅ | Byte-verified before delete |
| Deep Scan, Media-only, No Hidden, Symlinks | ✅ | Files options |
| Confidence scoring | ✅ | 5-signal score on file groups |
| Folder clustering + match-ratio slider | ✅ | Union-find on content hashes |
| Folder merge: in-place, copy to new folder, review one-by-one, merge all, rename kept | ✅ | Collision-aware copy/merge |
| Collapsible folder clusters | ✅ | |
| Photos: dHash + pHash, EXIF corroboration, keeper, export keepers | ✅ | Ideas item “Similar Image Detection” is **done** — stale on the ideas board |
| Best-copy keeper priority (Settings) | ✅ | |
| Size filter (Files) | ✅ | |
| Include/exclude folders & extensions | ✅ | Session filters |
| Multi-folder scan (across / within) | ✅ | |
| Space preview (in-app) | ✅ | Not native Finder Quick Look |
| Safety lock (cannot trash last copy) | ✅ | |
| Undo (⌘Z / Ctrl+Z) + operation history | ✅ | |
| Logs JSON + HTML + PDF | ✅ | |
| Trial (15 deletions) + email-bound lifetime key | ✅ | Same algorithm as license-service |
| Help window | ✅ | Text only — no annotated screenshots |
| Windows + universal macOS | ✅ | FileLister was macOS-only |
| Scan OneDrive **folder on disk** | ✅ | No Microsoft login; online-only files must be downloaded first |

---

## Missing vs FileLister (to implement)

### Local — small / high value (queue 1–4, plus later polish)

Port these from FileLister before cloud work.

| Feature | Queue | Status | FileLister | Notes |
|---|---|---|---|---|
| Ignore flag per file | 1 | 📋 | ✅ v1.1 | Exclude a copy from Clean All without deleting it |
| Auto-select keep rules (oldest / newest / largest / manual) | 2 | 📋 | ✅ | Files mode only; Photos already have keeper priority |
| Photos min/max size filter | 3 | 📋 | ✅ v1.19 | Size filter is Files-only today |
| Auto-scan when a folder is added | 4 | 📋 | ✅ v1.1 | DupSweep waits for “Search for Duplicates” |
| Merge composition pie chart | after 10 | 📋 | ✅ v1.15 | Merge sheets have counts, no pie |
| Help with annotated screenshots | 5 | 📋 | ✅ v1.3 | Needs real UI captures |
| Native Quick Look (macOS) | after 10 | 📋 | ✅ | Optional polish; in-app preview exists |

### Cloud login — later (queue 8–10)

FileLister’s OneDrive stack. DupSweep site must **not** claim this until it ships. Order: **Files → Folders → Photos** (same as FileLister). Do not start before queue step 7.

| Feature | Queue | Status | FileLister | Notes |
|---|---|---|---|---|
| Entra app + OAuth (PKCE / device code) | 8 | 📋 | ✅ v1.11 | First step of OneDrive Files |
| Connect / sign out, account display | 8 | 📋 | ✅ | |
| Cloud folder picker | 8 | 📋 | ✅ v1.12 | |
| Scan limits (max files / max GB) | 8 | 📋 | ✅ | |
| OneDrive **Files** duplicates + delete to cloud recycle bin | 8 | 📋 | ✅ v1.11–1.12 | Use `quickXorHash` (not SHA-256) for cloud content |
| OneDrive **Folders** cluster + in-place merge + copy-to-new-folder | 9 | 📋 | ✅ v1.13 / v1.17 | |
| OneDrive **Photos** via Graph thumbnails + pHash | 10 | 📋 | ✅ v1.21 | |
| Local / Remote mode bar | 10 | 📋 | ✅ v1.17 | UI already shows a Local-only stub |
| Multi-connection (Keychain, picker, Settings) | 10 | 📋 | ✅ v1.18 | After single-account OneDrive works |
| Unified local + cloud duplicate report | after 10 | 📋 | partial | FileLister kept modes separate; a combined report is extra |

### Never built in FileLister either (don’t start yet)

| Feature | Status | Notes |
|---|---|---|
| Google Drive provider | 📋 | FileLister #8 — after OneDrive abstraction works |
| iCloud Drive API (not the on-disk folder) | 📋 | Ideas board |
| Dropbox | 📋 | Ideas board |
| FTP/FTPS | 📋 | FileLister #9 |
| Protect locally-synced files from remote delete | 📋 | FileLister #13 |
| Safe merge cloud → **local** folder | 📋 | FileLister deferred |

---

## Ideas board (beyond FileLister parity)

Nice-to-haves from VibeCoding Ideas. Not required to match FileLister. Only after queue 10.

| Feature | Status | Notes |
|---|---|---|
| Storage analytics dashboard | 📋 | Status bar already shows session savings |
| Scheduled auto-scans + notifications | 📋 | |
| Scan report export (PDF / CSV) | 📋 | Operation logs already exist (JSON/HTML/PDF) — this is a user-facing report |
| Finder / Explorer Quick Action | 📋 | |
| Duplicate music / audio fingerprinting | 📋 | |
| Smart exclusion presets | 📋 | Filters exist; presets do not |
| SHA-256 edge-case fixes | 📋 | Investigate against real reports |

---

## Site & selling (dupsweep.com / Hub)

| Item | Queue | Status | Notes |
|---|---|---|---|
| Landing page + Buy Widget + 5€ Stripe **test** checkout | — | ✅ | |
| FAQ (6 visible + more) | — | ✅ | |
| `/mac` `/windows` `/photos` | — | ✅ | Screenshot placeholders |
| SEO basics (www, canonical, sitemap, schema, README) | — | ✅ | |
| Contact / Feature Request form | — | ✅ | |
| OneDrive **folder** called out on the site | — | ✅ | Honest: on-disk only |
| Real UI screenshots on the site + `og:image` | 5 | 📋 | Waiting on captures |
| Stripe **live** keys / real 5€ purchases | 6 | 📋 | Next when ready to sell |
| Sign / notarize installers | 7 | 📋 | Gatekeeper / SmartScreen warn today |
| PayPal | — | ⏸ | After live Stripe; off the numbered queue on purpose |
| Automate Hub / license-service deploys | — | ⏸ | Manual rsync on purpose; off the numbered queue |

---

## After 10 (only then)

Merge pie chart · native Quick Look · Google Drive / iCloud API / Dropbox · dashboard · scheduled scans · Finder extension · audio fingerprinting · exclusion presets · unified local+cloud report · FTP · related FileLister backlog items above.

---

*Compared to FileLister v1.21.0. DupSweep is the Tauri rewrite (Mac + Windows), not a line-by-line port.*
