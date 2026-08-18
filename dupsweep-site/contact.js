const CONTACT_API = "https://singleuseapps.com/api/contact";
const modal = document.getElementById("contactModal");
const statusEl = document.getElementById("contactStatus");
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("contactSubmit");

function setStatus(text, kind) {
  if (!text) { statusEl.hidden = true; statusEl.textContent = ""; return; }
  statusEl.hidden = false;
  statusEl.textContent = text;
  statusEl.className = "contact-status" + (kind ? " " + kind : "");
}
function openContact() {
  modal.classList.add("open");
  setStatus("");
}
function closeContact() {
  modal.classList.remove("open");
}
document.getElementById("openContact").addEventListener("click", openContact);
document.getElementById("closeContact").addEventListener("click", closeContact);
modal.addEventListener("click", (e) => { if (e.target === modal) closeContact(); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = document.getElementById("contactType").value;
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const title = document.getElementById("contactTitle").value.trim();
  const description = document.getElementById("contactDescription").value.trim();
  const payload = { type, app: "dupsweep", name, email, title, description };
  submitBtn.disabled = true;
  setStatus("Sending…");
  try {
    const res = await fetch(CONTACT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Could not send the message.");
    setStatus("Sent. We'll get back to you by email.", "ok");
    form.reset();
  } catch (err) {
    setStatus((err.message || "Could not send.") + " Opening your mail app as a fallback…", "err");
    const typeLabel = type === "feature" ? "Feature Request" : "Support";
    const subject = encodeURIComponent("[" + typeLabel + "] " + title);
    const body = encodeURIComponent(
      "Type: " + typeLabel + "\nApp: DupSweep\nName: " + name + "\nEmail: " + email +
      "\n\n--- Description ---\n\n" + description
    );
    window.location.href = "mailto:support@dupsweep.com?subject=" + subject + "&body=" + body;
  } finally {
    submitBtn.disabled = false;
  }
});
