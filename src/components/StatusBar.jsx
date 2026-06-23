import { Icon } from "../icons";
import { formatBytes } from "../api";
import { useApp } from "../store/AppProvider";

export function StatusBar() {
  const { barStatus, scanning, mode, searchedModes, potentialSavings, recovered, license, TRIAL_LIMIT, setDialog } = useApp();
  const showStats = mode !== "photos" && searchedModes.has(mode) && (potentialSavings > 0 || recovered > 0);
  const color = scanning ? "var(--green)"
    : barStatus.includes("Error") || barStatus.includes("failed") ? "var(--red)"
    : barStatus.includes("Completed") || barStatus.includes("Trash") ? "var(--blue)" : "var(--gray)";

  return (
    <div className="statusbar">
      {barStatus && <><span className="status-dot" style={{ background: color }} /><span>{barStatus}</span></>}
      <span className="spacer" />
      {showStats && (
        <div className="stats">
          <span><Icon name="drive" size={9} /> <b>Potential Savings:</b> {formatBytes(potentialSavings)}</span>
          <div className="divider-v" style={{ height: 10 }} />
          <span style={{ color: "var(--green-text)" }}><Icon name="sparkles" size={9} /> <b>Recoveries:</b> {formatBytes(recovered)}</span>
        </div>
      )}
      {!license.registered ? (
        <div className="trial">
          <Icon name="shield" size={9} /> <b>Trial Mode:</b> {license.trial}/{TRIAL_LIMIT} used
          <button onClick={() => setDialog({ type: "license" })}>(Register App)</button>
        </div>
      ) : (
        <span style={{ fontSize: 9 }}>Licensed to {license.name}</span>
      )}
    </div>
  );
}
