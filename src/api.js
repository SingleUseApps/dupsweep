import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";

// Pure path/format helpers live in lib/paths (no Tauri deps); re-exported for convenience.
export { formatBytes, baseName, joinPath, isUnder } from "./lib/paths";

// Thin wrappers over the Rust commands.
export const api = {
  scanFiles: (roots, perFolder, deep, mediaOnly, skipHidden, detectSymlinks) =>
    invoke("scan_files", { roots, perFolder, deep, mediaOnly, skipHidden, detectSymlinks }),
  scanFolders: (roots, perFolder, mediaOnly, skipHidden, threshold) =>
    invoke("scan_folders", { roots, perFolder, mediaOnly, skipHidden, threshold }),
  scanPhotos: (roots, threshold, requireExif, expandMetadata, expandTime, expandGps, expandCamera, priority) =>
    invoke("scan_photos_cmd", { roots, threshold, requireExif, expandMetadata, expandTime, expandGps, expandCamera, priority }),
  stopScan: () => invoke("stop_scan"),
  trashFiles: (paths) => invoke("trash_files", { paths }),
  deleteSingle: (target, reference, isSymlink, name, size) => invoke("delete_single", { target, reference, isSymlink, name, size }),
  cleanAll: (groups, deleted) => invoke("clean_all_duplicates", { groups, deleted }),
  mergeFolder: (group, rename, mergedName) => invoke("merge_folder", { group, rename, mergedName }),
  safeMerge: (group, dest) => invoke("safe_merge", { group, dest }),
  exportKeepers: (keepers, dest, roots) => invoke("export_keepers", { keepers, dest, roots }),
  deletePhotos: (photos, keeperName) => invoke("delete_photos", { photos, keeperName }),
  undoOp: (trashed, created) => invoke("undo_op", { trashed, created }),
  listLogs: () => invoke("list_logs"),
  readTextFile: (path, maxBytes = 65536) => invoke("read_text_file", { path, maxBytes }),
  validateLicense: (key) => invoke("validate_license", { key }),
  revealInFinder: (path) => invoke("reveal_in_finder", { path }),
  openFolder: (path) => invoke("open_folder", { path }),
};

// Scan progress events.
export function onProgress(handler) {
  return listen("scan-progress", (e) => handler(e.payload));
}

// Native folder/destination pickers.
export async function pickFolders(multiple = true) {
  const r = await open({ directory: true, multiple, canCreateDirectories: true });
  if (!r) return [];
  return Array.isArray(r) ? r : [r];
}
export async function pickDestination() {
  return (await open({ directory: true, multiple: false, canCreateDirectories: true })) || null;
}

// Opens the purchase page in the system browser.
export function openLicensePage() {
  return openUrl("https://dupsweep.com");
}

export const fileSrc = convertFileSrc;
