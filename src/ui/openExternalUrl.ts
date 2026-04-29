export function openExternalUrl(url: string): void {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!newWindow) {
    // Do not hijack current tab; let user allow popups.
    window.alert("Popup blocked. Please allow popups to open the problem in a new tab.");
  }
}
