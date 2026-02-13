import { isBrowser } from "@/lib/utils";

export const OPEN_COMMAND_PALETTE_EVENT = "physik:open-command-palette";

export function requestOpenCommandPalette() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
}
