import { useState } from "react";
import { Icon } from "../icons";
import { useApp } from "../store/AppProvider";
import { computeSections, filePaths, folderPaths } from "../lib/sections";
import { FileGroups } from "./FileGroups";
import { FolderGroups } from "./FolderGroups";
import { PhotoGroups } from "./PhotoGroups";

export function ResultsView() {
  const a = useApp();
  const { mode, hasResults, barStatus, folders, deletedPaths, ignoredPaths, toggleIgnore,
    displayedFileGroups, displayedFolderGroups, displayedPhotoGroups, fileGroups, folderGroups, photoGroups,
    sizeActive, filter, selectFile, selectedFile, selectedFolderId, setSelectedFolderId, selectedPhotoId, setSelectedPhotoId,
    deleteFile, onMergeFolder, safeMerge, setKeeper, deletePhotoOthers, openFolder } = a;
  const [collapsed, setCollapsed] = useState(new Set());

  if (!hasResults) {
    const done = barStatus && barStatus.includes("Completed");
    return (
      <div className="empty">
        <span className="icon"><Icon name={done ? "check" : "folderPlus"} size={46} /></span>
        <span className="title">{done ? "No duplicates found" : "Add folder(s) to begin"}</span>
        <span className="sub">{mode === "photos" ? "Press Search to find visually similar photos." : "Press Search for Duplicates after adding folders."}</span>
      </div>
    );
  }

  const sections = mode === "files" ? computeSections(displayedFileGroups, filePaths, folders)
    : mode === "folders" ? computeSections(displayedFolderGroups, folderPaths, folders) : null;
  const toggle = (key) => setCollapsed((c) => { const n = new Set(c); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const renderGroups = mode === "files"
    ? (gs) => <FileGroups groups={gs} deletedPaths={deletedPaths} ignoredPaths={ignoredPaths} selected={selectedFile} onSelect={selectFile} onToggleIgnore={toggleIgnore} onDelete={deleteFile} onOpenFolder={openFolder} />
    : (gs) => <FolderGroups groups={gs} selected={selectedFolderId} onSelect={setSelectedFolderId} onMerge={onMergeFolder} safeMerge={safeMerge} />;

  return (
    <div className="results">
      <div className="results-header">
        <span className="title">
          {mode === "files" && `Duplicate Groups found (${(sizeActive || filter.isActive) ? `${displayedFileGroups.length} of ${fileGroups.length}` : displayedFileGroups.length}):`}
          {mode === "folders" && `Duplicate folder clusters (${folderGroups.length}):`}
          {mode === "photos" && `Similar photo groups (${filter.isActive ? `${displayedPhotoGroups.length} of ${photoGroups.length}` : displayedPhotoGroups.length}):`}
        </span>
        <span className="spacer" />
        <span className="badge-space">↑↓ move{mode !== "folders" ? " · Space preview" : ""}</span>
        {mode === "files" && <span className="badge-lock"><Icon name="lock" size={9} /> Safety Lock Active</span>}
      </div>

      {mode === "photos" ? (
        <PhotoGroups groups={displayedPhotoGroups} deletedPaths={deletedPaths} selectedId={selectedPhotoId}
          onSelect={setSelectedPhotoId} onSetKeeper={setKeeper} onDeleteOthers={deletePhotoOthers} />
      ) : sections ? (
        <div className="group-list">
          {sections.map((sec) => (
            <div key={sec.key}>
              <button className="section-head" onClick={() => toggle(sec.key)}>
                <Icon name={collapsed.has(sec.key) ? "chevRight" : "chevDown"} size={11} />
                <Icon name={sec.isAcross ? "branch" : "folder"} size={12} />
                {sec.label}
                {!sec.isAcross && <span className="mono" style={{ fontSize: 9, color: "var(--secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{sec.path}</span>}
                <span className="spacer" />
                <span className="cnt">{sec.groups.length}</span>
              </button>
              {!collapsed.has(sec.key) && renderGroups(sec.groups)}
            </div>
          ))}
        </div>
      ) : (
        renderGroups(mode === "files" ? displayedFileGroups : displayedFolderGroups)
      )}
    </div>
  );
}
