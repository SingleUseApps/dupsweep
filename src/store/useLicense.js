import { useState, useEffect } from "react";
import { api } from "../api";

const TRIAL_LIMIT = 15;
const K = { reg: "DupSweep_IsRegistered", name: "DupSweep_RegisteredName", trial: "DupSweep_TrialDeletions" };

// Trial + registration. Trial allows 15 deletions; a valid key unlocks PRO.
export function useLicense() {
  const [license, setLicense] = useState({ registered: false, name: "Trial Version", trial: 0 });

  useEffect(() => {
    setLicense({
      registered: localStorage.getItem(K.reg) === "true",
      name: localStorage.getItem(K.name) || "Trial Version",
      trial: parseInt(localStorage.getItem(K.trial) || "0", 10),
    });
  }, []);

  const register = async (key) => {
    const ok = await api.validateLicense(key.trim());
    if (ok) {
      localStorage.setItem(K.reg, "true");
      localStorage.setItem(K.name, "Registered User");
      setLicense((l) => ({ ...l, registered: true, name: "Registered User" }));
    }
    return ok;
  };
  const deactivate = () => {
    localStorage.setItem(K.reg, "false");
    setLicense((l) => ({ ...l, registered: false, name: "Trial Version" }));
  };
  const recordDeletion = () =>
    setLicense((l) => {
      if (l.registered) return l;
      const trial = l.trial + 1;
      localStorage.setItem(K.trial, String(trial));
      return { ...l, trial };
    });
  const canDelete = () => license.registered || license.trial < TRIAL_LIMIT;

  return { license, register, deactivate, recordDeletion, canDelete, TRIAL_LIMIT };
}
