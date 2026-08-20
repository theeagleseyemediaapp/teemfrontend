import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useArticles } from "@/lib/api";

export const Route = createFileRoute("/awards")({
  head: () => ({
    meta: [
      { title: "The Eagle's Eye Parliamentary Awards — Legislative Excellence in Cameroon" },
      { name: "description", content: "Discover the official recipients and honorees of The Eagle's Eye Parliamentary Excellence Awards, recognizing outstanding lawmakers, impactful networks, and transformative governance in Cameroon." },
      { name: "keywords", content: "The Eagle's Eye Awards, Cameroon Parliamentary Awards, parliamentary honors Cameroon, legislative excellence Yaoundé, best MP Cameroon, lawmaker awards" },
      { property: "og:title", content: "The Eagle's Eye Parliamentary Awards — Cameroon" },
      { property: "og:description", content: "Celebrating outstanding legislative performance, parliamentary diplomacy, and social impact in Cameroon's Parliament." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theeagleseyemedia.com/awards" },
      { property: "og:image", content: "https://theeagleseyemedia.com/logo.png" },
      { property: "og:image:alt", content: "The Eagle's Eye Parliamentary Awards" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Eagle's Eye Parliamentary Awards" },
      { name: "twitter:description", content: "Honoring legislative rigor and exemplary parliamentary leadership in Cameroon." },
      { name: "twitter:image", content: "https://theeagleseyemedia.com/logo.png" },
    ],
    links: [{ rel: "canonical", href: "/awards" }],
  }),
  component: AwardsPage,
});

function AwardsPage() {
  const { data: articles = [] } = useArticles();

  // Find the migrated cover images from our DB articles if they exist, otherwise fallback
  const firstAwardArticle = articles.find((a: any) => a.slug === "the-eagles-eye-award");
  const secondAwardArticle = articles.find((a: any) => a.slug === "hon-njume-peter-ambangs-parliamentary-network-emerges-cameroons-most-impactful-of-2025");

  const firstImage = firstAwardArticle?.coverImage || "https://theeagleseyemedia.com/wp-content/uploads/2026/01/PHOTO-2025-11-11-12-32-00-2-1024x683.jpg";
  const secondImage = secondAwardArticle?.coverImage || "https://theeagleseyemedia.com/wp-content/uploads/2026/01/PHOTO-2025-08-20-08-57-03-1024x682.jpg";

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb Header */}
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
        <nav className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-navy hover:underline">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/about" className="hover:text-navy hover:underline">About Us</Link>
          <ChevronRight className="size-3" />
          <span className="font-semibold text-navy">The Eagle's Eye Awards 2025</span>
        </nav>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-navy mt-4 mb-2">
          The Eagle's Eye Awards 2025
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Recognizing outstanding performance, legislative rigor, and transformative social impact in Cameroon's Parliament.
        </p>
      </div>

      {/* Main Awards Content */}
      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-12">
        
        {/* Award Category 1 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-lg">
          <div className="grid md:grid-cols-12 gap-0">
            {/* Image section */}
            <div className="md:col-span-5 relative h-64 md:h-auto bg-slate-950">
              <img 
                src={firstImage} 
                alt="Foreign Affairs Committee" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
            </div>

            {/* Content Section */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h2 className="font-serif font-black text-2xl text-navy">
                  Most Active Committee of 2025
                </h2>
                <div className="inline-block border-l-2 border-gold pl-3 text-slate-700 font-semibold text-sm">
                  Foreign Affairs Committee — Cameroon National Assembly
                  <span className="block text-xs text-muted-foreground font-normal mt-0.5">Chaired by Hon. Banmi Emmanuel</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Honoured for outstanding contribution to parliamentary diplomacy, legislative scrutiny, and international engagement. Throughout the 2025 parliamentary year, the Committee distinguished itself as a vital interface between the Cameroon National Assembly and the international community.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  It demonstrated exceptional consistency in examining international agreements, treaties, and cooperation frameworks, ensuring that Cameroon’s foreign engagements aligned with national interests and constitutional requirements.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Awarded Dec 2025</span>
                <Link 
                  to="/article/$slug"
                  params={{ slug: "the-eagles-eye-award" }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-gold transition-colors hover:underline"
                >
                  Read Full Article
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Award Category 2 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-lg">
          <div className="grid md:grid-cols-12 gap-0">
            {/* Content Section (Left on large screens) */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-4 order-2 md:order-1">
              <div className="space-y-3">
                <h2 className="font-serif font-black text-2xl text-navy">
                  Cameroon's Most Impactful Parliamentary Network
                </h2>
                <div className="inline-block border-l-2 border-gold pl-3 text-slate-700 font-semibold text-sm">
                  Parliamentary Caucus on Health Financing
                  <span className="block text-xs text-muted-foreground font-normal mt-0.5">Founded & Chaired by Hon. Njume Peter Ambang</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  In a year marked by pressing public health challenges and rising expectations for legislative leadership, Hon. Njume Peter Ambang has distinguished himself as the architect of Cameroon’s most active, results-driven and influential parliamentary network of 2025.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Through the Caucus, Hon. Ambang has transformed parliamentary advocacy from routine oversight into a powerful engine for national health reform, yielding measurable outcomes such as increased health budget allocations, malaria elimination investments, and the creation of the Multisectoral Committee for Health.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Awarded Dec 2025</span>
                <Link 
                  to="/article/$slug"
                  params={{ slug: "hon-njume-peter-ambangs-parliamentary-network-emerges-cameroons-most-impactful-of-2025" }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-gold transition-colors hover:underline"
                >
                  Read Full Article
                </Link>
              </div>
            </div>

            {/* Image section */}
            <div className="md:col-span-5 relative h-64 md:h-auto bg-slate-950 order-1 md:order-2">
              <img 
                src={secondImage} 
                alt="Hon. Njume Peter Ambang" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
            </div>
          </div>
        </div>

      </div>

      {/* Back to Home Button */}
      <div className="text-center mt-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-navy text-white px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-gold hover:text-navy transition-all duration-300 shadow-md"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
