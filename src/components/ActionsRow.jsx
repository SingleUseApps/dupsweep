import { Icon } from "../icons";
import { api, baseName, pickDestination } from "../api";
import { useApp } from "../store/AppProvider";
import { SizeFilterBar } from "./controls";

export function ActionsRow() {
  const {
    mode, fileGroups, folderGroups, photoGroups, displayedPhotoGroups, hasRemovable,
    sizeFilter, setSizeFilter, safeMerge, safeMergeDest, setSafeMergeDest, renameKept, setRenameKept, onToggleSafeMerge,
    lastLogPath, startWalkthrough, mergeAll, exportKeepers, deleteAllPhotos, cleanAll,
  } = useApp();

  return (
    <div className="opt-row">
      <span className="row-label">ACTIONS</span>

      {mode === "files" && fileGroups.length > 0 && <SizeFilterBar value={sizeFilter} onChange={setSizeFilter} title="Only show duplicate groups within this size range" />}

      {mode === "folders" && folderGroups.length > 0 && (
        <>
          <label className="check" title="Non-destructive: write the merged result into a new folder and leave all originals untouched, instead of merging in place">
            <input type="checkbox" checked={safeMerge} onChange={(e) => onToggleSafeMerge(e.target.checked)} />
            <Icon name="docDoc" size={11} /> Copy to new folder
          </label>
          {safeMerge && safeMergeDest && (
            <span className="action-btn green" title="Destination for the merged copy — click to change" onClick={async () => { const d = await pickDestination(); if (d) setSafeMergeDest(d); }}>→ {baseName(safeMergeDest)}</span>
          )}
          {!safeMerge && (
            <label className="check" title="Rename the kept folder after merging, combining both folder names">
              <input type="checkbox" checked={renameKept} onChange={(e) => setRenameKept(e.target.checked)} /> Rename kept folder
            </label>
          )}
        </>
      )}

      {lastLogPath && (
        <button className="btn-bordered" onClick={() => api.revealInFinder(lastLogPath)} title="Show the most recent log">
          <Icon name="reveal" size={11} /> Reveal Log
        </button>
      )}

      <span className="spacer" />

      {mode === "folders" && folderGroups.length > 0 && (
        <>
          <button className="action-btn indigo" onClick={startWalkthrough} title="Step through each folder cluster and approve or skip individually before anything changes">
            <Icon name="play" size={11} /> Review One-by-One
          </button>
          <button className="action-btn indigo" onClick={mergeAll} title={safeMerge ? "Copy every cluster's merged result into a new folder, leaving originals untouched" : "Merge every cluster in place: move unique files into the keep folder, then trash the others"}>
            <Icon name={safeMerge ? "docDoc" : "merge"} size={11} /> {safeMerge ? "Merge All to New" : "Merge All Folders"}
          </button>
        </>
      )}
      {mode === "photos" && photoGroups.length > 0 && <SizeFilterBar value={sizeFilter} onChange={setSizeFilter} title="Only show similar-photo groups within this size range" />}
      {mode === "photos" && displayedPhotoGroups.length > 0 && (
        <>
          <button className="action-btn green" onClick={exportKeepers} title="Copy each group's keeper photo into a folder you choose, preserving the original folder structure. Originals untouched">
            <Icon name="upload" size={11} /> Copy keepers to…
          </button>
          <button className="action-btn red" onClick={deleteAllPhotos} title="Move every non-keeper photo to Trash across all groups, in one batch">
            <Icon name="trash" size={11} /> Delete all non-keepers
          </button>
        </>
      )}
      {mode === "files" && hasRemovable && (
        <button className="action-btn red" onClick={cleanAll} title="Batch-remove every redundant copy after a byte-for-byte safety re-check. Ignored copies are left alone">
          <Icon name="trash" size={11} /> Clean All Duplicates
        </button>
      )}
    </div>
  );
}
