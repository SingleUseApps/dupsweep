import { Icon } from "../icons";
import { baseName } from "../api";
import { useApp } from "../store/AppProvider";

export function SearchBar() {
  const { folders, scanning, startScanning, addFolders, removeFolder, scanScope, setScanScope } = useApp();
  return (
    <div className="searchrow">
      <button className={`search-btn ${scanning ? "stop" : folders.length === 0 ? "disabled" : ""}`}
        onClick={startScanning} disabled={folders.length === 0 && !scanning}
        title={scanning ? "Cancel the current scan" : "Scan the selected folder(s) for duplicates"}>
        <Icon name={scanning ? "stop" : "search"} size={15} />
        {scanning ? "Stop" : "Search for Duplicates"}
      </button>
      <div className="folder-panel">
        {folders.length === 0 ? (
          <span className="empty-folders">No Folders Selected</span>
        ) : (
          <div className="folder-chips">
            {folders.map((f) => (
              <span className="chip" key={f} title={f}>
                <Icon name="folder" size={9} fill /> {baseName(f)}
                <span className="x" onClick={() => !scanning && removeFolder(f)}><Icon name="x" size={10} /></span>
              </span>
            ))}
          </div>
        )}
        <span className="spacer" />
        <button className="btn-bordered" onClick={addFolders} disabled={scanning} title="Choose a folder to include in the scan">Add Folder…</button>
      </div>
      {folders.length >= 2 && (
        <div className="segmented">
          <button className={scanScope === "combined" ? "active" : ""} onClick={() => setScanScope("combined")} disabled={scanning}
            title="Pool all selected folders together and find duplicates across them">Across all</button>
          <button className={scanScope === "perFolder" ? "active" : ""} onClick={() => setScanScope("perFolder")} disabled={scanning}
            title="Scan each selected folder independently, results grouped separately">Within each</button>
        </div>
      )}
    </div>
  );
}
