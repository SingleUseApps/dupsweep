import { Icon } from "../icons";
import { useApp } from "../store/AppProvider";

const MODES = [
  { id: "files", label: "Files", icon: "doc", title: "Find duplicate files verified byte-for-byte" },
  { id: "folders", label: "Folders", icon: "folderQ", title: "Find whole folders with mostly duplicated content" },
  { id: "photos", label: "Photos", icon: "photo", title: "Find visually similar photos, not just identical files" },
];

export function TopBar() {
  const { mode, setMode, scanning, undoStack, undoLast, setDialog } = useApp();
  return (
    <div className="topbar">
      <div className="segmented">
        {MODES.map((m) => (
          <button key={m.id} className={mode === m.id ? "active" : ""} disabled={scanning} onClick={() => setMode(m.id)} title={m.title}>
            <Icon name={m.icon} size={13} /> {m.label}
          </button>
        ))}
      </div>
      <div className="segmented">
        <button className="active" title="Scanning local disks. Cloud storage (OneDrive) support is planned"><Icon name="drive" size={13} /> Local</button>
      </div>
      <span className="spacer" />
      <button className="btn-bordered" disabled={undoStack.length === 0} onClick={undoLast} title="Undo last operation (⌘Z)">
        <Icon name="play" size={12} style={{ transform: "scaleX(-1)" }} /> Undo
      </button>
      <button className="btn-bordered" onClick={() => setDialog({ type: "history" })} title="Operation History"><Icon name="reveal" size={12} /></button>
      <button className="btn-bordered" onClick={() => setDialog({ type: "settings" })} title="Settings"><Icon name="filter" size={12} /></button>
      <button className="btn-bordered" onClick={() => setDialog({ type: "help" })} title="Help">?</button>
    </div>
  );
}
