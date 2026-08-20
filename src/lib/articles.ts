// Single source of truth for article content. Real photos sourced from the
// newsroom; all images live on the Lovable CDN via .asset.json pointers so
// nothing ships in-repo binary-side.

import chamberWomenAsset from "@/assets/real/chamber-women-mps.jpg.asset.json";
import chamberWide1Asset from "@/assets/real/chamber-wide-1.jpg.asset.json";
import chamberWide2Asset from "@/assets/real/chamber-wide-2.jpg.asset.json";
import chamberWide3Asset from "@/assets/real/chamber-wide-3.jpg.asset.json";
import speakerAsset from "@/assets/real/speaker-datouo.jpg.asset.json";
import honAngelAsset from "@/assets/real/hon-toukam-angel.jpg.asset.json";
import honNgalleAsset from "@/assets/real/hon-ngalle-daniel.jpg.asset.json";

const chamberWomen = chamberWomenAsset.url;
const chamberWide1 = chamberWide1Asset.url;
const chamberWide2 = chamberWide2Asset.url;
const chamberWide3 = chamberWide3Asset.url;
const speaker = speakerAsset.url;
const honAngel = honAngelAsset.url;
const honNgalle = honNgalleAsset.url;

export type Category =
  | "Parliament"
  | "National Assembly"
  | "Senate"
  | "Politics"
  | "Government"
  | "Economy"
  | "Opinion"
  | "Video"
  | "Plenaries"
  | "Committee Echoes"
  | "Networking"
  | "Parliamentary Diplomacy"
  | "Parliamentary Missions"
  | "Constituency Actions"
  | "Interviews"
  | "Bills/Laws";

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: Category;
  image: string;
  author: string;
  timeAgo: string;
  live?: boolean;
  featured?: boolean;
  body?: string[];
}

export const articles: Article[] = [
  // --- LEAD / FEATURED ----------------------------------------------------
  {
    slug: "women-mps-take-the-floor-historic-plenary",
    title: "Women MPs Take the Floor in a Historic Plenary at the National Assembly",
    summary:
      "A united delegation of female parliamentarians addressed the House on women's representation in budgetary committees, drawing applause from across the political spectrum.",
    category: "Plenaries",
    image: chamberWomen,
    author: "Marie Ngono",
    timeAgo: "1 hour ago",
    featured: true,
    body: [
      "More than thirty women MPs lined up at the central rostrum on Friday afternoon for a coordinated address that organisers described as the first of its kind in the current legislature.",
      "Speaking in turn, the lawmakers raised the under-representation of women on the Budget and Foreign Affairs committees and called for binding quotas in the upcoming reform of the Assembly's standing orders.",
      "Right Honourable Datouo Théodore, Speaker of the Cameroon National Assembly, presided over the session and granted the delegation an extended speaking window of forty minutes.",
      "The Eagle's Eye Media will publish the full intervention list and committee replies in its next triweekly print edition.",
    ],
  },
  {
    slug: "live-plenary-session-national-assembly",
    title: "LIVE: National Assembly Plenary — Follow Rolling Updates",
    summary: "Live feed and rolling text updates from the chamber as MPs debate the finance bill.",
    category: "Plenaries",
    image: chamberWide1,
    author: "Newsroom",
    timeAgo: "Now",
    live: true,
  },

  // --- PLENARIES ----------------------------------------------------------
  {
    slug: "plenary-resumes-after-committee-week",
    title: "Plenary Resumes After Committee Week with Packed Agenda",
    summary:
      "The full House returns to consider the finance bill, two ratifications and a controversial review of municipal funding.",
    category: "Plenaries",
    image: chamberWide2,
    author: "Estelle Fotso",
    timeAgo: "3 hours ago",
  },
  {
    slug: "plenary-roll-call-quorum-secured",
    title: "Plenary Roll Call: Quorum Secured Despite Regional Absences",
    summary:
      "The Speaker confirmed quorum at 168 members, allowing debate to open on the disputed redistricting text.",
    category: "Plenaries",
    image: chamberWide3,
    author: "Jean-Paul Eko",
    timeAgo: "5 hours ago",
  },

  // --- COMMITTEE ECHOES ---------------------------------------------------
  {
    slug: "budget-committee-grills-public-works-minister",
    title: "Budget Committee Grills Public Works Minister on Road Overruns",
    summary:
      "Members say overruns on the Yaoundé-Douala corridor threaten medium-term fiscal targets unless oversight is tightened.",
    category: "Committee Echoes",
    image: chamberWide2,
    author: "Arlette Mbarga",
    timeAgo: "4 hours ago",
  },
  {
    slug: "foreign-affairs-committee-anglophone-dialogue",
    title: "Foreign Affairs Committee Reviews Anglophone Dialogue Roadmap",
    summary:
      "Closed-door briefing covers diaspora consultations and timelines for regional reconciliation forums.",
    category: "Committee Echoes",
    image: chamberWide1,
    author: "Henriette Bessala",
    timeAgo: "Yesterday",
  },
  {
    slug: "standing-committees-quarterly-review",
    title: "Standing Committees Begin Quarterly Review of Ministerial Action",
    summary:
      "Eight committees will summon ministers to answer for the execution of programmes funded in the first half of the year.",
    category: "Committee Echoes",
    image: chamberWide3,
    author: "Marie Ngono",
    timeAgo: "2 days ago",
  },

  // --- NETWORKING ---------------------------------------------------------
  {
    slug: "speaker-receives-diplomatic-corps",
    title: "Speaker Receives Diplomatic Corps Ahead of Year-End Session",
    summary:
      "Right Honourable Datouo Théodore met heads of mission from twelve countries to brief them on the legislative calendar.",
    category: "Networking",
    image: speaker,
    author: "Newsroom",
    timeAgo: "6 hours ago",
  },
  {
    slug: "mps-host-civil-society-roundtable",
    title: "MPs Host Civil Society Roundtable on Anti-Corruption Reforms",
    summary:
      "Twenty-five organisations were invited to the Assembly's networking lounge to discuss asset declarations.",
    category: "Networking",
    image: chamberWide1,
    author: "Samuel Atangana",
    timeAgo: "Yesterday",
  },

  // --- PARLIAMENTARY DIPLOMACY -------------------------------------------
  {
    slug: "cameroon-delegation-pan-african-parliament",
    title: "Cameroon Delegation Leads Discussion at Pan-African Parliament",
    summary:
      "MPs intervened on continental free movement and reciprocal trade safeguards during the Midrand session.",
    category: "Parliamentary Diplomacy",
    image: chamberWide2,
    author: "Charles Mvondo",
    timeAgo: "2 days ago",
  },
  {
    slug: "bilateral-friendship-group-rwanda",
    title: "Bilateral Friendship Group with Rwanda Reactivated",
    summary:
      "Following the Speaker's Kigali visit, the friendship group will resume joint working sessions in October.",
    category: "Parliamentary Diplomacy",
    image: speaker,
    author: "Henriette Bessala",
    timeAgo: "3 days ago",
  },

  // --- PARLIAMENTARY MISSIONS --------------------------------------------
  {
    slug: "fact-finding-mission-far-north",
    title: "Fact-Finding Mission Deploys to the Far North",
    summary:
      "A cross-party group will assess the security and humanitarian situation in three border departments.",
    category: "Parliamentary Missions",
    image: chamberWide3,
    author: "Jean-Paul Eko",
    timeAgo: "Yesterday",
  },
  {
    slug: "oversight-mission-public-hospitals",
    title: "Oversight Mission Tours Reference Public Hospitals",
    summary:
      "MPs from the Social Affairs committee inspect medication stocks and unpaid staff arrears in Yaoundé and Bamenda.",
    category: "Parliamentary Missions",
    image: chamberWide1,
    author: "Estelle Fotso",
    timeAgo: "4 days ago",
  },

  // --- CONSTITUENCY ACTIONS ----------------------------------------------
  {
    slug: "hon-ngalle-launches-school-fund",
    title: "Hon. Ngalle Daniel Etongo Launches Constituency School Fund",
    summary:
      "The MP committed personal allowances to a back-to-school kit programme reaching 1,200 pupils.",
    category: "Constituency Actions",
    image: honNgalle,
    author: "Marie Ngono",
    timeAgo: "1 day ago",
  },
  {
    slug: "hon-toukam-water-points-handover",
    title: "Hon. Toukam Tela Angel Hands Over New Water Points",
    summary:
      "Four boreholes inaugurated in the West Region under the lawmaker's micro-projects budget.",
    category: "Constituency Actions",
    image: honAngel,
    author: "Arlette Mbarga",
    timeAgo: "2 days ago",
  },
  {
    slug: "rural-electrification-pledges-tracked",
    title: "Rural Electrification Pledges Tracked Across 47 Constituencies",
    summary:
      "Our newsroom matches campaign-trail commitments against ENEO and rural electrification agency rollouts.",
    category: "Constituency Actions",
    image: chamberWide2,
    author: "Charles Mvondo",
    timeAgo: "3 days ago",
  },

  // --- INTERVIEWS ---------------------------------------------------------
  {
    slug: "interview-speaker-on-budget-priorities",
    title: "Interview: Speaker Datouo on the 2025 Budget Priorities",
    summary:
      "The Speaker outlines the calendar for the budget session and explains the procedural innovations introduced this year.",
    category: "Interviews",
    image: speaker,
    author: "Editorial Desk",
    timeAgo: "2 days ago",
  },
  {
    slug: "interview-hon-toukam-women-representation",
    title: "Interview: Hon. Toukam Tela Angel on Women's Representation",
    summary:
      "The MP discusses quota proposals, mentorship programmes and her caucus' next legislative moves.",
    category: "Interviews",
    image: honAngel,
    author: "Marie Ngono",
    timeAgo: "3 days ago",
  },
  {
    slug: "interview-hon-ngalle-on-constituency-work",
    title: "Interview: Hon. Ngalle Daniel Etongo on Constituency-First Politics",
    summary:
      "From feeder roads to school kits, the MP defends a hands-on approach to grassroots representation.",
    category: "Interviews",
    image: honNgalle,
    author: "Samuel Atangana",
    timeAgo: "4 days ago",
  },

  // --- BILLS / LAWS -------------------------------------------------------
  {
    slug: "finance-law-2025-adopted",
    title: "Finance Law 2025 Adopted After Twelve-Hour Plenary",
    summary:
      "MPs passed the 7,318 billion FCFA budget late on Friday following debate over allocations to defence and rural development.",
    category: "Bills/Laws",
    image: chamberWide1,
    author: "Marie Ngono",
    timeAgo: "6 hours ago",
    body: [
      "The National Assembly on Friday evening adopted the 2025 Finance Law in a 158-to-32 vote.",
      "Opposition MPs criticised an opaque allocation to special funds; the majority defended the text as a balanced response to security pressures.",
      "The bill now moves to the Senate, which is expected to begin its review on Monday.",
    ],
  },
  {
    slug: "anti-corruption-bill-second-reading",
    title: "Anti-Corruption Bill Reaches Second Reading",
    summary:
      "Tougher asset declarations for public officials — including parliamentarians — are at the heart of the new text.",
    category: "Bills/Laws",
    image: chamberWide2,
    author: "Samuel Atangana",
    timeAgo: "Yesterday",
  },
  {
    slug: "vp-bill-constitutional-revision",
    title: "VP Bill: Constitutional Revision Clears Committee Stage",
    summary:
      "The proposed text would restore the office of Vice-President. Our political desk unpacks the stakes.",
    category: "Bills/Laws",
    image: speaker,
    author: "Dr. Pauline Ndongo",
    timeAgo: "2 days ago",
  },

  // --- OPINION ------------------------------------------------------------
  {
    slug: "opinion-parliament-transparency",
    title: "Opinion: Parliament Must Be More Transparent to the Public",
    summary:
      "Live-streaming sessions and publishing voting records are simple steps that would rebuild public trust.",
    category: "Opinion",
    image: honNgalle,
    author: "Etienne Bilong",
    timeAgo: "2 days ago",
  },
  {
    slug: "opinion-press-freedom-parliament",
    title: "Opinion: Press Freedom Is the Oxygen of Parliamentary Democracy",
    summary:
      "Independent reporting on debates and committees is not a luxury — it is what makes accountability possible.",
    category: "Opinion",
    image: honAngel,
    author: "Prof. Daniel Owono",
    timeAgo: "5 days ago",
  },

  // --- SENATE / NATIONAL ASSEMBLY -----------------------------------------
  {
    slug: "senate-confirms-three-governors",
    title: "Senate Confirms Three New Regional Governors",
    summary:
      "Upper house clears nominations for the Centre, Littoral and North-West with broad cross-party support.",
    category: "Senate",
    image: chamberWide3,
    author: "Jean-Paul Eko",
    timeAgo: "6 hours ago",
  },
  {
    slug: "national-assembly-recess-bills-pending",
    title: "National Assembly Recess: Key Bills Left Pending",
    summary:
      "Lawmakers leave Yaoundé with at least nine major texts still awaiting debate when sessions resume.",
    category: "National Assembly",
    image: chamberWide2,
    author: "Estelle Fotso",
    timeAgo: "Yesterday",
  },

  // --- POLITICS / GOVERNMENT / ECONOMY -----------------------------------
  {
    slug: "ministerial-reshuffle-rumours",
    title: "Ministerial Reshuffle Rumours Intensify Ahead of October",
    summary:
      "Sources inside the presidency suggest a limited cabinet adjustment focused on the economic portfolio.",
    category: "Government",
    image: speaker,
    author: "Jean-Paul Eko",
    timeAgo: "Today",
  },
  {
    slug: "central-bank-reserves-rebound",
    title: "Central Bank Reports Rebound in Regional Reserves",
    summary:
      "Latest BEAC figures show foreign exchange reserves climbing back above the three-month import-cover threshold.",
    category: "Economy",
    image: chamberWide1,
    author: "Arlette Mbarga",
    timeAgo: "Today",
  },
  {
    slug: "youth-employment-charter-debate",
    title: "Lawmakers Debate New Youth Employment Charter",
    summary:
      "Draft text proposes tax incentives for firms hiring under-30s and a national apprenticeship guarantee.",
    category: "Politics",
    image: chamberWide3,
    author: "Samuel Atangana",
    timeAgo: "4 days ago",
  },
];

// --- Selectors --------------------------------------------------------------
export const bySlug = (slug: string) => articles.find((a) => a.slug === slug);
export const byCategory = (cat: Category) => articles.filter((a) => a.category === cat);
export const lead = articles.find((a) => a.featured) ?? articles[0];
export const liveStory = articles.find((a) => a.live) ?? articles[0];
export const topStories = articles.slice(0, 4);
export const parliamentToday = [
  ...byCategory("Plenaries"),
  ...byCategory("Committee Echoes"),
].slice(0, 4);
export const mostRead = articles.slice(1, 6);

// Latest headlines suitable for the breaking-news ticker.
export const tickerHeadlines = (limit = 8): string[] => {
  const liveOnes = articles.filter((a) => a.live).map((a) => `LIVE: ${a.title}`);
  const recent = articles
    .filter((a) => !a.live)
    .slice(0, limit)
    .map((a) => a.title);
  return [...liveOnes, ...recent];
};
