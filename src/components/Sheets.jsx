import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { formatBytes, openLicensePage } from "../api";

export function CleanAllSheet({ count, bytes, onClean, onCancel }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Clean All Duplicates?</h2>
        <div className="stat-line"><span>Files to move to Trash</span><span className="big-num red">{count}</span></div>
        <div className="stat-line"><span>Space to recover</span><span className="big-num green">{formatBytes(bytes)}</span></div>
        <p>
          One verified copy of every file is preserved. Duplicates are moved to the system Trash
          (recoverable), not permanently deleted. Each file is byte-for-byte verified before removal.
        </p>
        <div className="sheet-row">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary danger" onClick={onClean}>Move {count} to Trash</button>
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
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>About DupSweep</h2>
        <p>DupSweep{version ? ` v${version}` : ""}</p>
        <p>
          {registered
            ? <>Registered for perpetuity to <b>{registeredEmail}</b>.</>
            : "Trial Version — not yet registered."}
        </p>
        <div className="sheet-row">
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
