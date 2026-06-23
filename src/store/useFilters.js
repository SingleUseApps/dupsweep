import { useState } from "react";
import { makeScanFilter } from "../lib/scanFilter";

const UNIT_BYTES = { KB: 1024, MB: 1048576, GB: 1073741824 };

// The two post-search filters: min/max size + include/exclude rules.
export function useFilters() {
  const [sizeFilter, setSizeFilter] = useState({ min: "", max: "", unit: "MB" });
  const [scanFilters, setScanFilters] = useState({ excludeFolders: "", includeExts: "", excludeExts: "" });

  const sizeActive = sizeFilter.min !== "" || sizeFilter.max !== "";
  const sizeContains = (sz) => {
    const u = UNIT_BYTES[sizeFilter.unit];
    const lo = sizeFilter.min ? parseInt(sizeFilter.min, 10) * u : 0;
    const hi = sizeFilter.max ? parseInt(sizeFilter.max, 10) * u : 0;
    return (lo === 0 || sz >= lo) && (hi === 0 || sz <= hi);
  };
  const filter = makeScanFilter(scanFilters); // { isActive, allows(fullPath) }

  return { sizeFilter, setSizeFilter, sizeActive, sizeContains, scanFilters, setScanFilters, filter };
}
