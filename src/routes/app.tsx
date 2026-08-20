import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Smartphone } from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Download The Eagle's Eye Mobile App — iOS & Android" },
      { name: "description", content: "Download the official The Eagle's Eye Media mobile app for Android and iOS. Real-time Cameroon parliamentary breaking news, live plenary video streaming, bill tracking, and offline digital magazine editions." },
      { name: "keywords", content: "The Eagle's Eye app, Cameroon news app, Cameroon parliament mobile app, APK download Cameroon, live TV app Cameroon, political news app Yaoundé" },
      { property: "og:title", content: "Download The Eagle's Eye Mobile App — Android & iOS" },
      { property: "og:description", content: "Real-time parliamentary breaking news, live plenary video streaming, bill tracking, and offline digital magazines." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/app" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Mobile App" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Download The Eagle's Eye Mobile App" },
      { name: "twitter:description", content: "Live plenary TV, bill tracking, and breaking news alerts directly on your phone." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/app" }],
  }),
  component: AppDownloadPage,
});

function AppDownloadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-navy/10 text-navy shadow-inner">
        <Smartphone className="h-8 w-8 text-navy" />
      </div>
      <h1 className="font-serif text-3xl font-black text-navy sm:text-4xl leading-tight">
        Download Mobile App
      </h1>
      <p className="mt-4 text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
        Get the official The Eagle's Eye Media app to track bills, watch live plenaries, and access premium reports directly on your device.
      </p>

      <div className="mt-8 rounded-xl border border-gold/30 bg-gold/5 p-6 sm:p-8 text-left shadow-sm">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-navy">
          <AlertCircle className="h-5 w-5 text-gold shrink-0" />
          Internal Testing Instructions
        </h2>
        
        <p className="mt-3 text-xs text-slate-700 leading-relaxed font-bold">
          ⚠️ Crucial Requirement:
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          Google Play Console requires that your Google Account email be explicitly added to our testers list first. If your email is not on the list, the Play Store will show a "404 / Item Not Found" error.
        </p>

        <ol className="mt-5 list-decimal pl-4 text-xs text-slate-600 space-y-2.5">
          <li>
            Provide your Google Play Store email to the administrator to be added to the testers list.
          </li>
          <li>
            Once your email is added, tap the button below to join the internal testing group.
          </li>
          <li>
            Accept the testing invite, then follow the link on that page to download and install the app directly from the Google Play Store.
          </li>
        </ol>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center items-center">
        {/* Official Google Play Badge — from Google */}
        <a
          href="https://play.google.com/apps/internaltest/4701345533715163417"
          target="_blank"
          rel="noreferrer"
          aria-label="Get it on Google Play"
          className="transition-transform hover:scale-[1.03] active:scale-[0.98] drop-shadow-md"
        >
          <img
            src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
            alt="Get it on Google Play"
            width="220"
            height="85"
            className="h-[64px] w-auto"
          />
        </a>

        <Link
          to="/"
          className="inline-flex items-center justify-center rounded border border-navy/20 px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy transition-colors hover:bg-navy/5"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
