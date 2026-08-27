import { Icon } from "../icons";
import { sanitizeDecimalInput } from "../lib/locale";

// Small reusable control widgets shared by the option/action rows.

export function Check({ label, icon, checked, disabled, onChange, title }) {
  return (
    <label className={`check ${disabled ? "disabled" : ""}`} title={title}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {icon && <Icon name={icon} size={11} />}
      {label}
    </label>
  );
}

export function SortBtn({ label, criteria, sort, onClick, title }) {
  const active = sort.criteria === criteria;
  return (
    <button className={`sort-btn ${active ? "active" : ""}`} onClick={() => onClick(criteria)} title={title}>
      {label}
      {active && <Icon name={sort.order === "ascending" ? "chevUp" : "chevDown"} size={9} />}
    </button>
  );
}

export function SizeFilterBar({ value, onChange, title }) {
  const active = value.min !== "" || value.max !== "";
  return (
    <div className="size-filter" title={title}>
      <span>Size:</span>
      <input type="text" placeholder="min" value={value.min} onChange={(e) => onChange({ ...value, min: sanitizeDecimalInput(e.target.value) })} />
      <span>–</span>
      <input type="text" placeholder="max" value={value.max} onChange={(e) => onChange({ ...value, max: sanitizeDecimalInput(e.target.value) })} />
      <select value={value.unit} onChange={(e) => onChange({ ...value, unit: e.target.value })}>
        <option>KB</option><option>MB</option><option>GB</option>
      </select>
      {active && <button className="icon-btn" onClick={() => onChange({ ...value, min: "", max: "" })}><Icon name="x" size={11} /></button>}
    </div>
  );
}
