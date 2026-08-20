import { useEffect, useRef } from "react";

export function ParliamentReelsCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // EmbedSocial Script Injection matching the exact snippet provided
    (function(d: Document, s: string, id: string) {
      let js = d.getElementById(id) as HTMLScriptElement | null;
      if (!js) {
        js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://embedsocial.com/cdn/ht.js";
        js.onload = () => {
          if (containerRef.current && (window as any).EMBEDSOCIALHASHTAG?.getEmbedData) {
            (window as any).EMBEDSOCIALHASHTAG.getEmbedData(
              "8a5f1426bd58dcd96f4cf6c647ac2927498f2d78",
              containerRef.current
            );
          }
        };
        d.getElementsByTagName("head")[0]?.appendChild(js);
      } else {
        // If script is already in head on SPA route navigation, trigger widget population
        if (containerRef.current && (window as any).EMBEDSOCIALHASHTAG?.getEmbedData) {
          (window as any).EMBEDSOCIALHASHTAG.getEmbedData(
            "8a5f1426bd58dcd96f4cf6c647ac2927498f2d78",
            containerRef.current
          );
        }
      }
    })(document, "script", "EmbedSocialHashtagScript");
  }, []);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="embedsocial-hashtag w-full min-h-[480px] overflow-hidden"
        data-ref="8a5f1426bd58dcd96f4cf6c647ac2927498f2d78"
        data-dynamicload="yes"
      >
        <a
          className="feed-powered-by-es feed-powered-by-es-feed-img es-widget-branding"
          href="https://embedsocial.com/"
          target="_blank"
          rel="noopener noreferrer"
          title="Widget by EmbedSocial"
        >
          <img
            src="https://embedsocial.com/cdn/icon/embedsocial-logo.webp"
            alt="EmbedSocial"
          />
          <div className="es-widget-branding-text">Widget by EmbedSocial</div>
        </a>
      </div>
    </div>
  );
}
