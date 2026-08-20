import { useEffect } from "react";

/**
 * useContentProtection
 *
 * Mounts global event listeners that deter casual content theft:
 *   - Disables right-click context menu (desktop + Android long-press)
 *   - Disables text copy (Ctrl+C) and cut (Ctrl+X)
 *   - Disables image drag-and-drop
 *   - Intercepts common devtools keyboard shortcuts (F12, Ctrl+U, Ctrl+P,
 *     Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
 *   - Blocks mobile long-press "Save Image" on Android via touchstart timer
 *   - iOS Safari is handled via CSS `-webkit-touch-callout: none`
 *
 * Pass `enabled = false` on admin/editor routes so staff are never affected.
 * Pass `exemptStreaming = true` on the watch-live page so media/volume keys
 * and spacebar work normally inside the video player.
 *
 * NOTE: These measures deter casual users. A determined technical user can
 * still bypass them via the browser menu or OS screenshot tools. The
 * persistent watermark overlay in __root.tsx provides attribution on
 * screenshots even in that case.
 */
export function useContentProtection(enabled: boolean = true, exemptStreaming: boolean = false) {
  useEffect(() => {
    if (!enabled) return;

    // ── Right-click context menu (desktop + Android long-press) ──────────
    const blockContextMenu = (e: Event) => {
      e.preventDefault();
    };

    // ── Keyboard shortcuts ────────────────────────────────────────────────
    const blockKeys = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // On streaming pages, let media/player control keys pass through so
      // users can adjust volume, seek, pause etc. inside the video player.
      if (exemptStreaming) {
        const playerKeys = [
          "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
          " ", // Spacebar — play/pause
          "MediaPlayPause", "MediaStop",
          "MediaTrackNext", "MediaTrackPrevious",
          "AudioVolumeUp", "AudioVolumeDown", "AudioVolumeMute",
          // Legacy key names for older browsers
          "VolumeUp", "VolumeDown", "VolumeMute",
        ];
        if (playerKeys.includes(e.key)) return; // let the player handle it
      }

      // F12 → DevTools
      if (e.key === "F12") { e.preventDefault(); return; }

      // Ctrl+U → View Source
      if (ctrl && e.key.toLowerCase() === "u") { e.preventDefault(); return; }

      // Ctrl+P → Print / Save as PDF
      if (ctrl && e.key.toLowerCase() === "p") { e.preventDefault(); return; }

      // Ctrl+C → Copy
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        return;
      }

      // Ctrl+X → Cut
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === "x") {
        e.preventDefault();
        return;
      }

      // Ctrl+S → Save page
      if (ctrl && e.key.toLowerCase() === "s") { e.preventDefault(); return; }

      // Ctrl+Shift+I → DevTools (Elements)
      // Ctrl+Shift+J → DevTools (Console)
      // Ctrl+Shift+C → DevTools (Inspect element)
      if (ctrl && e.shiftKey) {
        const k = e.key.toLowerCase();
        if (k === "i" || k === "j" || k === "c") {
          e.preventDefault();
          return;
        }
      }
    };

    // ── Copy / cut events (fallback for middle-click copy etc.) ──────────
    const blockCopy = (e: ClipboardEvent) => { e.preventDefault(); };
    const blockCut  = (e: ClipboardEvent) => { e.preventDefault(); };

    // ── Image / element drag ──────────────────────────────────────────────
    const blockDrag = (e: DragEvent) => { e.preventDefault(); };

    // ── Mobile long-press prevention (Android Chrome) ─────────────────────
    // iOS Safari is handled by CSS `-webkit-touch-callout: none`.
    // On Android, a long-press (~500 ms) fires the contextmenu event AND
    // the native "Save image" sheet. We:
    //   1. Block contextmenu globally (above).
    //   2. Start a touchstart timer; if the finger stays still long enough
    //      we call preventDefault() to kill the native action before it opens.
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isImageLike =
        target instanceof HTMLImageElement ||
        !!target.closest("img") ||
        !!target.closest("[data-protected]") ||
        window.getComputedStyle(target).backgroundImage !== "none";

      if (!isImageLike) return;

      longPressTimer = setTimeout(() => {
        // Calling preventDefault here prevents the Android "Save image"
        // bottom sheet from appearing on supported browsers.
        e.preventDefault();
      }, 500);
    };

    const cancelLongPress = () => {
      if (longPressTimer !== null) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown",     blockKeys);
    document.addEventListener("copy",        blockCopy);
    document.addEventListener("cut",         blockCut);
    document.addEventListener("dragstart",   blockDrag);
    document.addEventListener("touchstart",  onTouchStart,    { passive: false });
    document.addEventListener("touchend",    cancelLongPress, { passive: true });
    document.addEventListener("touchmove",   cancelLongPress, { passive: true });
    document.addEventListener("touchcancel", cancelLongPress, { passive: true });

    return () => {
      cancelLongPress();
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown",     blockKeys);
      document.removeEventListener("copy",        blockCopy);
      document.removeEventListener("cut",         blockCut);
      document.removeEventListener("dragstart",   blockDrag);
      document.removeEventListener("touchstart",  onTouchStart);
      document.removeEventListener("touchend",    cancelLongPress);
      document.removeEventListener("touchmove",   cancelLongPress);
      document.removeEventListener("touchcancel", cancelLongPress);
    };
  }, [enabled]);
}
