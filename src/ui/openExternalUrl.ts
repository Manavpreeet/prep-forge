export function openExternalUrl(url: string): void {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!newWindow) {
    // Popup blockers may prevent opening; fallback keeps navigation functional.
    window.location.assign(url);
  }
}
