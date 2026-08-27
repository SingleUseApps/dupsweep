// Decimal-separator handling so numeric inputs respect the machine's regional
// settings (e.g. "0,5" in most of Europe vs "0.5" in the US/UK), instead of
// assuming "." like a fixed English format would.

// Formatting 1.1 with the runtime's default locale (which reflects the OS
// regional settings) reveals whether it uses "." or "," as the decimal mark.
export function decimalSeparator() {
  return (1.1).toLocaleString().includes(",") ? "," : ".";
}

// Strips everything except digits and at most one instance of the locale
// decimal separator, so a text input only ever holds a valid partial number.
export function sanitizeDecimalInput(raw, sep = decimalSeparator()) {
  let out = "";
  let seenSep = false;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if (ch === sep && !seenSep) { out += ch; seenSep = true; }
  }
  return out;
}

// Parses a locale-formatted decimal string (e.g. "0,5") into a JS number.
// Returns 0 for empty/invalid input.
export function parseLocaleFloat(str, sep = decimalSeparator()) {
  if (!str) return 0;
  const normalized = sep === "." ? str : str.replace(sep, ".");
  const n = parseFloat(normalized);
  return Number.isNaN(n) ? 0 : n;
}
