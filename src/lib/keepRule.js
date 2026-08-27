// Given a duplicate-file group's files and a keep rule, returns the files
// reordered so the auto-selected keeper is first. "manual" is a no-op — no
// auto-keeper, matching today's behavior (Clean All keeps whichever file is
// first in the list).
export function reorderKeeperFirst(files, rule) {
  if (rule === "manual" || !files || files.length < 2) return files;
  let bestIdx = 0;
  for (let i = 1; i < files.length; i++) {
    const a = files[i];
    const b = files[bestIdx];
    if (rule === "oldest") {
      if ((a.modification_date ?? Infinity) < (b.modification_date ?? Infinity)) bestIdx = i;
    } else if (rule === "newest") {
      if ((a.modification_date ?? -Infinity) > (b.modification_date ?? -Infinity)) bestIdx = i;
    } else if (rule === "largest") {
      if ((a.size_bytes ?? 0) > (b.size_bytes ?? 0)) bestIdx = i;
    }
  }
  if (bestIdx === 0) return files;
  const keeper = files[bestIdx];
  return [keeper, ...files.slice(0, bestIdx), ...files.slice(bestIdx + 1)];
}
