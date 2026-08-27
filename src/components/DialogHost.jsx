import { useApp } from "../store/AppProvider";
import { CleanAllSheet, CopyFileKeepersSheet, MergeSheet, MergeAllSheet, PhotoDeleteSheet, LicenseSheet, RegisterAlert, FiltersSheet, AboutSheet } from "./Sheets";
import { DiffSheet } from "./FolderGroups";
import { HelpWindow } from "./Help";
import { SettingsWindow } from "./Settings";
import { HistoryWindow } from "./History";
import { Preview } from "./Preview";

// Renders whichever modal/window the store says is open.
export function DialogHost() {
  const a = useApp();
  const { dialog, setDialog, walk, walkAdvance, setWalk, previewPath, setPreviewPath,
    safeMerge, doCleanAll, doCopyFileKeepers, confirmMergeFolder, executeMerge, executeMergeAll,
    register, deactivate, license, scanFilters, setScanFilters, photoPriority, setPhotoPriority } = a;
  const close = () => setDialog(null);

  return (
    <>
      {dialog?.type === "cleanAll" && <CleanAllSheet count={dialog.count} bytes={dialog.bytes} groups={dialog.groups} keepRule={dialog.keepRule} onClean={doCleanAll} onCancel={close} />}
      {dialog?.type === "copyFileKeepers" && <CopyFileKeepersSheet count={dialog.count} onCopy={doCopyFileKeepers} onCancel={close} />}
      {dialog?.type === "diff" && <DiffSheet group={dialog.group} safeMerge={safeMerge} onMerge={() => confirmMergeFolder(dialog.group)} onClose={close} />}
      {dialog?.type === "merge" && <MergeSheet group={dialog.group} safeMerge={safeMerge} onMerge={() => executeMerge(dialog.group)} onCancel={close} />}
      {dialog?.type === "mergeAll" && <MergeAllSheet groups={dialog.groups} safeMerge={safeMerge} onMergeAll={executeMergeAll} onCancel={close} />}
      {dialog?.type === "photoDelete" && <PhotoDeleteSheet count={dialog.count} bytes={dialog.bytes} all={dialog.all} onConfirm={dialog.run} onCancel={close} />}
      {dialog?.type === "license" && (
        <LicenseSheet registered={license.registered} registeredName={license.name} onDeactivate={() => { deactivate(); close(); }} onClose={close}
          onValidate={async (k, email) => { const ok = await register(k, email); if (ok) close(); return ok; }} />
      )}
      {dialog?.type === "register" && <RegisterAlert onClose={close} />}
      {dialog?.type === "about" && <AboutSheet registered={license.registered} registeredEmail={license.email} onClose={close} />}
      {dialog?.type === "filters" && <FiltersSheet value={scanFilters} onChange={setScanFilters} onClose={close} />}
      {dialog?.type === "help" && <HelpWindow onClose={close} />}
      {dialog?.type === "settings" && <SettingsWindow priority={photoPriority} onChange={setPhotoPriority} onClose={close} />}
      {dialog?.type === "history" && <HistoryWindow onClose={close} />}

      {walk && (
        <DiffSheet key={walk.index} group={walk.queue[walk.index]} safeMerge={safeMerge} walkthrough
          progressLabel={`Cluster ${walk.index + 1} of ${walk.queue.length}`}
          onApproveNext={() => walkAdvance(true)} onSkip={() => walkAdvance(false)} onClose={() => setWalk(null)} />
      )}

      {previewPath && <Preview path={previewPath} onClose={() => setPreviewPath(null)} />}
    </>
  );
}
