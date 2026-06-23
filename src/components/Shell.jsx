import { useApp } from "../store/AppProvider";
import { TopBar } from "./TopBar";
import { SearchBar } from "./SearchBar";
import { OptionsRow } from "./OptionsRow";
import { ActionsRow } from "./ActionsRow";
import { ResultsView } from "./ResultsView";
import { StatusBar } from "./StatusBar";
import { DialogHost } from "./DialogHost";

export function Shell() {
  const { scanning, hasResults, progress } = useApp();
  const overall = (progress.phase + progress.progress) / Math.max(1, progress.total_phases);

  return (
    <div className="app">
      <TopBar />
      <SearchBar />

      <div className="options-wrap">
        <OptionsRow />
        {!scanning && hasResults && (<><div className="divider-h" /><ActionsRow /></>)}
      </div>

      {scanning && (
        <div className="progress-wrap">
          <div className="progress-bar"><div style={{ width: `${progress.progress * 100}%` }} /></div>
          <div className="progress-pct">{Math.round(overall * 100)}%</div>
          <div style={{ fontSize: 11, color: "var(--secondary)" }}>{progress.status}</div>
        </div>
      )}

      {!scanning && <ResultsView />}

      <StatusBar />
      <DialogHost />
    </div>
  );
}
