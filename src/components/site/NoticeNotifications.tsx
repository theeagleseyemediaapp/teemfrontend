import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { playEagleHasLanded } from "../../lib/audio-alerts";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api/v1";
const STORAGE_KEY = "eem_seen_public_notif_ids_v1";

export function NoticeNotifications() {
  const isInitialLoadRef = useRef(true);

  const { data: notifications } = useQuery({
    queryKey: ["public-notifications"],
    queryFn: () => fetch(`${API_BASE}/public/notifications`).then((r) => (r.ok ? r.json() : null)),
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  // Notification permission is requested only on user intent (e.g. clicking the Header notification bell)

  useEffect(() => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return;
    }

    if (typeof window === "undefined") return;

    let seenIds: string[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) seenIds = parsed;
      }
    } catch (e) {
      seenIds = [];
    }

    const newItems = notifications.filter((item: any) => item.id && !seenIds.includes(item.id));

    // If this is the very first check after landing on the site and the user has NO stored IDs (e.g., clean cache or first visit),
    // seed existing IDs without spamming redundant toasts or old notifications.
    // However, if we already have a stored list of seen IDs (or if new content drops while they browse), any unread ID is a newly published broadcast!
    const isFirstTimeVisitor = seenIds.length === 0;

    if (newItems.length > 0) {
      // Save updated seen list (capped to 100 IDs)
      const allIds = Array.from(new Set([...seenIds, ...notifications.map((n: any) => n.id)])).slice(0, 100);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
      } catch (e) {
        console.warn("[NoticeNotifications] Storage save failed:", e);
      }

      // Trigger alerts only when it's dynamically published mid-session.
      // We NEVER show toasts on the initial load because that causes old missed alerts 
      // to "drop in bulk" onto the screen.
      if (!isInitialLoadRef.current) {
        // 1. User-Facing CNN-style audio chime & speech broadcast ("The Eagle's Eye has landed!")
        playEagleHasLanded("The Eagle's Eye has landed! New breaking updates from Parliament.");

        // 2. Push interactive native & toast alerts (limit to latest 2 to prevent overwhelming screen)
        newItems.slice(0, 2).forEach((item: any) => {
          const title = item.title || "T.E.E.Media Broadcast";
          const body =
            item.alertBody ||
            (item.type === "article"
              ? "A new parliamentary news report has just been published."
              : "An official communique has been issued by Parliament.");

          // Native OS / Browser Push Notification
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              const nativeNotif = new Notification(title, {
                body,
                tag: item.id, // Prevent duplicate desktop alerts
                icon: "/favicon.png",
              });
              nativeNotif.onclick = (e) => {
                e.preventDefault();
                window.focus();
                if (item.type === "article" && item.slug) {
                  window.location.href = `/article/${item.slug}`;
                } else if (item.type === "alert") {
                  window.dispatchEvent(new CustomEvent("open-alert-modal", { detail: item }));
                }
              };
            } catch (err) {
              console.warn("[NoticeNotifications] Native notification error:", err);
            }
          }

          // Sonner Toast with actionable click handler
          toast(title, {
            description: body,
            duration: 10_000,
            action: {
              label: item.type === "article" ? "Read Article" : "View Notice",
              onClick: () => {
                if (item.type === "article" && item.slug) {
                  window.location.href = `/article/${item.slug}`;
                } else if (item.type === "alert") {
                  window.dispatchEvent(new CustomEvent("open-alert-modal", { detail: item }));
                }
              },
            },
          });
        });
      }
    }

    isInitialLoadRef.current = false;
  }, [notifications]);

  return null;
}
