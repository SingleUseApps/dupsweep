import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { formatBytes, openLicensePage } from "../api";

const KEEP_RULE_TEXT = {
  manual: "Keeping the first copy found in each group (Manual mode).",
  oldest: "Keeping the oldest copy in each group.",
  newest: "Keeping the newest copy in each group.",
  largest: "Keeping the largest copy in each group (often ties, since duplicates are byte-identical).",
};

export function CleanAllSheet({ count, bytes, groups, keepRule, onClean, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Clean All Duplicates?</h2>
        <p>
          This will delete <b>{count}</b> duplicate file{count === 1 ? "" : "s"} across <b>{groups}</b> group{groups === 1 ? "" : "s"}.
          <br />
          {KEEP_RULE_TEXT[keepRule] || KEEP_RULE_TEXT.manual}
        </p>
        <div className="stat-line"><span>Files to move to Trash</span><span className="big-num red">{count}</span></div>
        <div className="stat-line"><span>Space to recover</span><span className="big-num green">{formatBytes(bytes)}</span></div>
        <p>
          Each file is byte-for-byte verified before removal.
          <br />
          This is reversible: deleted files go to Trash, not permanently removed. Restore them from
          Trash anytime, or press ⌘Z (Ctrl+Z on Windows) right after cleaning to undo.
        </p>
        <div className="sheet-row">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary danger" onClick={onClean}>Move {count} to Trash</button>
        </div>
      </div>
    </div>
  );
}

export function CopyFileKeepersSheet({ count, onCopy, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Copy Keepers to…</h2>
        <p>
          This will copy <b>{count}</b> keeper file{count === 1 ? "" : "s"} — one per group — into a folder
          you choose, preserving the original folder structure.
          <br />
          <br />
          This only copies files. It never touches, moves, or deletes your original files.
        </p>
        <div className="sheet-row">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={onCopy}>Choose Folder…</button>
        </div>
      </div>
    </div>
  );
}

export function MergeSheet({ group, safeMerge, onMerge, onCancel }) {
  const removable = group.matched_groups.reduce((s, g) => s + Math.max(0, g.files.length - 1), 0);
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>{safeMerge ? "Copy Merged Result to New Folder?" : "Merge & Clean Folder Cluster?"}</h2>
        <div className="stat-line"><span>Unique files moved into keep</span><span className="big-num">{group.files_to_move.length}</span></div>
        <div className="stat-line"><span>Duplicate copies removed</span><span className="big-num red">{removable}</span></div>
        <div className="stat-line"><span>Space recovered</span><span className="big-num green">{formatBytes(group.potential_savings)}</span></div>
        <p>
          {safeMerge
            ? "Originals are left untouched. The merged result is written into the destination folder you chose."
            : "Other folders in the cluster are moved to Trash after their unique files are merged into the keep folder. Recoverable from Trash."}
        </p>
        <div className="sheet-row">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary indigo" onClick={onMerge}>{safeMerge ? "Create Merged Copy" : "Merge & Clean"}</button>
        </div>
      </div>
    </div>
  );
}

export function MergeAllSheet({ groups, safeMerge, onMergeAll, onCancel }) {
  const totalSavings = groups.reduce((s, g) => s + g.potential_savings, 0);
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>{safeMerge ? "Merge All Clusters to New Folders?" : "Merge All Folder Clusters?"}</h2>
        <div className="stat-line"><span>Clusters to merge</span><span className="big-num">{groups.length}</span></div>
        <div className="stat-line"><span>Total space recovered</span><span className="big-num green">{formatBytes(totalSavings)}</span></div>
        <p>
          {safeMerge
            ? "One merged subfolder is created per cluster in your destination. Originals untouched."
            : "Each cluster's other folders are moved to Trash after merging. Recoverable from Trash."}
        </p>
        <div className="sheet-row">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary indigo" onClick={onMergeAll}>Merge {groups.length} Cluster(s)</button>
        </div>
      </div>
    </div>
  );
}

export function PhotoDeleteSheet({ count, bytes, onConfirm, onCancel, all }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>{all ? "Delete All Non-Keepers?" : "Delete Other Photos in Group?"}</h2>
        <div className="stat-line"><span>Photos to move to Trash</span><span className="big-num red">{count}</span></div>
        <div className="stat-line"><span>Space to recover</span><span className="big-num green">{formatBytes(bytes)}</span></div>
        <p>The best copy (keeper) in each group is preserved. The rest move to the system Trash, recoverable later.</p>
        <div className="sheet-row">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary danger" onClick={onConfirm}>Move {count} to Trash</button>
        </div>
      </div>
    </div>
  );
}

export function LicenseSheet({ onValidate, onClose, registered, registeredName, onDeactivate }) {
  const [key, setKey] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    if (!email.trim()) { setError("Enter the email your license key was issued to."); return; }
    const ok = await onValidate(key.trim(), email.trim());
    if (!ok) setError("Invalid license key or email. Check the key format: XXXX-XXXX-XXXX-XXXX-XXXX-XXXXXX");
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>License Key</h2>
        {registered ? (
          <>
            <p>Licensed to <b>{registeredName}</b>. Thank you for supporting DupSweep.</p>
            <div className="sheet-row">
              <button className="btn-secondary" onClick={onDeactivate}>Deactivate</button>
              <button className="btn-primary" onClick={onClose}>Done</button>
            </div>
          </>
        ) : (
          <>
            <p>Enter the email and license key from your purchase to unlock unlimited deletions. The trial allows 15 deletions.</p>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
            <input
              type="text"
              value={key}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXXXX"
              onChange={(e) => { setKey(e.target.value.toUpperCase()); setError(""); }}
            />
            {error && <p style={{ color: "var(--red)" }}>{error}</p>}
            <div className="sheet-row">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={submit}>Register</button>
            </div>
            <p style={{ marginTop: 12 }}>
              Don't have a key yet? <a href="#" onClick={(e) => { e.preventDefault(); openLicensePage(); }}>Get a License →</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function FiltersSheet({ value, onChange, onClose }) {
  const active = value.excludeFolders || value.includeExts || value.excludeExts;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Search Filters</h2>
        <p>Applied instantly to your Files and Photos results. Session-only — separate entries with commas.</p>
        <div className="filter-field">
          <label>Exclude folders (by name, anywhere in the path)</label>
          <input type="text" placeholder="node_modules, .git, Backups" value={value.excludeFolders}
            onChange={(e) => onChange({ ...value, excludeFolders: e.target.value })} />
        </div>
        <div className="filter-field">
          <label>Include only these extensions <span style={{ fontWeight: 400 }}>(blank = all)</span></label>
          <input type="text" placeholder="jpg, png, pdf" value={value.includeExts}
            onChange={(e) => onChange({ ...value, includeExts: e.target.value })} />
        </div>
        <div className="filter-field">
          <label>Exclude these extensions</label>
          <input type="text" placeholder="tmp, log, ds_store" value={value.excludeExts}
            onChange={(e) => onChange({ ...value, excludeExts: e.target.value })} />
        </div>
        <div className="sheet-row">
          <button className="btn-secondary" disabled={!active} onClick={() => onChange({ excludeFolders: "", includeExts: "", excludeExts: "" })}>Clear</button>
          <button className="btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export function RegisterAlert({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Registration Required</h2>
        <p>You have reached the trial limit (15 deletions) or attempted a premium action. Register to unlock unlimited access.</p>
        <div className="sheet-row">
          <button className="btn-secondary" onClick={() => openLicensePage()}>Get a License →</button>
          <button className="btn-primary" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}

export function AboutSheet({ onClose, registered, registeredEmail }) {
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(setVersion).catch(() => {});
  }, []);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} style={{ width: 300 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 18, whiteSpace: "nowrap" }}>About DupSweep</h2>
            <p>Version{version ? ` ${version}` : ""}</p>
            <p>
              {registered
                ? <>Registered for perpetuity to <b>{registeredEmail}</b></>
                : "Trial Version — not yet registered."}
            </p>
          </div>
          <svg viewBox="0 0 100 100" width={64} height={64} style={{ flexShrink: 0 }}>
            <g transform="rotate(35 50 50)">
              <rect x="46" y="8" width="8" height="50" rx="3" fill="#8a5a3c" />
              <path d="M30 52 Q50 40 70 52 L78 88 Q50 100 22 88 Z" fill="#ffc85c" />
              <path d="M30 52 Q50 40 70 52" stroke="#e8a93f" strokeWidth="3" fill="none" />
              <path d="M35 60 L28 90 M45 62 L40 92 M55 62 L60 92 M65 60 L72 90" stroke="#e8a93f" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>
        <div className="sheet-row" style={{ justifyContent: "center" }}>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
