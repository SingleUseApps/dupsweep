import { Icon } from "../icons";
import { useApp } from "../store/AppProvider";
import { Check, SortBtn } from "./controls";

export function OptionsRow() {
  const a = useApp();
  const { mode, scanning, fileOpts, setFileOpts, folderOpts, setFolderOpts, photoOpts, setPhotoOpts, sort, toggleSort, filter, setDialog } = a;
  const set = (opts, setter, k) => (v) => setter({ ...opts, [k]: v });

  return (
    <div className="opt-row">
      <span className="row-label">OPTIONS</span>
      <button className={`filter-pill ${filter.isActive ? "active" : ""}`} onClick={() => setDialog({ type: "filters" })}
        title="Include/exclude folders and extensions (applies to Files & Photos results)">
        <Icon name="filter" size={11} /> Filters
      </button>

      {mode === "files" && (
        <>
          <Check label="Deep Scan" icon="shield" checked={fileOpts.deep} disabled={scanning} onChange={set(fileOpts, setFileOpts, "deep")}
            title="Verify candidate duplicates with SHA-256 hashing, not just name and size" />
          <Check label="Media" icon="photo" checked={fileOpts.mediaOnly} disabled={scanning} onChange={set(fileOpts, setFileOpts, "mediaOnly")}
            title="Only scan photo and video files" />
          <Check label="No Hidden" icon="eyeSlash" checked={fileOpts.skipHidden} disabled={scanning} onChange={set(fileOpts, setFileOpts, "skipHidden")}
            title="Skip dotfiles and other hidden files" />
          <Check label="Symlinks" icon="link" checked={fileOpts.detectSymlinks} disabled={scanning} onChange={set(fileOpts, setFileOpts, "detectSymlinks")}
            title="Also group symlinks that point at the same target file" />
        </>
      )}
      {mode === "folders" && (
        <>
          <Check label="Media" icon="photo" checked={folderOpts.mediaOnly} disabled={scanning} onChange={set(folderOpts, setFolderOpts, "mediaOnly")}
            title="Only scan photo and video files" />
          <Check label="No Hidden" icon="eyeSlash" checked={folderOpts.skipHidden} disabled={scanning} onChange={set(folderOpts, setFolderOpts, "skipHidden")}
            title="Skip dotfiles and other hidden files" />
          <div className="slider-group" title="Two folders are grouped together once this much of their content matches — lower to catch looser matches, raise for near-identical folders only">
            <span>Match:</span>
            <input type="range" min="0.5" max="1" step="0.05" value={folderOpts.threshold} disabled={scanning}
              onChange={(e) => setFolderOpts({ ...folderOpts, threshold: parseFloat(e.target.value) })} />
            <span className="slider-val">{Math.round(folderOpts.threshold * 100)}%</span>
          </div>
        </>
      )}
      {mode === "photos" && (
        <>
          <div className="slider-group" title="How visually similar two photos must be to group together — lower to catch looser matches (bursts, edits), raise for near-identical only">
            <span>Similarity:</span>
            <input type="range" min="0.7" max="1" step="0.01" value={photoOpts.threshold} disabled={scanning}
              onChange={(e) => setPhotoOpts({ ...photoOpts, threshold: parseFloat(e.target.value) })} />
            <span className="slider-val">{Math.round(photoOpts.threshold * 100)}%</span>
          </div>
          <Check label="EXIF corroboration" icon="shield" checked={photoOpts.requireExif} disabled={scanning} onChange={set(photoOpts, setPhotoOpts, "requireExif")}
            title="Require a metadata match (capture time, or camera + dimensions) before two photos are grouped, reducing false positives" />
          <Check label="Expand by metadata" icon="sparkles" checked={photoOpts.expandMetadata} disabled={scanning} onChange={set(photoOpts, setPhotoOpts, "expandMetadata")}
            title="After grouping by appearance, also pull in photos that share metadata with the group (see options below)" />
          {photoOpts.expandMetadata && (
            <>
              <Check label="Time" checked={photoOpts.expandTime} disabled={scanning} onChange={set(photoOpts, setPhotoOpts, "expandTime")}
                title="Include photos taken within 2 seconds of another photo already in the group" />
              <Check label="GPS" checked={photoOpts.expandGps} disabled={scanning} onChange={set(photoOpts, setPhotoOpts, "expandGps")}
                title="Include photos taken within 50 meters of another photo already in the group" />
              <Check label="Camera" checked={photoOpts.expandCamera} disabled={scanning} onChange={set(photoOpts, setPhotoOpts, "expandCamera")}
                title="Include photos taken with the same camera model as another photo already in the group" />
            </>
          )}
        </>
      )}
      {mode !== "photos" && (
        <>
          <div className="divider-v" />
          <div className="sort-btns">
            <SortBtn label="Copies" criteria="count" sort={sort} onClick={toggleSort} title="Sort by number of copies in each group" />
            <SortBtn label="Size" criteria="size" sort={sort} onClick={toggleSort} title="Sort by file size" />
            <SortBtn label="Match Ratio" criteria="matchRatio" sort={sort} onClick={toggleSort} title="Sort by folder match percentage" />
          </div>
        </>
      )}
    </div>
  );
}
