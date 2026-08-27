import { useState } from "react";
import { makeScanFilter } from "../lib/scanFilter";
import { parseLocaleFloat } from "../lib/locale";

const UNIT_BYTES = { KB: 1024, MB: 1048576, GB: 1073741824 };

// The two post-search filters: min/max size + include/exclude rules.
export function useFilters() {
  const [sizeFilter, setSizeFilter] = useState({ min: "", max: "", unit: "MB" });
  const [scanFilters, setScanFilters] = useState({ excludeFolders: "", includeExts: "", excludeExts: "" });

  const sizeActive = sizeFilter.min !== "" || sizeFilter.max !== "";
  const sizeContains = (sz) => {
    const u = UNIT_BYTES[sizeFilter.unit];
    const lo = sizeFilter.min ? parseLocaleFloat(sizeFilter.min) * u : 0;
    const hi = sizeFilter.max ? parseLocaleFloat(sizeFilter.max) * u : 0;
    return (lo === 0 || sz >= lo) && (hi === 0 || sz <= hi);
  };
  const filter = makeScanFilter(scanFilters); // { isActive, allows(fullPath) }

  return { sizeFilter, setSizeFilter, sizeActive, sizeContains, scanFilters, setScanFilters, filter };
}
