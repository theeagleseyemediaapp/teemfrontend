import { useActiveAlert, usePublishedHeadlines } from "@/lib/api";



export function BreakingTicker() {
  const headlines = usePublishedHeadlines();
  const activeAlert = useActiveAlert();

  const rawItems = (Array.isArray(headlines.data) ? headlines.data : [])
    .filter((h: { alert?: boolean }) => h.alert)
    .slice(0, 10)
    .map((h: { title: string }) => h.title);

  const rawFallback = (Array.isArray(headlines.data) ? headlines.data : [])
    .slice(0, 5)
    .map((h: { title: string }) => h.title);

  const notice = activeAlert.data;
  const isBreakingNotice = notice?.severity === "breaking";

  const noticeText = notice ? `${notice.title}${notice.body ? ` • ${notice.body}` : ""}` : "";
  const noticeLoop = (noticeText && !isBreakingNotice) ? [noticeText, noticeText, noticeText, noticeText] : [];

  let breakingItems = [...rawItems];

  if (isBreakingNotice && noticeText) {
    breakingItems.unshift(noticeText);
  }

  if (breakingItems.length === 0) {
    breakingItems = [...rawFallback];
  }

  const display = breakingItems;
  const loop = [...display, ...display];

  if (!loop.length && !notice) return null;

  return (
    <div className="border-b border-gold-dark/40 overflow-hidden">
      {notice?.id && noticeLoop.length ? (
        <div className="bg-navy text-white overflow-hidden">
          <div className="mx-auto max-w-7xl flex items-stretch overflow-hidden">
            <span className="shrink-0 bg-gold text-navy text-[0.65rem] font-black tracking-[0.24em] uppercase px-3 py-1.5 flex items-center select-none">
              Notice
            </span>
            <div className="relative flex-1 overflow-hidden h-8">
              <div className="ticker-track-notice absolute flex whitespace-nowrap py-1.5 text-sm font-semibold h-full">
                {noticeLoop.map((text, i) => (
                  <span key={i} className="flex items-center gap-3 px-4 h-full text-gold">
                    <span className="inline-block h-1 w-1 rounded-full bg-gold/70 flex-shrink-0" />
                    <span>{text}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {loop.length > 0 ? (
        <div className="bg-gold text-navy overflow-hidden">
          <div className="mx-auto max-w-7xl flex items-stretch overflow-hidden">
            <span className="shrink-0 bg-navy text-white text-[0.7rem] font-bold tracking-widest uppercase px-3 py-1.5 flex items-center">
              Breaking
            </span>
            <div className="relative flex-1 overflow-hidden h-8">
              <div className="ticker-track absolute flex whitespace-nowrap py-1.5 text-sm font-semibold tracking-wide h-full">
                {loop.map((t: string, i: number) => (
                  <span key={i} className="flex items-center gap-2 px-4 h-full">
                    <span className="inline-block h-1 w-1 rounded-full bg-navy/70 flex-shrink-0" />
                    <span className="whitespace-nowrap">{t}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
