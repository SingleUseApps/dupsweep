// Decimal-separator handling for numeric text inputs. Different JS engines
// resolve the OS regional format differently (e.g. a "Region: Portugal"
// override isn't always picked up the same way), so rather than detecting
// one "correct" separator and rejecting the other, both "." and "," are
// accepted as decimal points — whichever one someone's regional habits lead
// them to type just works.

// Strips everything except digits and at most one decimal separator (either
// "." or ","), so a text input only ever holds a valid partial number.
export function sanitizeDecimalInput(raw) {
  let out = "";
  let seenSep = false;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") out += ch;
    else if ((ch === "." || ch === ",") && !seenSep) { out += ch; seenSep = true; }
  }
  return out;
}

// Parses a decimal string using either separator (e.g. "0,5" or "0.5") into
// a JS number. Returns 0 for empty/invalid input.
export function parseLocaleFloat(str) {
  if (!str) return 0;
  const n = parseFloat(str.replace(",", "."));
  return Number.isNaN(n) ? 0 : n;
}
