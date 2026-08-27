import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { api, onProgress, onShowAbout, pickFolders, pickDestination, baseName, joinPath } from "../api";
import { useLicense } from "./useLicense";
import { useFilters } from "./useFilters";
import { reorderKeeperFirst } from "../lib/keepRule";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// Holds all app state + actions (no rendering). Components consume via useApp().
export function AppProvider({ children }) {
  const lic = useLicense();
  const flt = useFilters();

  const [mode, setMode] = useState("files");
  const [foldersByMode, setFoldersByMode] = useState({ files: [], folders: [], photos: [] });
  const [scanScope, setScanScope] = useState("combined");

  const [fileOpts, setFileOpts] = useState({ deep: false, mediaOnly: false, skipHidden: false, detectSymlinks: false });
  const [folderOpts, setFolderOpts] = useState({ mediaOnly: false, skipHidden: false, threshold: 0.75 });
  const [photoOpts, setPhotoOpts] = useState({ threshold: 0.9, requireExif: false, expandMetadata: false, expandTime: true, expandGps: false, expandCamera: false });
  const [photoPriority, setPhotoPriority] = useState(() => loadPriority());
  const [keepRule, setKeepRuleState] = useState(() => localStorage.getItem("DupSweep_keepRule") || "manual");
  const setKeepRule = (rule) => { localStorage.setItem("DupSweep_keepRule", rule); setKeepRuleState(rule); };

  const [fileGroups, setFileGroups] = useState([]);
  const [folderGroups, setFolderGroups] = useState([]);
  const [photoGroups, setPhotoGroups] = useState([]);
  const [searchedModes, setSearchedModes] = useState(new Set());

  const [deletedPaths, setDeletedPaths] = useState(new Set());
  const [ignoredPaths, setIgnoredPaths] = useState(new Set());
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ progress: 0, status: "Ready to start", phase: 0, total_phases: 1 });
  const [status, setStatus] = useState("");

  const [sort, setSort] = useState({ criteria: "name", order: "ascending" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);

  const [potentialSavings, setPotentialSavings] = useState(0);
  const [recovered, setRecovered] = useState(0);
  const [lastLogPath, setLastLogPath] = useState(null);

  const [safeMerge, setSafeMerge] = useState(false);
  const [safeMergeDest, setSafeMergeDest] = useState(null);
  const [renameKept, setRenameKept] = useState(false);

  const [undoStack, setUndoStack] = useState([]);
  const [walk, setWalk] = useState(null);
  const [previewPath, setPreviewPath] = useState(null);
  const [dialog, setDialog] = useState(null);

  const folders = foldersByMode[mode];
  const setFolders = (list) => setFoldersByMode((m) => ({ ...m, [mode]: list }));

  useEffect(() => { localStorage.setItem("DupSweep_photoPriority", JSON.stringify(photoPriority)); }, [photoPriority]);
  useEffect(() => {
    const un = onProgress((p) => setProgress(p));
    return () => un.then((f) => f());
  }, []);
  useEffect(() => {
    const un = onShowAbout(() => setDialog({ type: "about" }));
    return () => un.then((f) => f());
  }, []);

  // ── undo ──
  const pushUndo = (op) => setUndoStack((s) => [...s, op]);
  const undoRef = useRef();
  undoRef.current = () => {
    setUndoStack((stack) => {
      const op = stack[stack.length - 1];
      if (!op) { setStatus("Nothing to undo."); return stack; }
      api.undoOp(op.trashed || [], op.created || []).then((restored) => {
        setDeletedPaths((d) => { const n = new Set(d); (restored || []).forEach((p) => n.delete(p)); return n; });
        const parts = [];
        if (restored?.length) parts.push(`restored ${restored.length}`);
        if (op.created?.length) parts.push(`removed ${op.created.length} created`);
        setStatus(`Undo "${op.title}": ${parts.join(" · ") || "nothing to do"}`);
      });
      return stack.slice(0, -1);
    });
  };

  // ── derived: displayed groups ──
  const sortGroups = useCallback((groups, isFolder) => {
    const arr = [...groups];
    arr.sort((a, b) => {
      let r;
      if (isFolder) {
        switch (sort.criteria) {
          case "size": r = a.total_size_bytes - b.total_size_bytes; break;
          case "count": r = a.matched_groups.length - b.matched_groups.length; break;
          case "matchRatio": r = a.match_ratio - b.match_ratio; break;
          default: r = baseName(a.folders[0]).localeCompare(baseName(b.folders[0]));
        }
      } else {
        if (mode === "files" && fileOpts.detectSymlinks && a.is_symlink_group !== b.is_symlink_group) return a.is_symlink_group ? -1 : 1;
        switch (sort.criteria) {
          case "size": r = a.size_bytes - b.size_bytes; break;
          case "count": {
            const ca = a.files.filter((f) => !deletedPaths.has(f.full_path) && !ignoredPaths.has(f.full_path)).length;
            const cb = b.files.filter((f) => !deletedPaths.has(f.full_path) && !ignoredPaths.has(f.full_path)).length;
            r = ca - cb; break;
          }
          case "matchRatio": r = (a.confidence?.overall || 0) - (b.confidence?.overall || 0); break;
          default: r = a.name.localeCompare(b.name);
        }
      }
      return sort.order === "ascending" ? r : -r;
    });
    return arr;
  }, [sort, mode, fileOpts.detectSymlinks, deletedPaths, ignoredPaths]);

  const toggleSort = (criteria) =>
    setSort((s) => s.criteria === criteria
      ? { criteria, order: s.order === "ascending" ? "descending" : "ascending" }
      : { criteria, order: "descending" });

  let displayedFileGroups = fileGroups;
  if (flt.sizeActive) displayedFileGroups = displayedFileGroups.filter((g) => flt.sizeContains(g.size_bytes));
  if (flt.filter.isActive) {
    displayedFileGroups = displayedFileGroups
      .map((g) => ({ ...g, files: g.files.filter((f) => flt.filter.allows(f.full_path)) }))
      .filter((g) => g.files.length >= 2);
  }
  if (keepRule !== "manual") {
    displayedFileGroups = displayedFileGroups.map((g) => ({ ...g, files: reorderKeeperFirst(g.files, keepRule) }));
  }
  displayedFileGroups = sortGroups(displayedFileGroups, false);
  const displayedFolderGroups = sortGroups(folderGroups, true);

  let displayedPhotoGroups = photoGroups;
  if (flt.sizeActive) {
    displayedPhotoGroups = displayedPhotoGroups
      .map((g) => {
        const photos = g.photos.filter((p) => flt.sizeContains(p.size_bytes));
        const keeper_id = photos.some((p) => p.id === g.keeper_id) ? g.keeper_id : photos[0] && photos[0].id;
        return { ...g, photos, keeper_id };
      })
      .filter((g) => g.photos.length >= 2);
  }
  if (flt.filter.isActive) {
    displayedPhotoGroups = displayedPhotoGroups
      .map((g) => {
        const photos = g.photos.filter((p) => flt.filter.allows(p.full_path));
        const keeper_id = photos.some((p) => p.id === g.keeper_id) ? g.keeper_id : photos[0] && photos[0].id;
        return { ...g, photos, keeper_id };
      })
      .filter((g) => g.photos.length >= 2);
  }

  const activeCount = (g) => g.files.filter((f) => !deletedPaths.has(f.full_path) && !ignoredPaths.has(f.full_path)).length;
  const hasRemovable = displayedFileGroups.some((g) => activeCount(g) > 1);
  const cleanComposition = () => {
    let count = 0, bytes = 0, groups = 0;
    for (const g of displayedFileGroups) { const a = activeCount(g); if (a > 1) { count += a - 1; bytes += g.size_bytes * (a - 1); groups++; } }
    return { count, bytes, groups };
  };
  const displayPotentialSavings = mode === "files" ? cleanComposition().bytes : potentialSavings;
  const hasResults = mode === "files" ? fileGroups.length > 0 : mode === "folders" ? folderGroups.length > 0 : photoGroups.length > 0;

  // ── keyboard: ⌘Z undo · Space preview · ↑/↓ navigate ──
  const navRef = useRef({});
  navRef.current = { mode, deletedPaths, fileGroups: displayedFileGroups, folderGroups: displayedFolderGroups, photoGroups: displayedPhotoGroups, selectedFile, selectedFolderId, selectedPhotoId, selectedFilePath, dialog, walk, previewPath };
  useEffect(() => {
    const selPath = (n) => {
      if (n.mode === "files") return n.selectedFilePath;
      if (n.mode === "photos" && n.selectedPhotoId) return n.photoGroups.flatMap((g) => g.photos).find((x) => x.id === n.selectedPhotoId)?.full_path;
      return null;
    };
    const navigate = (delta) => {
      const n = navRef.current;
      const pick = (list, id) => { if (!list.length) return null; const i = list.findIndex((x) => x.id === id); return list[Math.min(Math.max(i < 0 ? 0 : i + delta, 0), list.length - 1)]; };
      if (n.mode === "files") {
        const files = n.fileGroups.flatMap((g) => g.files).filter((f) => !n.deletedPaths.has(f.full_path));
        const x = pick(files, n.selectedFile); if (x) { setSelectedFile(x.id); setSelectedFilePath(x.full_path); if (n.previewPath) setPreviewPath(x.full_path); }
      } else if (n.mode === "folders") {
        const x = pick(n.folderGroups, n.selectedFolderId); if (x) setSelectedFolderId(x.id);
      } else {
        const photos = n.photoGroups.flatMap((g) => g.photos).filter((p) => !n.deletedPaths.has(p.full_path));
        const x = pick(photos, n.selectedPhotoId); if (x) { setSelectedPhotoId(x.id); if (n.previewPath) setPreviewPath(x.full_path); }
      }
    };
    const onKey = (e) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName);
      const n = navRef.current;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) { e.preventDefault(); undoRef.current(); return; }
      if (typing || n.dialog || n.walk) return;
      if (e.code === "Space") { const p = selPath(n); if (p) { e.preventDefault(); setPreviewPath((c) => (c ? null : p)); } }
      else if (e.key === "ArrowDown") { e.preventDefault(); navigate(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); navigate(-1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── scanning ──
  const startScanning = async () => {
    if (scanning) { api.stopScan(); return; }
    if (folders.length === 0) return;
    setScanning(true);
    setSearchedModes((s) => new Set(s).add(mode));
    setProgress({ progress: 0, status: "Counting files...", phase: 0, total_phases: 1 });
    try {
      if (mode === "files") {
        const res = await api.scanFiles(folders, scanScope === "perFolder", fileOpts.deep, fileOpts.mediaOnly, fileOpts.skipHidden, fileOpts.detectSymlinks);
        setFileGroups(res.groups); setPotentialSavings(res.total_potential_savings);
        setIgnoredPaths(new Set());
        setStatus(res.stopped ? "Scan stopped." : `Completed! ${res.groups.length} groups found.`);
      } else if (mode === "folders") {
        const res = await api.scanFolders(folders, scanScope === "perFolder", folderOpts.mediaOnly, folderOpts.skipHidden, folderOpts.threshold);
        setFolderGroups(res.folder_groups);
        setStatus(res.stopped ? "Scan stopped." : `Completed! ${res.folder_groups.length} clusters found.`);
      } else {
        const res = await api.scanPhotos(folders, photoOpts.threshold, photoOpts.requireExif, photoOpts.expandMetadata, photoOpts.expandTime, photoOpts.expandGps, photoOpts.expandCamera, photoPriority);
        setPhotoGroups(res.groups);
        const dupes = res.groups.reduce((s, g) => s + g.photos.length - 1, 0);
        setStatus(res.stopped ? "Scan stopped." : `Found ${res.groups.length} similar group(s) · ${dupes} removable photo(s).`);
      }
    } catch (e) { setStatus(`Error: ${e}`); } finally { setScanning(false); }
  };
  const addFolders = async () => { const p = await pickFolders(true); if (p.length) setFolders([...new Set([...folders, ...p])]); };
  const removeFolder = (f) => setFolders(folders.filter((x) => x !== f));

  // ── deletions ──
  const selectFile = (file) => { setSelectedFile(file.id); setSelectedFilePath(file.full_path); };
  const toggleIgnore = (fullPath) => {
    setIgnoredPaths((prev) => {
      const next = new Set(prev);
      if (next.has(fullPath)) next.delete(fullPath);
      else next.add(fullPath);
      return next;
    });
  };
  const deleteFile = async (group, file) => {
    if (!lic.canDelete()) { setDialog({ type: "register" }); return; }
    const ref = group.files.find((f) => f.full_path !== file.full_path && !deletedPaths.has(f.full_path) && !ignoredPaths.has(f.full_path));
    if (!ref) { setStatus("Security Error: No active original file found!"); return; }
    setStatus("Verifying binary identity...");
    try {
      const log = await api.deleteSingle(file.full_path, ref.full_path, file.is_symlink || group.is_symlink_group, file.name, group.size_bytes);
      setDeletedPaths((d) => new Set(d).add(file.full_path));
      setRecovered((r) => r + group.size_bytes);
      lic.recordDeletion();
      pushUndo({ title: `Delete ${file.name}`, trashed: [file.full_path] });
      if (log) setLastLogPath(log);
      setStatus("Security Verified! Moved to Trash.");
    } catch (e) { setStatus(String(e)); }
  };
  const cleanAll = () => { if (!lic.license.registered) { setDialog({ type: "register" }); return; } setDialog({ type: "cleanAll", ...cleanComposition(), keepRule }); };
  const doCleanAll = async () => {
    setDialog(null); setStatus("Verifying batch integrity...");
    try {
      const res = await api.cleanAll(displayedFileGroups, [...deletedPaths], [...ignoredPaths]);
      if (res.trashed.length === 0) { setStatus(res.skipped > 0 ? `Alert: ${res.skipped} files differ and were skipped.` : "No duplicates to clean."); return; }
      setDeletedPaths((d) => { const n = new Set(d); res.trashed.forEach((p) => n.add(p)); return n; });
      setRecovered((r) => r + res.bytes);
      pushUndo({ title: `Clean ${res.trashed.length} duplicate(s)`, trashed: res.trashed });
      if (res.log_path) setLastLogPath(res.log_path);
      setStatus(`Security Verified! ${res.trashed.length} files moved to Trash${res.skipped > 0 ? ` (${res.skipped} skipped for safety)` : ""}.`);
    } catch (e) { setStatus(String(e)); }
  };

  // ── folder merge ──
  const computeMergedName = (g) => `${baseName(g.folders[0])} merged`;
  const onMergeFolder = (group) => setDialog({ type: "diff", group });
  const confirmMergeFolder = (group) => setDialog({ type: "merge", group });
  const runMerge = async (group) => {
    if (safeMerge) {
      let parent = safeMergeDest;
      if (!parent) { parent = await pickDestination(); if (!parent) return null; setSafeMergeDest(parent); }
      const res = await api.safeMerge(group, joinPath(parent, computeMergedName(group)));
      if (res.log_path) setLastLogPath(res.log_path);
      pushUndo({ title: `Copy merge → ${res.result_name}`, created: [res.created] });
      return `Merged copy created → "${res.result_name}". Originals untouched.`;
    }
    const res = await api.mergeFolder(group, renameKept, computeMergedName(group));
    setFolderGroups((gs) => gs.filter((g) => g.id !== group.id));
    setDeletedPaths((d) => { const n = new Set(d); res.trashed.forEach((p) => n.add(p)); return n; });
    setRecovered((r) => r + res.recovered_bytes);
    if (res.log_path) setLastLogPath(res.log_path);
    pushUndo({ title: `Merge ${res.result_name}`, trashed: res.trashed });
    return res.errors === 0 ? `Merge complete → "${res.result_name}".` : `Merge done with ${res.errors} error(s).`;
  };
  const executeMerge = async (group) => { setDialog(null); try { const m = await runMerge(group); if (m) setStatus(m); } catch (e) { setStatus(String(e)); } };
  const mergeAll = () => setDialog({ type: "mergeAll", groups: displayedFolderGroups });
  const executeMergeAll = async () => {
    const groups = [...displayedFolderGroups]; setDialog(null);
    try { let n = 0; for (const g of groups) { await runMerge(g); n++; } setStatus(`Processed ${n} folder cluster(s).`); } catch (e) { setStatus(String(e)); }
  };
  const onToggleSafeMerge = async (on) => {
    setSafeMerge(on);
    if (on) { const d = await pickDestination(); if (d) setSafeMergeDest(d); else setSafeMerge(false); } else setSafeMergeDest(null);
  };

  // ── one-by-one walkthrough ──
  const startWalkthrough = () => { if (displayedFolderGroups.length) setWalk({ queue: [...displayedFolderGroups], index: 0, approved: new Set() }); };
  const walkAdvance = (approve) => {
    setWalk((w) => {
      if (!w) return w;
      const approved = new Set(w.approved); if (approve) approved.add(w.queue[w.index].id);
      const next = w.index + 1;
      if (next >= w.queue.length) { finishWalkthrough(w.queue, approved); return null; }
      return { ...w, index: next, approved };
    });
  };
  const finishWalkthrough = async (queue, approved) => {
    const groups = queue.filter((g) => approved.has(g.id));
    if (!groups.length) { setStatus("Review finished — nothing approved."); return; }
    try { for (const g of groups) await runMerge(g); setStatus(`Merged ${groups.length} approved cluster(s).`); } catch (e) { setStatus(String(e)); }
  };

  // ── photos ──
  const setKeeper = (groupId, photoId) =>
    setPhotoGroups((gs) => gs.map((g) => g.id === groupId
      ? { ...g, keeper_id: photoId, reclaimable_bytes: g.photos.filter((p) => p.id !== photoId).reduce((s, p) => s + p.size_bytes, 0) }
      : g));
  const doDeletePhotos = async (groups) => {
    setDialog(null);
    const targets = groups.flatMap((g) => g.photos.filter((p) => p.id !== g.keeper_id && !deletedPaths.has(p.full_path)));
    if (!targets.length) return;
    const keeperName = groups[0]?.photos.find((p) => p.id === groups[0].keeper_id)?.name || "keeper";
    try {
      const log = await api.deletePhotos(targets, keeperName);
      setDeletedPaths((d) => { const n = new Set(d); targets.forEach((p) => n.add(p.full_path)); return n; });
      setRecovered((r) => r + targets.reduce((s, p) => s + p.size_bytes, 0));
      pushUndo({ title: `Delete ${targets.length} photo(s)`, trashed: targets.map((p) => p.full_path) });
      if (log) setLastLogPath(log);
      setStatus(`Moved ${targets.length} photo(s) to Trash.`);
    } catch (e) { setStatus(String(e)); }
  };
  const deletePhotoOthers = (group) => {
    const targets = group.photos.filter((p) => p.id !== group.keeper_id && !deletedPaths.has(p.full_path));
    setDialog({ type: "photoDelete", count: targets.length, bytes: targets.reduce((s, p) => s + p.size_bytes, 0), all: false, run: () => doDeletePhotos([group]) });
  };
  const deleteAllPhotos = () => {
    const targets = displayedPhotoGroups.flatMap((g) => g.photos.filter((p) => p.id !== g.keeper_id && !deletedPaths.has(p.full_path)));
    setDialog({ type: "photoDelete", count: targets.length, bytes: targets.reduce((s, p) => s + p.size_bytes, 0), all: true, run: () => doDeletePhotos(displayedPhotoGroups) });
  };
  const exportKeepers = async () => {
    const dest = await pickDestination(); if (!dest) return;
    const keepers = displayedPhotoGroups.map((g) => g.photos.find((p) => p.id === g.keeper_id)).filter(Boolean);
    try { const res = await api.exportKeepers(keepers, dest, folders); if (res.log_path) setLastLogPath(res.log_path); pushUndo({ title: `Export ${res.copied} keeper(s)`, created: res.created }); setStatus(`Copied ${res.copied} keeper(s) to "${baseName(dest)}". Originals untouched.`); }
    catch (e) { setStatus(String(e)); }
  };

  const barStatus = searchedModes.has(mode) ? status : "";

  const value = {
    ...lic, ...flt,
    mode, setMode, folders, addFolders, removeFolder, scanScope, setScanScope,
    fileOpts, setFileOpts, folderOpts, setFolderOpts, photoOpts, setPhotoOpts, photoPriority, setPhotoPriority,
    keepRule, setKeepRule,
    fileGroups, folderGroups, photoGroups, displayedFileGroups, displayedFolderGroups, displayedPhotoGroups,
    deletedPaths, ignoredPaths, toggleIgnore, scanning, progress, barStatus, startScanning,
    sort, toggleSort,
    selectedFile, selectFile, selectedFolderId, setSelectedFolderId, selectedPhotoId, setSelectedPhotoId,
    potentialSavings: displayPotentialSavings, recovered, lastLogPath, searchedModes, hasResults, hasRemovable,
    safeMerge, safeMergeDest, setSafeMergeDest, renameKept, setRenameKept, onToggleSafeMerge,
    deleteFile, cleanAll, doCleanAll, onMergeFolder, confirmMergeFolder, executeMerge, mergeAll, executeMergeAll,
    startWalkthrough, walk, walkAdvance, setWalk,
    setKeeper, deletePhotoOthers, deleteAllPhotos, exportKeepers,
    undoStack, undoLast: () => undoRef.current(),
    dialog, setDialog, previewPath, setPreviewPath,
    openFolder: (p) => api.openFolder(p),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function loadPriority() {
  const DEFAULT = ["resolution", "fileSize", "newest", "preferRaw", "hasGPS", "oldest"];
  try {
    const saved = JSON.parse(localStorage.getItem("DupSweep_photoPriority"));
    if (Array.isArray(saved) && saved.length) {
      const missing = DEFAULT.filter((c) => !saved.includes(c));
      return [...saved, ...missing];
    }
  } catch {}
  return DEFAULT;
}
