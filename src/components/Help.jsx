import { useState } from "react";
import { Icon } from "../icons";

const SECTIONS = [
  { id: "welcome", label: "Welcome to DupSweep", icon: "shield" },
  { id: "files", label: "Files at a Glance", icon: "doc" },
  { id: "folders", label: "Folder Duplicates & Merging", icon: "folderQ" },
  { id: "photos", label: "Duplicate Photos", icon: "photo" },
  { id: "tools", label: "Search Tools", icon: "search" },
  { id: "history", label: "Undo, History & Licensing", icon: "lock" },
];

function Feature({ icon, color, title, body }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
      <span style={{ color: `var(--${color})`, marginTop: 1 }}><Icon name={icon} size={18} /></span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--secondary)", lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  );
}

export function HelpWindow({ onClose }) {
  const [section, setSection] = useState("welcome");

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" style={{ width: 820, height: 600, padding: 0, display: "flex", flexDirection: "row" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 230, borderRight: "1px solid var(--border)", padding: 12, overflowY: "auto" }}>
          <div style={{ fontWeight: 700, fontSize: 14, padding: "4px 8px 10px" }}>Help</div>
          {SECTIONS.map((s) => (
            <button key={s.id} className={`section-head`} style={{ background: section === s.id ? "rgba(0,122,255,0.12)" : "transparent", marginTop: 2 }} onClick={() => setSection(s.id)}>
              <Icon name={s.icon} size={13} /> {s.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>
          {section === "welcome" && (
            <>
              <h2 style={{ fontSize: 22 }}>Welcome to DupSweep</h2>
              <p style={{ marginBottom: 18 }}>DupSweep scans any folder and finds duplicate <b>files</b>, duplicate <b>folders</b>, and visually similar <b>photos</b>. All processing is on-device — nothing leaves your machine. Built with Tauri to run identically on macOS and Windows.</p>
              <Feature icon="shield" color="indigo" title="Deep Scan (SHA-256)" body="Byte-level content comparison ensures zero false positives — matches go beyond filename and size." />
              <Feature icon="trash" color="red" title="Safe deletion" body="Files move to the system Trash, never permanently deleted. One copy per group is always locked." />
              <Feature icon="play" color="green" title="Undo" body="Press ⌘Z (Ctrl+Z on Windows) right after a delete or merge to restore from Trash." />
              <Feature icon="sparkles" color="orange" title="Space recovery tracking" body="The status bar shows potential savings and space actually freed this session." />
              <p style={{ marginTop: 4 }}>Use the sidebar to jump straight to a mode, or to <b>Search Tools</b> and <b>Undo, History & Licensing</b> for features shared across all three.</p>
            </>
          )}
          {section === "files" && (
            <>
              <h2>Files mode</h2>
              <p style={{ marginBottom: 18 }}>Finds files with identical content. Add one or more folders, then press <b>Search for Duplicates</b>.</p>
              <Feature icon="shield" color="indigo" title="Deep Scan" body="Verifies candidate duplicates with SHA-256 hashing, not just name and size." />
              <Feature icon="photo" color="orange" title="Media" body="Restrict the scan to photo and video files only." />
              <Feature icon="eyeSlash" color="gray" title="No Hidden" body="Skip dotfiles and other hidden files." />
              <Feature icon="link" color="purple" title="Symlinks" body="Also group symlinks that point at the same target file." />
              <Feature icon="check" color="blue" title="Keep rule" body="Choose Manual (pick which copy to delete yourself), or auto-select Oldest, Newest, or Largest — the picked copy is marked ★ KEEPER in each group." />
              <Feature icon="check" color="green" title="Confidence scoring" body="Each group gets a % score from five signals (folder similarity, naming, timestamps, path proximity, copy count). Hover the badge for a breakdown." />
              <Feature icon="check" color="gray" title="Ignore flag" body="Check a copy's Ignore box to exclude it from Clean All without deleting it. Ignored rows are greyed out; uncheck to include them again." />
              <Feature icon="trash" color="red" title="Clean All Duplicates" body="Batch-removes every redundant copy after a byte-for-byte safety re-check. Ignored copies are left alone. Requires a license." />
              <Feature icon="upload" color="green" title="Copy keepers to…" body="Copy each group's keeper file into a folder you choose, preserving the original folder structure. Originals untouched." />
            </>
          )}
          {section === "folders" && (
            <>
              <h2>Folder Duplicates & Merging</h2>
              <p style={{ marginBottom: 18 }}>Detects folders whose contents largely overlap and merges them safely.</p>
              <Feature icon="folderQ" color="indigo" title="Match threshold" body="Two folders cluster when their shared-content ratio meets the slider value (default 75%)." />
              <Feature icon="photo" color="orange" title="Media / No Hidden" body="Same scan restrictions as Files mode — photo/video only, or skip hidden files." />
              <Feature icon="chevDown" color="gray" title="Collapsible clusters" body="Click the chevron on a cluster to collapse or expand its details." />
              <Feature icon="docDoc" color="green" title="Copy to new folder" body="Non-destructive: writes the merged result into a new folder and leaves all originals untouched, instead of merging in place." />
              <Feature icon="check" color="gray" title="Rename kept folder" body="When merging in place, optionally rename the kept folder, combining both folder names." />
              <Feature icon="play" color="indigo" title="Review One-by-One" body="Step through each cluster and approve or skip individually before anything changes." />
              <Feature icon="merge" color="indigo" title="Merge & Clean / Merge All" body="Moves unique files into the keep folder, then trashes the others — one cluster at a time or all at once. Preview the exact plan first." />
              <Feature icon="drive" color="orange" title="Saves" body="Each cluster shows the space its merge would reclaim." />
            </>
          )}
          {section === "photos" && (
            <>
              <h2>Duplicate Photos</h2>
              <p style={{ marginBottom: 18 }}>Finds visually similar photos using perceptual hashing (dHash + pHash), even across resolutions and re-encodes.</p>
              <Feature icon="photo" color="indigo" title="Similarity slider" body="Lower it to group looser matches; raise it for near-identical only." />
              <Feature icon="shield" color="orange" title="EXIF corroboration" body="Require a metadata match (capture time, or camera + dimensions) before grouping, reducing false positives." />
              <Feature icon="sparkles" color="orange" title="Expand by metadata" body="After grouping by appearance, also pull in photos sharing Time (within 2s), GPS (within 50m), or Camera model with a photo already in the group." />
              <Feature icon="check" color="green" title="Best-copy keeper" body="The keeper is chosen by a configurable priority — resolution, file size, capture date, RAW, GPS. Reorder it from the Settings (filter icon) in the top bar." />
              <Feature icon="check" color="blue" title="Keep this instead" body="Override the keeper per group; the button shows how similar that photo is to the current keeper." />
              <Feature icon="upload" color="green" title="Copy keepers to…" body="Copy just the keepers to a new folder, preserving the original structure. Originals untouched." />
              <Feature icon="trash" color="red" title="Delete all non-keepers" body="Move every non-keeper photo to Trash across all groups, in one batch." />
            </>
          )}
          {section === "tools" && (
            <>
              <h2>Search Tools</h2>
              <p style={{ marginBottom: 18 }}>Shared across Files, Folders, and Photos.</p>
              <Feature icon="folderPlus" color="blue" title="Add folder(s)" body="Click the folder icon (or the Add Folder… button) to choose where to search. Folders synced to disk by cloud services like OneDrive work too — no login needed." />
              <Feature icon="stack" color="indigo" title="Across all / Within each" body="With 2+ folders added, choose whether to pool them into one search or scan each independently." />
              <Feature icon="filter" color="gray" title="Filters" body="Exclude folders by name, restrict to specific extensions, or exclude extensions — plus a min/max size range. Applied instantly, session-only." />
              <Feature icon="chevDown" color="gray" title="Sort results" body="Sort groups by number of copies, size, or folder match ratio." />
              <Feature icon="doc" color="purple" title="In-app preview" body="Select a row and press Space to preview an image, video, or text file without leaving DupSweep. Arrow keys move between rows." />
            </>
          )}
          {section === "history" && (
            <>
              <h2>Undo, History & Licensing</h2>
              <p style={{ marginBottom: 18 }}>Safety nets and account details, all in the top bar.</p>
              <Feature icon="lock" color="red" title="Safety lock" body="The last remaining copy in a group can never be trashed — its delete button locks instead." />
              <Feature icon="play" color="green" title="Undo" body="Press ⌘Z (Ctrl+Z on Windows), or the Undo button, right after a delete or merge to restore it from Trash." />
              <Feature icon="reveal" color="indigo" title="Operation History" body="Every delete, merge, or export writes a report here. Open it as HTML or PDF, or reveal it in Finder/Explorer." />
              <Feature icon="shield" color="orange" title="Trial & License" body="The free trial allows 15 deletions. Register with the email and key from your purchase (top bar → Register App) for unlimited use." />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
